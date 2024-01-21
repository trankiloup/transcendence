import { Injectable, OnInit } from '@angular/core';
import { CustomGameSocket} from './game-custom-socket';
import { GameComponent } from 'src/app/game/game.component';
import { Observable, Subject, fromEvent } from 'rxjs';
import { GameService } from 'src/app/game/game.service';
import { positions } from './Interface/positions.interface';
import { score } from './Interface/score.interface';
import { mePlayer } from 'src/app/game/Interface/me-player.interface';
import { playersUsername } from './Interface/playersUsername.interface';
import { UserSocketService } from '../user-list-socket/user-socket.service';


@Injectable({
  providedIn: 'root'
})
export class GameSocketService{

  constructor(
    private socket: CustomGameSocket,
    private GameService : GameService,
    private UserSocketService : UserSocketService
    ) {

      //IMPORTANT! A ne pas mettre dans on init, mais ici
      //ces fonction ecoutent le serveur en general et peuvent agir si le client est parti
      this.socket.on('quit', () => {this.GameService.removePlayerFromQueue()})
      this.socket.on('delete room', (room : string) => this.deleteRoom(room))
      this.socket.on('status updated', () => this.UserSocketService.updateUserList())
    }
    

    deleteRoom(room : string)
    {
      this.GameService.deleteMatch(room).subscribe()
    }
    // room : string = ''

    newPosition() : Observable<positions>{
      return new Observable((observer) =>{
        this.socket.on('position', (data : positions) =>{
          observer.next(data)
        })
      })
    }

    updatePlayer() : Observable<playersUsername>{
      return new Observable((observer) => {
        this.socket.on('updateplayer', (data : playersUsername) => {
        observer.next(data)
      })
      })
    }


    endOfGamePVP() : Observable<any>{
      return new Observable((observer) =>
      this.socket.on('endPVP', () =>{
        observer.next()
      }))
    }

    endOfGameTournament() : Observable<any>{
      return new Observable((observer) =>
      this.socket.on('endTournament', () =>{
        observer.next()
      }))
    }

  

    countDown() : Observable<number>{
      return new Observable((observer) =>{
        this.socket.on('count', (data : number) =>{
          observer.next(data)
        })
      })
    }

    gameStarted() : Observable<any>{
      return new Observable((observer) =>
      this.socket.on('game started', () =>{
        observer.next()
      }))
    }

    joinPvpRoom(room : string, login : string, player : mePlayer)
    {
      this.socket.emit('join', {'room' : room, 'login' : login, 'player' : player})
    }

    leaveRoom(room : string)
    {
      this.socket.emit('exit', {'room' : room})
    }


    sendPlayerInfo(player : mePlayer, room : string, login : string)
    {
      this.socket.emit('player', {room : room, player : player, login : login})
    }
    
    upleft(room : string)
    {
      this.socket.emit('mouvement', {action : 'upleft', room : room})
    }

    upright(room : string)
    {
      this.socket.emit('mouvement', {action : 'upright', room : room})
    }

    downleft(room : string)
    {
      this.socket.emit('mouvement', {action : 'downleft', room : room})
    }

    downright(room : string)
    {
      this.socket.emit('mouvement', {action : 'downright', room : room})
    }



    onDestroy(room : string)
    {
      this.socket.emit('exit', {room : room})
      this.socket.removeAllListeners()
    }



    
}
