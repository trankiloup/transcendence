import { Body, Injectable, InternalServerErrorException, NotFoundException, Req, Res } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Request, Response} from 'express';
import { matchEntity, matchStatus, matchType } from '../Entities/OneVsOneMatch.entity';
import { userIdLoginDto } from 'src/user/Dto/userIdLogin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { roomDto } from '../Dto/room.dto';
import { typeDto } from '../Dto/typeDto.dto';
import { playerPosition } from '../Interface/player-position.interface';
import { MatchInfo } from '../Interface/matchInfo.interface';
import { PlayerTournamentInfo } from '../Interface/playerTournamentInfo.interface';
import { User } from 'src/user/Entities/user.entity';
import { finalistLogin } from 'src/sockets/global/Interfaces/finalistLogin.interface';
import { roomNumberDto } from '../Dto/roomNumber.dto';
import { inviteUserId } from '../Interface/inviteUserId.dto';

@Injectable()
export class MatchmakingService {

    constructor(
        @InjectRepository(matchEntity) private matchRepository : Repository<matchEntity>,
        private userService : UserService
        ){}


    //return true if player can acces this match section (not already engage in another one)
    async registerMatch(
        @Req() req: Request,
        @Body() type : typeDto) : Promise<boolean>
    {
        const user: userIdLoginDto = await this.userService.extractIdLoginFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')

        try {
            //search if user already queuing for this match or another match type
            let findMatch = await this.isPlayerQueuing(user.login)
            if (findMatch)
            {
                if (findMatch.matchType === type.type && findMatch.finished === false)
                {
                    return true
                }
                if (findMatch.matchType !== type.type && findMatch.finished === false)
                    return false
            }
            // search if he can join another queue already created
            findMatch = await this.findAMatch(type.type)
            
            if (findMatch)
            {
                await this.addPlayerToQueue(findMatch, user)
                await this.setMatchFull(findMatch)
                return true
            }

            //if no match found, create one
            await this.createNewQueueMatch(user, type)
            return true
        }
        catch (error)
        {
            throw new InternalServerErrorException('Error matchmaking database')
        }
    }

    async isPlayerQueuing(login : string): Promise<matchEntity>
    {
        let findMatch = await this.matchRepository.findOne({
            where : {
                    player1_login : login, finished: false
            }
        })
        if (!findMatch)
        {
            findMatch = await this.matchRepository.findOne({
                where : { player2_login : login, finished : false}
            })
        }
        if (!findMatch)
        {
            findMatch = await this.matchRepository.findOne({
                where : { player3_login : login, finished : false}
            })
        }
        if (!findMatch)
        {
            findMatch = await this.matchRepository.findOne({
                where : { player4_login : login, finished : false}
            })
        }
        if (findMatch)
        {
            return findMatch
        }

        return null
    }


    // try to find a available player to join
    async findAMatch(type : string): Promise<matchEntity>
    {
        const freeMatchs : matchEntity[]= await this.matchRepository.find({where:{
            full:false, started:false
        }})
        //s'il trouve un match libre, cherche s'il correspond au type donne
        if (freeMatchs && freeMatchs[0])
        {
            const match = freeMatchs.filter((match) => match.matchType === type)
            if (match)
            {
                return match[0]
            }
        }
        return null
    }

    //complete the queue
    async addPlayerToQueue(match :matchEntity, user :userIdLoginDto): Promise<matchEntity>
    {

        if (match.player1_login === "")
        {
            match.player1_id = user.id
            match.player1_login = user.login
        }
        else if (match.player2_login === "")
        {
            match.player2_id = user.id
            match.player2_login = user.login
        }
        else if (match.matchType === matchType.TOURNAMENT && match.player3_login === "")
        {
            match.player3_id = user.id
            match.player3_login = user.login
        }
        else if (match.matchType === matchType.TOURNAMENT && match.player4_login === "")
        {
            match.player4_id = user.id
            match.player4_login = user.login
        }
        else
            return null
        const savedQueue = await this.matchRepository.save(match)
        return savedQueue
    }

