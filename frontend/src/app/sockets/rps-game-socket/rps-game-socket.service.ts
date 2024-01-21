import { Injectable, OnInit } from '@angular/core';
import { CustomRpsGameSocket} from './rps-game-custom-socket';
import { RpsGameComponent } from 'src/app/rps-game/rps-game.component';
import { Observable, Subject, fromEvent } from 'rxjs';
import { RpsGameService } from 'src/app/rps-game/rps-game.service';
import { mePlayer } from 'src/app/game/Interface/me-player.interface';
import { TokenService } from 'src/app/authguard/token.service';
import { gameStatusInt } from 'src/app/rps-game/Interfaces/gameStatusInt.interface';
import { GameResultInt } from 'src/app/rps-game/Interfaces/gameResult.interface';
import { stateInt } from 'src/app/rps-game/Interfaces/state.interface';
import { UserSocketService } from '../user-list-socket/user-socket.service';


@Injectable({
  providedIn: 'root'
})
export class RpsSocketService{

  constructor(
    private socket : CustomRpsGameSocket,
    private tokenService : TokenService,
    private userSocketService : UserSocketService
    ) {
      this.socket.on('status updated', () => {this.userSocketService.updateUserList()})
    }

    updatePlayers() : Observable<gameStatusInt>
    {
      return new Observable((observer) =>{
        this.socket.on('update status', (data : gameStatusInt) =>{
          observer.next(data)
        })
      })
    }

    gameStarts() : Observable<boolean>
    {
      return new Observable((observer) => {
        this.socket.on("newgame", (data : boolean) => {
          observer.next()
        })
      } )
    }

    matchEnd() : Observable<any>
    {
      return new Observable((observer) => {
        this.socket.on("endmatch", (data : any) => {
          observer.next()
        })
      } )
    }
    
    gameResult() : Observable<GameResultInt>
    {
      return new Observable((observer) => {
        this.socket.on("gameresult", (data : GameResultInt) => {
          observer.next(data)
        })
      } )
    }

    nextGame() : Observable<any>
    {
      return new Observable((observer) => {
        this.socket.on("nextgame", (data : GameResultInt) => {
          observer.next(data)
        })
      } )

    }


    registerSocket(player : mePlayer)
    {
        const login = this.tokenService.getlogin()
        this.socket.emit('join', {'login' : login, 'player' : player})
    }

    unregister(player : mePlayer)
    {
      const login = this.tokenService.getlogin()
      this.socket.emit('unregister', {'login' : login, 'player' : player})
    }

    emitPlayedCard(player : mePlayer, card : string)
    {
      this.socket.emit('play', {'player' : player, 'card' : card})
    }

    emitGetResult(player : mePlayer)
    {
      this.socket.emit('getresult', {'player' : player})
    }

    emitNextGame(player : mePlayer)
    {
      this.socket.emit('nextgame', {'player' : player})
    }

    emitEndOfMacth(player : mePlayer)
    {
      this.socket.emit('endOfMatch', {'player' : player})
    }

    emitLeaveRoom(player : mePlayer)
    {
      this.socket.emit('leaveRoom', {'player' : player})
    }

  }
      
