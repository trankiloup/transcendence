import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server , Socket} from 'socket.io'
import { positions } from './Interface/positions.interface';
import { score } from './Interface/score.interface';
import { CurrentGame } from './current-game';
import { playerPosition } from 'src/game/Interface/player-position.interface';
import { playersUsername } from './Interface/players-username.interface';
import { GameSocketService } from './game-socket.service';
import { getScore } from './Interface/getScore.interface';


@WebSocketGateway({cors: {origin : ['https://localhost:4200', 'https://localhost:3000']}, namespace : 'game'})


export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private gameSocketService : GameSocketService){}
  // private started : boolean = false

  private interval : any

  curentgame : Map<string, CurrentGame> = new Map<string, CurrentGame>

  // private delay(ms: number) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }


  @WebSocketServer()
    server: Server


  handleConnection(client: any, ...args: any[]) {
  }

  handleDisconnect(client: any) {
    this.removeClientFromRoom(client)
    // client.to(client.id).emit("quit")
  }

  @SubscribeMessage('exit')
  clientLeaves(client : Socket, data:{room : string})
  {
    if (data && data.room && client.rooms.has(data.room))
    {
      client.leave(data.room)
    }
    this.areAllClientLeft(data.room)
  }

  @SubscribeMessage('player')
  updatePlayerInfo(client : Socket, data:{room :string, player : playerPosition, login : string})
  {
    const game = this.curentgame.get(data.room)
    let players : playersUsername
    if (game)
    {
      game.updateUsername(data.player, data.login)
      // players  = game.getPlayerUsername()
      // this.server.to(data.room).emit("updateplayer", players)
      this.emitPlayers(data.room, game)
    }
  }


  emitPlayers(room : string, game : CurrentGame)
  {
    if (game)
    {
      const players : playersUsername = game.getPlayerUsername()
      this.server.to(room).emit("updateplayer", players)

    }
  }

  removeClientFromRoom(client : Socket)
  {
      this.curentgame.forEach((value, key) => {
          this.areAllClientLeft(key)
      })
      if (this.curentgame.size === 0 && this.interval)
      {
        clearInterval(this.interval)
        this.interval = null
      }

  }

  async areAllClientLeft(room : string)
  {
    const nbclient = await this.server.in(room).fetchSockets()
    if (nbclient.length === 0)
    {
      const game = this.curentgame.get(room)
      if (game)
      {
        this.setPlayersOnline(game)
        // this.server.emit('delete room', room)
        this.gameSocketService.deleteGame(room)
        this.curentgame.delete(room)
      }
    }
  }

  
  @SubscribeMessage('join')
  async handleMessage(client: Socket, data :{room : string, login : string, player : playerPosition}){

    //leave previous room
    const rooms = client.rooms
    for (const room of rooms)
    {
      if (room !== data.room)
        await client.leave(room)
    }

    //join room
    if(!client.rooms.has(data.room))
      client.join(data.room)

    let newGame : CurrentGame
    //create a instance of game for the room which will calculate all positions
    if (this.curentgame.has(data.room))
    {
      newGame = this.curentgame.get(data.room)
      }
    else
    {
      newGame = new CurrentGame(this.gameSocketService)
      this.curentgame.set(data.room, newGame)
      newGame = this.curentgame.get(data.room)
    }
    newGame.updateUsername(data.player, data.login)

    //check if room is full
    const nbclient =  await this.server.in(data.room).fetchSockets()

    if (nbclient.length >= 2 && newGame.isGameStarted() === false && newGame.bothPlayerRegistered())
    {
      newGame = this.curentgame.get(data.room)
      if (newGame)
      {
        this.server.to(data.room).emit('game started')
        this.setPlayersIngame(newGame)
        newGame.putMatchStarted()
        this.setCountDown(newGame, data.room)
      }
    }
    else
    {
      this.setPlayersIngame(newGame)
      this.emitPlayers(data.room, newGame)
    }
  }

  async setCountDown(game : CurrentGame, room : string)
  {
    await game.getCountDown(this.server, room)
    this.newGame()
  }


  async setPlayersIngame(game : CurrentGame)
  {
    const players : playersUsername = game.getPlayerLogin()
    await this.gameSocketService.setIngameStatus(players.leftplayer)
    await this.gameSocketService.setIngameStatus(players.rightplayer)
    this.emitStatusUpdated()
  }

  async setPlayersOnline(game : CurrentGame)
  {
    const players : playersUsername= game.getPlayerLogin()
    await this.gameSocketService.setOnlineStatus(players.leftplayer)
    await this.gameSocketService.setOnlineStatus(players.rightplayer)
    this.emitStatusUpdated()
  }

  newGame()
  {
    let game : CurrentGame
    if (!this.interval)
    {
      this.interval = setInterval(() => {
        this.curentgame.forEach((value, key) =>
        {
            game = this.curentgame.get(key)
            if (game && game.isGameStarted() && game.isCountDownFinished())
            {
              this.emitNewPosition(key, game)
            }
            else if (!game)
            {
              this.curentgame.delete(key)
            }
        })
      }, 1000 / 60)
    }
  }

  emitNewPosition(room : string, game : CurrentGame)
  {
    const position : positions = game.getPosition()
    if (position)
    {
      this.server.to(room).emit('position', position)
    }
    // else
    //   console.log('gateway error on position')
    if (game.isEndOfMatch() === true)
    {
      if (game.getMatchType() === 'PVP')
      {
        this.setPlayersOnline(game)
        this.server.to(room).emit('endPVP')
      }
      else if (game.getMatchType() === 'TOURNAMENT')
        this.tournamentEndOfGame(game, room)
      // else
      //   console.log('End of game')
      this.curentgame.delete(room)
      if (this.curentgame.size === 0)
      {
        clearInterval(this.interval)
        this.interval = null
      }
    }
  }

  async tournamentEndOfGame(game : CurrentGame, room : string)
  {
  
    const score : getScore = game.getScore()
    this.setPlayersOnline(game)
    await this.gameSocketService.tournamentRegisterScore(room, score.leftScore, score.rightscore)
    this.server.to(room).emit('endTournament')
  }


  //register pad mouvement from client
  @SubscribeMessage('mouvement')
  mouvement(client : Socket, data : {action :string, room : string})
  {
    const game : CurrentGame = this.curentgame.get(data.room)
    if (!game)
      return
    if (data.action === 'upleft')
      game.leftPadUp()
    else if (data.action === 'upright')
      game.rightPadUp()
    else if (data.action === 'downleft')
      game.leftPadDown()
    else if (data.action === 'downright')
      game.rightPadDown()
  }


  emitStatusUpdated()
  {
    this.server.emit('status updated')
  }
}