    // if all player fill queue, set match full
    async setMatchFull(match : matchEntity)
    {
        if (match.player1_login === "" || match.player2_login === "")
            return
        if (match.matchType === matchType.TOURNAMENT && (match.player3_login === "" ||
            match.player4_login === ""))
            return
        match.full = true
        await this.matchRepository.save(match)
        
        if (match.matchType === matchType.TOURNAMENT)
            this.createTournament(match)
    }


    async createTournament(match : matchEntity)
    {
        const tournament_id = match.match_id
        match.tournament_id = tournament_id
        match.matchStatus = matchStatus.GLOBAL
        match.finished = true
        await this.matchRepository.save(match)

        let match1 : matchEntity = new matchEntity()
        match1.full = true
        match1.matchType = matchType.TOURNAMENT
        match1.player1_id = match.player1_id
        match1.player1_login = match.player1_login
        match1.player2_id = match.player2_id
        match1.player2_login = match.player2_login
        match1.tournament_id = match.tournament_id
        match1.matchStatus = matchStatus.MATCH1
        await this.matchRepository.save(match1)

        let match2 : matchEntity = new matchEntity()
        match2.full = true
        match2.matchType = matchType.TOURNAMENT
        match2.player1_id = match.player3_id
        match2.player1_login = match.player3_login
        match2.player2_id = match.player3_id
        match2.player2_login = match.player4_login
        match2.tournament_id = tournament_id
        match2.matchStatus = matchStatus.MATCH2
        await this.matchRepository.save(match2)

        let final : matchEntity = new matchEntity()
        final.full = true
        final.matchType = matchType.TOURNAMENT
        final.tournament_id = tournament_id
        final.matchStatus = matchStatus.FINAL
        await this.matchRepository.save(final)
    }



    //create a new match
    async createNewQueueMatch(user : userIdLoginDto, type : typeDto): Promise<matchEntity>
    {
            const newQueue = new matchEntity()
            newQueue.player1_id = user.id;
            newQueue.player1_login = user.login;
            newQueue.created = new Date();
            if (type.type === 'PVP')
                newQueue.matchType = matchType.PVP
            else if (type.type === 'TOURNAMENT')
            {
                newQueue.matchType = matchType.TOURNAMENT
                newQueue.matchStatus = matchStatus.GLOBAL
            }
            else if (type.type === 'OTHER')
                newQueue.matchType = matchType.OTHER
            else
            {
                newQueue.matchType = matchType.NONE
                console.log('Matchmaking error on type while creating')
            }

            let savedQueue = await this.matchRepository.save(newQueue)
            
            while (savedQueue.match_id < 5)
            {
                await this.matchRepository.delete(newQueue)
                savedQueue = await this.matchRepository.save(newQueue)
            }
       
            if (!savedQueue)
                throw new InternalServerErrorException('Error while creating queue in dabatase')
            if (savedQueue.matchType === matchType.TOURNAMENT)
            {
                savedQueue.tournament_id = savedQueue.match_id
                
                await this.matchRepository.save(newQueue)
            }
            return savedQueue
    }



    //remove player from queue
    //delete queue if empty
    async removePlayerFromQueue(login : string)
    {
        let findMatch = await this.matchRepository.findOne({
            where : { player1_login : login}
        })
        if (findMatch && findMatch.started === false && findMatch.matchType != matchType.TOURNAMENT)
        {
            // findMatch.full = false
            findMatch.player1_id = 0,
            findMatch.player1_login = ''
            await this.matchRepository.save(findMatch)
            await this.ifQueueEmptyThenDelete(findMatch)

            return
        }

        findMatch = await this.matchRepository.findOne({
            where : { player2_login : login}
        })
        if (findMatch && findMatch.started === false && findMatch.matchType != matchType.TOURNAMENT)
        {
            // findMatch.full = false
            findMatch.player2_id = 0,
            findMatch.player2_login = ''
            await this.matchRepository.save(findMatch)
            await this.ifQueueEmptyThenDelete(findMatch)
            return
        }


        findMatch = await this.matchRepository.findOne({
            where : { player3_login : login}
        })
        if (findMatch && findMatch.started === false && findMatch.matchType != matchType.TOURNAMENT)
        {
            // findMatch.full = false
            findMatch.player3_id = 0,
            findMatch.player3_login = ''
            await this.matchRepository.save(findMatch)
            await this.ifQueueEmptyThenDelete(findMatch)
        }
    }


