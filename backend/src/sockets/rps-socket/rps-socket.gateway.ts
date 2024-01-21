import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server , Socket} from 'socket.io'
import { RpsCurrentGame } from './rps-current-game';

import { playerPosition } from 'src/game/Interface/player-position.interface';
import { RpsSocketService } from './rps-socket.service';
import { gameStatusInt } from './Interface/gameStatus.interface';
import { GameResultInt } from './Interface/gameResult.interface';
import { RpsScoreInt } from './Interface/RpsScore.interface';


@WebSocketGateway({cors: {origin : ['https://localhost:3000', 'https://localhost:4200']}, namespace : 'rps'})
export class RpsSocketGateway implements OnGatewayConnection, OnGatewayDisconnect
{

  constructor(private RpsSocketService : RpsSocketService){}

  currentgame : Map<string, RpsCurrentGame> = new Map<string, RpsCurrentGame>



  @WebSocketServer()
    server: Server


  async handleConnection(client: any, ...args: any[]) {
  }

  handleDisconnect(client: any) {

  }

  @SubscribeMessage('join')
  async joinAGame(client : Socket, data :{ login : string, player : playerPosition})
  {
    const gameRoom : string = data.player.globalRoomId.toString()
    //leave previous room
    const rooms = client.rooms
    for (const room of rooms)
    {
      if (room !== gameRoom)
        await client.leave(room)
    }

    //join room
    if(!client.rooms.has(gameRoom))
      client.join(gameRoom)


    let newGame : RpsCurrentGame
    if (this.currentgame.has(gameRoom))
    {
      newGame = this.currentgame.get(gameRoom)
    }
    else
    {
      newGame = new RpsCurrentGame(this.RpsSocketService)
      this.currentgame.set(gameRoom, newGame)
      newGame = this.currentgame.get(gameRoom)
    }

    newGame.updateUsername(data.player, data.login)
    this.emitStatusUpdate(newGame, gameRoom)

    const nbclient =  await this.server.in(gameRoom).fetchSockets()
    this.setStatusIngame(newGame)

    if (nbclient.length >= 1 && newGame.bothPlayerRegistered() && newGame.isGameStarted() === false)
    {
      this.RpsSocketService.setGameStarted(data.player.globalRoomId)
      newGame.setGameStarded()
      // this.setStatusIngame(newGame)
      this.emitNewGame(gameRoom)
    }

  }

  @SubscribeMessage('play')
  async registerPlay(client : Socket, data : { player : playerPosition, card : string})
  {
    const room : string = data.player.globalRoomId.toString()
    const currentGame = this.currentgame.get(room)
    if (currentGame)
    {
      currentGame.registerPlayerCard(data.player, data.card)
    }
    else
      console.log('error on current game on adding card')
  }

  @SubscribeMessage('getresult')
  async getResult(client : Socket, data :{player : playerPosition})
  {
      if (!data.player)
        return

      const room = data.player.globalRoomId.toString()
      const current = this.currentgame.get(room)
      if (!room || !current)
        return
      if (!current.isResultEmitted())
      {
        current.setResultEmitted()
        this.emitgameResult(current, room)
        if (current.isGameOver())
        {
          this.server.to(room).emit('endmatch')
          this.registerScore(current, data.player.globalRoomId)
          this.setStatusOnline(current)
        }
      
      }
  }

  @SubscribeMessage('nextgame')
  async nextGame(client : Socket, data :{player : playerPosition})
  {
      if (!data.player)
        return

      const room = data.player.globalRoomId.toString()
      const current = this.currentgame.get(room)
      if (!room)
        return
      if (current.isResultEmitted())
        current.newGame()
  }
  

  emitgameResult(current : RpsCurrentGame, room : string)
  {
    const gameResult : GameResultInt = current.calcResult()
    this.server.to(room).emit('gameresult', gameResult)
    this.emitStatusUpdate(current, room)
    current.resetPlayerCard()
  }

  emitStatusUpdate(currentGame : RpsCurrentGame, room : string)
  {
    if (currentGame)
    {
      const gameStatus = currentGame.getMatchStatus()
      this.server.to(room).emit('update status', gameStatus)
    }
  }



  emitNewGame(room : string)
  {
    this.server.to(room).emit('newgame', true)
  }

  registerScore( current : RpsCurrentGame, room : number)
  {
    const game  = current.getMatchStatus()
    if (game)
    {
      let score : RpsScoreInt = new RpsScoreInt()
      score.player1_login = game.player1_login
      score.player2_login = game.player2_login
      score.player1_score = game.player1_score
      score.player2_score = game.player2_score
      score.room = room
      this.RpsSocketService.registerScore(score)
    }
    this.RpsSocketService.removeMatchFromMatchmaking(room)
  }

  @SubscribeMessage('leaveRoom')
  clientLeaveRoom(client : Socket,  data :{player : playerPosition})
  {
    if (data && data.player)
    {
      const room = data.player.globalRoomId.toString()
      if (client.rooms.has(room))
        client.leave(room)
    }
  }

  @SubscribeMessage('unregister')
  async unregister(client : Socket, data :{ login : string, player : playerPosition})
  {
      const gameStatus = new gameStatusInt()

      if (data.player)
      {
        const room : string = data.player.globalRoomId.toString()
          client.leave(room)
        const current : RpsCurrentGame = this.currentgame.get(room)
        if (current)
        {
          if (!current.isGameStarted())
          {
            this.server.to(room).emit('update status', gameStatus)
            this.setStatusOnline(current)
            this.currentgame.delete(room)
          }
          else
          {
            this.ifNoClientLeftInRoom(data.player.globalRoomId)
          }
        }
     }
  }

  async ifNoClientLeftInRoom(room : number)
  {
    const nbclient = await this.server.in(room.toString()).fetchSockets()
    if (nbclient.length === 0)
    {
      const current = this.currentgame.get(room.toString())
      this.setStatusOnline(current)
      this.RpsSocketService.removeMatchFromMatchmaking(room)
    }
  }

  async setStatusIngame(current : RpsCurrentGame)
  {
    if (current)
    {
      const gameStatus = current.getMatchStatus()
      await this.RpsSocketService.setIngameStatus(gameStatus.player1_login)
      await this.RpsSocketService.setIngameStatus(gameStatus.player2_login)
      this.server.emit('status updated')
    }
  }


  async setStatusOnline(current : RpsCurrentGame)
  {
    if (current)
    {
      const gameStatus = current.getMatchStatus()
      await this.RpsSocketService.setOnlineStatus(gameStatus.player1_login)
      await this.RpsSocketService.setOnlineStatus(gameStatus.player2_login)
      this.server.emit('status updated')

    }

  }
  

}

