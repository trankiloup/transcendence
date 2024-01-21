import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { tournament } from "./tournament";
import { GlobalSocketService } from "./global-socket.service";
import { MatchInfo } from "src/game/Interface/matchInfo.interface";
import { finalistLogin } from "./Interfaces/finalistLogin.interface";
import { tournamentNameScore } from "./Interfaces/tournamentNameScore.interface";
import { TournementScoreLogin } from "./Interfaces/tournamentScoreLogin.interface";
import { MatchResult } from "src/game/Interface/matchResult.interface";

// @WebSocketGateway({cors: {origin : ['*']}, namespace : 'global'}) 
@WebSocketGateway({cors: {origin : ['https://localhost:4200', 'https://localhost:3000']}, namespace : 'global'}) 
export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect{

    constructor(private globalSocketService : GlobalSocketService){}

    @WebSocketServer()
    server : Server


    // map avec pour cle le login et pour valeur un tableau de ses sockets. Exemple :
    //margot => [ 'socket0', 'socket1' ]
    //marc => [ 'socket0' ]
    private usersMap = new Map<string, Array<Socket>>()


    // for tournament, register one common room for the 4 players
    // 3 => mbobin, sbrand, pmieuzet, cmieuzet  (tournament 1)
    // 4 => mbihan                              ( tournament 2)  
    private roomsMap = new Map<string, Array<string>>()


    // for tournament : register an instance of the tournament,
    // with all tournament informations
    // 3 => tournament
    private gameMap = new Map<string, tournament>()


    async handleConnection(client: Socket, ...args: any[]) {
    }

    //if client is registered, add client socket to usermap
    // ex userMap   => pmieuzet [socket 1, socket 2]
    //              => mbihan [socket 1]
    // grace au socket.id, on peut faire joindre ou quitter des room au client sur tous ses onglets                    
    @SubscribeMessage('connection')
    newConnection(client : Socket, data :{login : string})
    {
        let map = this.usersMap.get(data.login)
        if (map)
        {
            map.push(client)
            this.usersMap.set(data.login, map)
        }
        else
        {
            let newArray : Array<Socket> = []
            newArray.push(client)
            this.usersMap.set(data.login, newArray)
            this.setUserOnline(data.login)
        }
        this.ClientjoinAllHisRoom(client, data.login)
    }

    //on disconnection, remove client socket from usermap
    // if client map is empty(all tabs close) remove client from map
    // ex : avant deconnection : pmieuzet [socket 1, socket 2]
    //      apres                pmieuzet [socket 2]
    // si plus de socket, retire pmieuzet de la liste des utilisateurs
    async handleDisconnect(client: any) {
        this.usersMap.forEach((sockets, login) => {
            for (const socket of sockets)
            {
                if (socket.id === client.id)
                {
                    const index = sockets.indexOf(socket)
                    if ( index > -1)
                    {
                        sockets.splice(index, 1)
                        if (sockets.length === 0)
                        {
                         
                            this.usersMap.delete(login)
                            this.wait2SecondsBeforLogout(login)
                        }
                        else
                            this.usersMap.set(login, sockets)
                        return
                    }
                }
            }
        })  
    }

    lastSocketConnected()
    {
        if (this.usersMap.size === 0)
            this.globalSocketService.removeAllQueues()
    }


    
    //quand un client se connecte, rejoint toutes ses rooms enregistrees dans room maps
    // ex : pmieuzet se reconnecte ou ouvre un nouvel onglet :
    // va chercher dans la liste des rooms le login pmieuzet, si ca trouve, rejoint la room
    ClientjoinAllHisRoom(client : Socket, clientLogin : string)
    {
        this.roomsMap.forEach((logins, room) => {
            for (const login of logins)
            {
                if (login === clientLogin)
                    client.join(room)
            }
        })
    }

    //ajoute un login dans la liste des rooms
    // ex   avant room[3] = pmieuzet
    //      apres room[3] = pmieuzet, mbihan
    addLoginToRoomMap(login : string, room : string)
    {
        let map = this.roomsMap.get(room)
        if (map)
        {
            map.push(login)
            this.roomsMap.set(room, map)
        }
        else
        {
            let arrLogin : Array<string> = []
            arrLogin.push(login)
            this.roomsMap.set(room, arrLogin)
        }
    }



    removeClientFromJoinedRoom(login : string, room : string)
    {  

        const clientSockets : Socket[]= this.usersMap.get(login)
        if (clientSockets)
        {
            for (const client of clientSockets)
            {
                if (client.rooms.has(room))
                {
                    client.leave(room)
                }
            }
        }
    }

    //////////////// Invite to a game ///////////////////////

    @SubscribeMessage('invite')
    sendInvite(client : Socket, data :{login : string, invited : string})
    {
        
        const userSockets = this.usersMap.get(data.invited)
        if (!userSockets)
            return
        for (const socket of userSockets)
        {
            this.server.to(socket.id).emit('inviteGame')
        }
    }




    //////////////// User Status ///////////////////////////////////////
   
    //give time for client to reconnect(if F5 for exemple)
    wait2SecondsBeforLogout(login : string)
    {
        setTimeout(() => {
            if (!this.usersMap.has(login))
                this.setUserOffline(login)
        }, 2000)
    }

    async setUserOffline(login : string)
    {
        await this.globalSocketService.setUserOffline(login)
        this.emitUserList()
        this.lastSocketConnected()
    }

    async setUserOnline(login : string)
    {
        await this.globalSocketService.setUserOnline(login)
        this.emitUserList()
    }


    @SubscribeMessage('logout')
    logout(client : Socket, data : {login : string})
    {
        if (this.usersMap.has(data.login))
        {
            this.usersMap.delete(data.login)
        }
        this.emitUserList()
    }

    // will tell user socket to update its list
    emitUserList()
    {
        this.server.emit('update userlist')
    }


    /////////////////////// TOURNAMENT //////////////////////////////////

    @SubscribeMessage('Register tournament')
    registerPlayerToTournament(client : Socket, data : {login : string, room : string})
    {
        // this.removeClientPreviousRooms(data.login, data.room)
        this.addLoginToRoomMap(data.login, data.room)
        this.ClientjoinAllHisRoom(client, data.login)
        this.createJoinTournament(data.room)
    }

    // //remove client previous room, except the one he needs to join
    // removeClientPreviousRooms(clientlogin, currentRoom)
    // {
    //     const sockets = this.usersMap.get(clientlogin)
    //     if (!sockets)
    //         return
    //     for (const socket of sockets)
    //     {
    //         for (const room of socket.rooms)
    //         {
    //             if (room != currentRoom)
    //                 socket.leave(room)
    //         }
    //     }

    //     this.roomsMap.forEach((logins, room) => {
    //         if (room != currentRoom)
    //         {
    //             for (const login of logins)
    //             {
    //                 if (login === clientlogin)
    //                 {
    //                     const index = logins.indexOf(login)
    //                     if ( index > -1)
    //                     {
    //                         sockets.splice(index, 1)
    //                         if (sockets.length === 0)
    //                         {
    //                             this.roomsMap.delete(currentRoom)
    //                         }
    //                         else
    //                             this.roomsMap.set(room, logins)
    //                         return
    //                     }
    //                 }
    //             }
    //         }
    //     } )
    // }
    
    createJoinTournament(room : string)
    {
        let newtournament : tournament
        if (!this.gameMap.has(room))
        {
            newtournament = new tournament(room, this.globalSocketService)
            this.gameMap.set(room, newtournament)
        }
        newtournament = this.gameMap.get(room)
        
        if (!newtournament)
        {
            console.log('Global socket error on create new tournament')
            return
        }

        this.emitMatchInfo(room, newtournament)
    }

    async emitMatchInfo(room : string, tournament : tournament)
    {
        const info : MatchInfo = await this.globalSocketService.getMatchInfo(room)
        if (info)
        {
            tournament.setInfo(info)
            const matchInfo = tournament.getNameScores()
            this.server.to(room).emit('update players', matchInfo)
        }
    }


    @SubscribeMessage('Remove from global room')
    RemoveFromRoom(client : Socket, data : {'login' : string, 'room' : string})
    {
        //remove player from room
        this.roomsMap.forEach((logins,room) =>{
            const index = logins.indexOf(data.login)
            if (index > -1)
            {
                logins.splice(index, 1)
                if (logins.length === 0)
                    this.roomsMap.delete(room)
                else
                    this.roomsMap.set(room, logins)
                return

            }
        })

        //remove player from tournament
        let match = this.gameMap.get(data.room)
        if (match)
            match.removePlayer(data.login)
        if (match && match.isTournamentEmpty())
            this.gameMap.delete(data.room)
    
    }



    @SubscribeMessage('Get players')
    getInfo(client : Socket, data :{'room' : string})
    {
        const game : tournament = this.gameMap.get(data.room)
        if (game)
            this.emitMatchInfo(data.room, game)
   
    }


    //send a message to every player inside the room, to every open tab they have
    @SubscribeMessage('Match ready')
    matchReady(client : Socket, data : {'room' : string})
    {
        this.server.to(data.room).emit('goGame', true)
        const match = this.gameMap.get(data.room)
        if (match)
            match.startTimeLimit(data.room)
    }


    async emitGoToFinalists(game : tournament, globalRoom : string)
    {
        const finalist : finalistLogin = game.getFinalist()

        await this.globalSocketService.registerFinalist( globalRoom, finalist)
        
        const player1 : Socket[]= this.usersMap.get(finalist.firstFinalist)
        if (player1)
        {
            for (const socket of player1)
            {
                if (!socket.rooms.has(finalist.finalRoom))
                    socket.join(finalist.finalRoom)
        
            }
        }
        const player2 : Socket[] = this.usersMap.get(finalist.secondFinalist)
        if (player2)
        {
            for (const socket of player2)
            {
                if (!socket.rooms.has(finalist.finalRoom))
                {
                    socket.join(finalist.finalRoom)
                }
            }
        }

        this.server.to(finalist.finalRoom).emit('goGame', true)
    }


    @SubscribeMessage('TournamentEndMatch')
    endOfMatch(client : Socket, data: {'room' : string, 'globalroom' : string, login : string, 'result' : MatchResult})
    {

        let game : tournament = this.gameMap.get(data.globalroom)
        if (!game)
        {
            console.log('Global socket, game not found')
            return
        }

        game.setMatchResult(data.result)
        const matchinfo : tournamentNameScore = game.getNameScores()
        this.server.to(data.globalroom).emit('update players', matchinfo)

        if (game.isFinalReadY() && game.getFinalEmitted() ===  false)
        {
            game.setFinalEmitted()
            const matchinfo : tournamentNameScore = game.getNameScores()
            this.server.to(data.globalroom).emit('update players', matchinfo)
            this.lauchFinal(data.globalroom, game)
        }
    }

    async lauchFinal( globalroom : string, game : tournament)
    {
        this.emitGoToFinalists(game, globalroom)
        game.setTournamentFinished()
        return
   }

    @SubscribeMessage('TournamentEndFinal')
    endOfFinal(client : Socket, data: {'room' : string, 'globalroom' : string, login : string, 'result' : MatchResult})
    {

        let game : tournament = this.gameMap.get(data.globalroom)
        if (!game)
        {
            console.log('Global socket, game not found')
            return
        }

        game.setMatchResult(data.result)
        
        const matchinfo : tournamentNameScore = game.getNameScores()
        this.server.to(data.globalroom).emit('update players', matchinfo)

        const tournamentScore : TournementScoreLogin= game.getTournamentScore()
        if (!game.getRegistered())
        {
            game.setRegistered()
            this.globalSocketService.registerScore(tournamentScore)
        }
        this.server.to(data.globalroom).emit('endOfTournament')
    }

    //donne la room du dernier match pour affiche une sorte d'historique
    @SubscribeMessage('previsous Score')
    showPreviousScore(client : Socket, data :{login : string})
    {
        let lastRoom : string = '0'
        if (!this.roomsMap)
            return
        this.roomsMap.forEach((logins, room) => {
            for (const login of logins)
            {
                if (login === data.login)
                {
                    if (room > lastRoom)
                        lastRoom = room
                }
            }
        })
        if (lastRoom != '0')
        {
            const game = this.gameMap.get(lastRoom)
            if (game)
            {
            
                const score = game.getNameScores()
                this.server.to(client.id).emit('update players', score)
            }
        }
    }
}