    async removePlayerFromQueueTournament(login : string)
    {
        let findMatch = await this.matchRepository.findOne({
            where : { player1_login : login, finished : false, full : false}
        })
        if (findMatch && findMatch.started === false)
        {
            findMatch.full = false
            findMatch.player1_id = 0,
            findMatch.player1_login = ''
            await this.matchRepository.save(findMatch)
            await this.ifQueueEmptyThenDelete(findMatch)
            return
        }

        findMatch = await this.matchRepository.findOne({
            where : { player2_login : login, finished : false, full : false}
        })
        if (findMatch && findMatch.started === false)
        {
            findMatch.full = false
            findMatch.player2_id = 0,
            findMatch.player2_login = ''
            await this.matchRepository.save(findMatch)
            await this.ifQueueEmptyThenDelete(findMatch)
            return
        }


        findMatch = await this.matchRepository.findOne({
            where : { player3_login : login, finished : false, full : false}
        })
        if (findMatch && findMatch.started === false)
        {
            findMatch.full = false
            findMatch.player3_id = 0,
            findMatch.player3_login = ''
            await this.matchRepository.save(findMatch)
            await this.ifQueueEmptyThenDelete(findMatch)
        }


        findMatch = await this.matchRepository.findOne({
            where : { player4_login : login, finished : false, full : false}
        })
        if (findMatch && findMatch.started === false)
        {
            findMatch.full = false
            findMatch.player3_id = 0,
            findMatch.player4_login = ''
            await this.matchRepository.save(findMatch)
            await this.ifQueueEmptyThenDelete(findMatch)
        }
    }


   async  ifQueueEmptyThenDelete(match : matchEntity)
    {
        if (!match)
            return
        if (match.matchType !== matchType.TOURNAMENT)
        {
            if (match.player1_login === "" && match.player2_login === "")
                await this.matchRepository.delete(match)
            if ((match.player1_login === "" || match.player2_login === "") && match.full === true)
            {
                await this.matchRepository.remove(match)
            }
        }
        else if (match.player1_login === "" && match.player2_login === "" && match.player3_login === "" && match.player4_login === "")
            await this.matchRepository.delete(match)
    }

    async getRoom(@Req() req: Request) : Promise <number>
    {
        const user :userIdLoginDto =  await this.userService.extractIdLoginFromReq(req)
        if (!user)
            throw new NotFoundException( "User not found")
        const match = await this.isPlayerQueuing(user.login)
        if (match && match.matchType === matchType.TOURNAMENT)
            return this.findPlayerTournamentMatch(user.login, match)
        else if (match && match.finished === false)
        {
            if (match.matchType === matchType.OTHER || match.matchType === matchType.PVP)
                return match.match_id
            else
                return this.findPlayerTournamentMatch(user.login, match)
        }
        return 0
    }

    async findPlayerTournamentMatch(login, match : matchEntity) : Promise <number>
    {
        const match1 :matchEntity[]= await this.matchRepository.find({
            where : {matchStatus : matchStatus.MATCH1, finished : false}
        })
        if (match1)
        {
            for (const found of match1)
            {
                if (found.player1_login === login || found.player2_login === login)
                    return found.match_id
            }
        }

        const match2 : matchEntity[] =  await this.matchRepository.find(
            { where : {matchStatus : matchStatus.MATCH2, finished : false}})
        {
            if (match2)
            {
                for (const found of match2)
                {
                    if (found.player1_login === login || found.player2_login === login)
                        return found.match_id
                }
            }
        }

        const final : matchEntity[] =  await this.matchRepository.find(
            { where : {matchStatus : matchStatus.FINAL, finished : false}})
        {
            if (final)
            {
                for (const found of final)
                {
                    if (found.player1_login === login || found.player2_login === login)
                    {
                        return found.match_id
                    }
                    else
                        console.log('matchmaking final : Match not found')
                }
            }
        }
        console.log('Match making match not found')
        return 0
    }

    async removeFromQueue(@Req() req:Request)
    {
        const user :userIdLoginDto =  await this.userService.extractIdLoginFromReq(req)
        if (!user)
            throw new NotFoundException( "User not found")
        if (user && user.login)
        {
            await this.removePlayerFromQueue(user.login)
        }
    }

    async removeFromQueueTournament(@Req() req:Request)
    {
        const user :userIdLoginDto =  await this.userService.extractIdLoginFromReq(req)
        if (!user)
            throw new NotFoundException( "User not found")
        if (user && user.login)
            await this.removePlayerFromQueueTournament(user.login)
    }


    //delete match (when finished)
    async deleteRoom( @Body() room : roomDto)
    {
        const roomId = parseInt(room.room)
        const match = await this.matchRepository.findOneBy({match_id :roomId})
        if (match && match.matchType != matchType.TOURNAMENT)
        {
            this.matchRepository.remove(match)
        }
    }


    //for popup, if player joins or create game
    async pvpJoinOrCreate( @Req() req:Request, @Body() type : typeDto, @Res() res: Response)
    {
        const user : userIdLoginDto = await this.userService.extractIdLoginFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')
        let matchFound : matchEntity = await this.isPlayerQueuing(user.login)
        if (matchFound)
        {
            if (matchFound.matchType === type.type)
            {
                return res.send({message : 'join'})
            }
            else
                return res.send({message : 'not available'})
        }
        matchFound = await this.findAMatch(type.type)
        if (matchFound)
        {
            return res.send({message : 'join'})
        }
        return res.send({message : 'create'})
    }

    //for popup, if player joins or create game
    async matchJoinOrCreate( @Req() req:Request, @Body() type : typeDto, @Res() res: Response)
    {
        const user : userIdLoginDto = await this.userService.extractIdLoginFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')
        let matchFound : matchEntity = await this.isPlayerQueuing(user.login)
        if (matchFound)
        {
            if (matchFound.matchType === type.type)
            {
                return res.send({message : 'cancel'})
            }
            else
                return res.send({message : 'not available'})
        }
        matchFound = await this.findAMatch(type.type)
        if (matchFound)
        {
            return res.send({message : 'join'})
        }

        return res.send({message : 'create'})
    }

    async GetPlayerPosition(match : matchEntity, login : string) : Promise<playerPosition>
    {
        let player : playerPosition = new playerPosition()

        if (match.matchType !== matchType.TOURNAMENT)
        {
            if (match.player1_login === login)
            {
                player.position = 1
                return player
            }
            else if (match.player2_login === login)
            {
                player.position = 2
                return player
            }
            else
            {
                player.position = 0
                return player
            }
        }

        let tournaments = await this.matchRepository.find({where : {
            matchType : matchType.TOURNAMENT, finished : false
        }})
        {
            for (const tournament of tournaments)
            {
                if (tournament.matchStatus === matchStatus.MATCH1)
                {
                    if (tournament.player1_login === login)
                    {
                        player.position = 1
                        player.gameStatus = 'MATCH1'
                        return player
                    }
                    else if (tournament.player2_login === login)
                    {
                        player.position = 2
                        player.gameStatus = "MATCH1"
                        return player
                    }
                }
                else if (tournament.matchStatus === matchStatus.MATCH2)
                {
                    if (tournament.player1_login === login)
                    {
                        player.position = 1
                        player.gameStatus = 'MATCH2'
                        return player
                    }
                    else if (tournament.player2_login === login)
                    {
                        player.position = 2
                        player.gameStatus = "MATCH2"
                        return player
                    }
                }
            }
        }

        let final = await this.matchRepository.findOne({ where : {
            matchType : matchType.TOURNAMENT, finished : false, matchStatus : matchStatus.FINAL
        }})
        if (final)
        {
            if (final.player1_login === login)
            {
                player.position = 1
                player.gameStatus = "FINAL"
                return player
            }
            else if (final.player2_login === login)
                {
                    player.position = 2
                    player.gameStatus =  "FINAL"
                    return player
                }
        }
        player.position = 0
        return player
    }

    async getPlayer(@Req() req: Request) : Promise <playerPosition>
    {
        const user = await this.userService.extractUserFromReq(req)

        if (!user)
            throw new NotFoundException ('User not found')

        let match = await this.isPlayerQueuing(user.login)
        if (!match)
        {
            match = await this.getLastPlayerTournament(user)
            if (!match)
                return null
        }
        
        
        let player = await this.GetPlayerPosition(match, user.login)
        
        player.username = user.username
        player.type = match.matchType
        if (match.matchType === matchType.TOURNAMENT)
            player.globalRoomId = match.tournament_id
        else
            player.globalRoomId = -1
        return player
    }

    //patch for last player a global match is set to finished
    async getLastPlayerTournament(user : User) : Promise<matchEntity>
    {
        const matchs = await this.matchRepository.find({where : {
            matchType : matchType.TOURNAMENT, finished : false
        }})

        if (!matchs)
            return null
        for (const match of matchs)
        {
            if (match.player1_login === user.login)
                return match
            if (match.player2_login === user.login)
                return match
        }

    }


    async matchStarted(@Req() req: Request, @Body() room : roomDto)
    {
        const roomId : number = parseInt(room.room)
        const matchfound = await this.matchRepository.findOneBy({ match_id : roomId})
        if (matchfound)
        {
            matchfound.started = true
            await this.matchRepository.save(matchfound)
        }

    }

    async isMatchFull(@Req() req : Request) : Promise<boolean>
    {
        const user =await this.userService.extractIdLoginFromReq(req)
        if (!user)
            return false
        const match = await this.isPlayerQueuing(user.login)
        if (!match)
            return false
        // if (match.matchType === matchType.TOURNAMENT && match.full === true)
        //     return true

        if (match.matchType === matchType.TOURNAMENT && match.full === true)
        {
            // match.finished = true
            await this.matchRepository.save(match)
            return true
        }
        return false
    }


    async tournamentUpdateScores(room : string, leftplayerScore : number, rightplayerScore : number)
    {
        const match = await this.matchRepository.findOne({ where : {
            match_id : +room
        }})
        if (!match)
        {
            console.log('Error trying to register tournament score')
            return 0
        }
        match.player1_score = leftplayerScore
        match.player2_score = rightplayerScore
        match.finished = true
        this.matchRepository.save(match)
        return match.tournament_id
    }

    async registerToFinal(globalRoom : string, finalist : finalistLogin) 
    {
        const match = await this.matchRepository.findOne({where : {
            matchType : matchType.TOURNAMENT, matchStatus : matchStatus.FINAL, tournament_id : +globalRoom
        }})

        if (!match)
        {
            console.log('Final match not found')
            return
        }
        match.player1_login = finalist.firstFinalist
        match.player2_login = finalist.secondFinalist

        await this.matchRepository.save(match)



    }

    async getPlayerTournamentInfo(@Req() req: Request) : Promise <PlayerTournamentInfo>
    {

        let playerInfo = new PlayerTournamentInfo()
        const user = await this.userService.extractUserFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')
        const match = await this.isPlayerQueuing(user.login)
        if(!match)
            return await this.checkWaitingForFinal(user, playerInfo)
        if (match.matchType != matchType.TOURNAMENT)
        {
            playerInfo.registered = false
            playerInfo.wrongpage = true
            return playerInfo
        }

        playerInfo.registered = true
        playerInfo.wrongpage = false
        playerInfo.globalRoomId = match.tournament_id
        if(match.full === false)
        {
            playerInfo.gameFull = false
            playerInfo.gameReady = false
            return playerInfo
        }

        playerInfo.gameReady = true
        playerInfo.gameFull = true
        return playerInfo
    }

    async checkWaitingForFinal (user : User, playerInfo : PlayerTournamentInfo) : Promise<PlayerTournamentInfo>
    {
        //check if not register for final yet, but is expected
        const tournaments = await this.matchRepository.find({where : {finished :false, matchStatus : matchStatus.FINAL}})
        if (!tournaments)
        {
            playerInfo.registered = false
            return playerInfo
        }
        for (const tournement of tournaments)
        {
            let id = tournement.tournament_id
            let matchs : matchEntity[] = await this.matchRepository.find({ where : {tournament_id : id}})
            {
                let match1 : matchEntity
                let match2 : matchEntity
                let final : matchEntity
                for (const match of matchs)
                {
                    
                    if (match.matchStatus === matchStatus.MATCH1)
                        match1 = match
                    else if (match.matchStatus === matchStatus.MATCH2)
                    {

                        match2 = match
                    }
                    else if (match.matchStatus === matchStatus.FINAL)
                        final = match
                }
                // if (final.player1_login === user.login)
                // {
                    if (match1.finished === true)
                    {
                        if (match1.player1_login === user.login)
                        {
                            if (match1.player1_score > match1.player2_score)
                               {
                                    playerInfo.gameFull = true
                                    playerInfo.registered = true
                                    playerInfo.globalRoomId = match1.tournament_id
                                    playerInfo.gameReady = false
                                    return playerInfo
                               }
                        }
                        else if (match1.player2_login === user.login)
                        {
                            if (match1.player1_score < match1.player2_score)
                            {
                                playerInfo.gameFull = true
                                playerInfo.registered = true
                                playerInfo.globalRoomId = match1.tournament_id
                                playerInfo.gameReady = false
                                return playerInfo
                            }  
                        }
                    }
                    else if (match2.finished === true)
                    {
                        if (match2.player1_login === user.login)
                        {
                            if (match2.player1_score > match2.player2_score)
                            {
                                playerInfo.gameFull = true
                                playerInfo.registered = true
                                playerInfo.globalRoomId = match2.tournament_id
                                playerInfo.gameReady = false
                                return playerInfo
                            }
                        }
                        else if (match2.player2_login === user.login)
                        {
                            if (match2.player1_score < match2.player2_score)
                            {
                                playerInfo.gameFull = true
                                playerInfo.registered = true
                                playerInfo.globalRoomId = match2.tournament_id
                                playerInfo.gameReady = false
                                return playerInfo
                            }
                        }
                    }
                // }
            }
        }
        playerInfo.registered = false
        return playerInfo
    }

    async getTournamentRoom(@Req() req:Request,  room : roomDto) : Promise<roomDto>
    {
        const match = await this.matchRepository.findOne({where : {match_id : +room.room}})
        let globalroom = new roomDto()
        if (match)
        {
            globalroom.room = match.tournament_id.toString()
            return globalroom
        }
        globalroom.room = '0'
        return globalroom
    }

    async getMatchInfo(globalroom : string) : Promise<MatchInfo>
    {
        let matchInfo = new MatchInfo()

        let matchs : matchEntity =  await this.matchRepository.findOne({
            where :{
                tournament_id : +globalroom,
                matchStatus : matchStatus.GLOBAL
            }})

        if (!matchs)
            return matchInfo
        matchInfo.player1_login = matchs.player1_login
        matchInfo.player2_login = matchs.player2_login
        matchInfo.player3_login = matchs.player3_login
        matchInfo.player4_login = matchs.player4_login

        matchInfo.player1 = await this.userService.getUsernameFromLogin(matchInfo.player1_login)
        matchInfo.player2 = await this.userService.getUsernameFromLogin(matchInfo.player2_login)
        matchInfo.player3 = await this.userService.getUsernameFromLogin(matchInfo.player3_login)
        matchInfo.player4 = await this.userService.getUsernameFromLogin(matchInfo.player4_login)

        matchInfo.tournamentRoom = matchs.tournament_id.toString()


        let allMatches : matchEntity[] = await this.matchRepository.find({where : {tournament_id : +globalroom}})
        if (allMatches.length ===4)
        {
            for (const match of allMatches)
            {
                if (match.matchStatus === matchStatus.FINAL)
                {
                    if (match.player1_login)
                    {
                        matchInfo.finisher1_login = match.player1_login
                        matchInfo.finisher1 = await this.userService.getUsernameByLogin(match.player1_login)
                    }
                    if (match.player2_login)
                    {
                        matchInfo.finisher2_login = match.player2_login
                        matchInfo.finisher2 = await this.userService.getUsernameByLogin(match.player2_login)
                    }
                    matchInfo.scoreFinaleFinisher1 = match.player1_score
                    matchInfo.scoreFinaleFinisher2 = match.player2_score
                    matchInfo.finalCancel = match.canceled
                    matchInfo.finalFinished = match.finished
                    matchInfo.finaleRoom = match.match_id.toString()
                }

                if (match.matchStatus === matchStatus.MATCH1)
                {
                    matchInfo.scorePlayer1 = match.player1_score
                    matchInfo.scorePlayer2 = match.player2_score
                    matchInfo.match1finished = match.finished
                    matchInfo.match1Cancel = match.canceled
                }


                if (match.matchStatus === matchStatus.MATCH2)
                {
                    matchInfo.scorePlayer3 = match.player1_score
                    matchInfo.scorePlayer4 = match.player2_score
                    matchInfo.match2Finished = match.finished
                    matchInfo.match2Cancel = match.canceled
                }
            }
        }
        return matchInfo
    }

    async deleteAllQueues()
    {
        const matchs : matchEntity[] = await this.matchRepository.find()
        if (!matchs)
            return
        for (const match of matchs)
            await this.matchRepository.remove(match)
    }


////////////////////////////RTS GAME /////////////////////////////////////

    async rpsAvailable(@Req() req: Request, @Res() res:Response)
    {
        const user = await this.userService.extractUserFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')
        const match = await this.isPlayerQueuing(user.login)
        if (match)
        {
            if (match.matchType != matchType.OTHER)
                return res.send({message: 'false'})
            return res.send({message : 'ingame'})
        }
        return res.send({message : 'true'})
    }


    async rpsRegister(@Req() req: Request) : Promise<playerPosition>
    {
        const user = await this.userService.extractUserFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')

        const player : playerPosition = new playerPosition()

        const matchfound = await this.isPlayerQueuing(user.login)
        if (matchfound)
        {
            if (matchfound.matchType != matchType.OTHER)
                return null
            else
            {
                player.username = await this.userService.getUsernameFromLogin(user.login)
                player.globalRoomId = matchfound.match_id
                player.type = 'OTHER'
                player.rtsRank = matchfound.rtsRank
                if (matchfound.player1_login === user.login)
                    player.position = 1
                else
                    player.position = 2
                return player
            }
        } 

        let rank = 0
        if (user.rtsRank < -2)
            rank = -1
        else if (user.rtsRank > 2)
            rank = 1
        let match = await this.rpsSearchGame(rank)
        if (!match)
            match = await this.rpsCreateMatch(user)
        else
            match = await this.rpsJoinMatch(user, match)


        if (match.player1_login === user.login)
            player.position = 1
        else
            player.position = 2
        player.username = await this.userService.getUsernameFromLogin(user.login)
        player.rtsRank = user.rtsRank
        player.type = 'OTHER'
        player.globalRoomId = match.match_id

        return player
    }

    async rpsGetMePlayer(@Req() req:Request) : Promise<playerPosition>
    {
        const user = await this.userService.extractUserFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')

        let match = await this.matchRepository.findOne({
            where : {
                player1_login : user.login,
                matchType : matchType.OTHER,
                finished : false
            }
        })
        if (!match)
        {
            match = await this.matchRepository.findOne({
                where : {
                    player2_login : user.login,
                    matchType : matchType.OTHER,
                    finished : false
                }
            })
        }
        if (!match)
            return null
        else
        {
            let rank = 0
            if (user.rtsRank < -2)
                rank = -1
            else if (user.rtsRank > 2)
                rank = 1
            let player : playerPosition = new playerPosition
            player.globalRoomId =  match.match_id
            player.username = await this.userService.getUsernameFromLogin(user.login)
            player.rtsRank = rank
            player.type = 'OTHER'
            return player

        }
    }

    async rpsCreateMatch(user : User) : Promise<matchEntity>
    {
        let match : matchEntity = new matchEntity()
        match.player1_id = user.id
        match.player1_login = user.login
        match.matchType = matchType.OTHER
        
        let rank = 0
        if (user.rtsRank < -2)
            rank = -1
        else if (user.rtsRank > 2)
            rank = 1
        match.rtsRank = rank
        await this.matchRepository.save(match)
        return match
    }

    async rpsJoinMatch(user : User, match : matchEntity) : Promise<matchEntity>
    {
        if (match.player1_login === "")
        {
            match.player1_id = user.id
            match.player1_login = user.login
        }
        else
        {
            match.player2_id = user.id
            match.player2_login = user.login
        }
        match.full = true
        await this.matchRepository.save(match)
        return match
    }


    async rpsSearchGame(rank : number) : Promise<matchEntity>
    {
        const match  = await this.matchRepository.findOne({
            where : {
                matchType : matchType.OTHER,
                finished : false,
                full : false,
                rtsRank : rank
            }
        })
        return match
    }


    async rpsIsGameFull(@Res() req: Request, @Body() room :roomNumberDto) : Promise<boolean>
    {
        const match = await this.matchRepository.findOneBy({match_id : room.room})
        if (match)
        {
            if (match.player1_login != "" && match.player2_login != "")
                return true
        }
        return false
    }


    async rpsUnregister(@Res() req: Request, @Body() room :roomNumberDto) 
    {

        const user = await this.userService.extractUserFromReq(req)
        if (!user)
            throw new NotFoundException('User not found')
        let match : matchEntity = await this.matchRepository.findOneBy({match_id : room.room})
        if (match && match.started === false)
        {
            if (match.player1_login === user.login)
            {
                match.player1_id = 0
                match.player1_login = ""
            }
            else if(match.player2_login === user.login)
            {
                match.player2_id = 0
                match.player2_login = ""
            }
            await this.matchRepository.save(match)
            if (match.player1_login === "" && match.player2_login === "")
                await this.matchRepository.remove(match)

        }
    }

    async setMatchStarted(room : number)
    {
        const match = await this.matchRepository.findOneBy({match_id : room})
        if (match)
        {
            match.started = true
            await this.matchRepository.save(match)
        }
    }

    async deletematchMaking(room : number)
    {
        const match = await this.matchRepository.findOneBy({match_id : room})
        if (match)
            await this.matchRepository.remove(match)
    }


    async registerInvite(@Req() req : Request, @Body() userId: inviteUserId, @Res() res: Response)
    {
        const UserMe = await this.userService.extractUserFromReq(req)
        if (!UserMe)
            throw new NotFoundException('User not found')

        let match = await this.isPlayerQueuing(UserMe.login)
        if (match)
            return res.send({message : 'You cannot invite someone, you are already committed to a game.'})

        const UserInvited = await this.userService.findUserById(userId.userId)
        if (!UserInvited)
            throw new NotFoundException('User not found')

        if (UserInvited.status != 'ONLINE')
            return res.send({message : 'This player is not available'})

        match = await this.isPlayerQueuing(UserInvited.login)
        if (match)
            return res.send({message : 'This player is not available'})

        let newMatch = new matchEntity()
        newMatch.player1_id = UserMe.id
        newMatch.player1_login = UserMe.login
        newMatch.player2_id = UserInvited.id
        newMatch.player2_login = UserInvited.login
        newMatch.matchType = matchType.PVP
        newMatch.full = true
        await this.matchRepository.save(newMatch)
        return res.send({message : 'ok'})
    }


    async pvpDeleteRoom(room : string)
    {
        const match :matchEntity = await this.matchRepository.findOneBy({match_id : +room})
        if (match.matchType === matchType.PVP)
            await this.matchRepository.remove(match)
    }
}
