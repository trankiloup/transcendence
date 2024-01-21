import { Injectable } from '@angular/core';
import { CustomGlobalSocket } from './global-custom-socket';
import { TokenService } from 'src/app/authguard/token.service';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { tournamentNameScore } from 'src/app/game/pvp-vs-match/match/Interfaces/tournamentNameScore.interface';
import { UserSocketService } from '../user-list-socket/user-socket.service';
import { sendMatchResult } from 'src/app/game/pvp-vs-match/match/Interfaces/sendMatchResult.interface';


@Injectable({
  providedIn: 'root'
})
export class GlobalSocketService{

  constructor(
    private socket: CustomGlobalSocket,
    private tokenService : TokenService,
    private appService : AppService,
    private userSocketService : UserSocketService
     ) {
      this.onConnect()
      this.socket.on('goGame', () => this.appService.setGlobalPopUp(true))
      this.socket.on('update userlist', () => this.userSocketService.updateUserList())
      this.socket.on('inviteGame', () => this.appService.SetInvitePopUp(true))
    }

    private isConnected : boolean = false


    goGame() : Observable<boolean>{
      return new Observable((observer) => {
        this.socket.on('goGame', (data : boolean) => 
        observer.next(data)
        )})
      }
    
    updateInfo() : Observable<tournamentNameScore>{
    return new Observable ((observer) => {
      this.socket.on('update players',(data : tournamentNameScore) =>
      {
      observer.next(data)
      }
    )})}


    endOfTournament() : Observable<boolean>{
      return new Observable((observer) => {
        this.socket.on('endOfTournament', (data : boolean) => {
          observer.next(data)
        })
      })
    }

    
    onConnect()
    {
      if (!this.isConnected && this.tokenService.getToken())
      {
        const login = this.tokenService.getlogin()
        this.socket.emit('connection', {'login' : login})
        this.isConnected = true
      }
    }

    ///////////////// USER ////////////////////////////////

    logout(login : string)
    {
      this.socket.emit('logout', {'login' : login})
      this.isConnected = false
      // this.socket.disconnect()
    }



    /////////////TOURNAMENT ///////////////////////////////

    showPreviousScore()
    {
      const login = this.tokenService.getlogin()
      this.socket.emit('previsous Score', {'login' : login})
    }

    registerTournament(room : string)
    {
      const login = this.tokenService.getlogin()
      this.socket.emit('Register tournament', {'login' : login, 'room': room})
    }

    registerLoginToRoom(room : string)
    {

      const login = this.tokenService.getlogin()
      this.socket.emit('Register global room', {'login' : login, 'room' : room})
    }

    removePlayerFromRoom(room : string)
    {
      const login = this.tokenService.getlogin()
      this.socket.emit('Remove from global room', {'login' : login, 'room' : room})
    }

    matchReady(room : string)
    {
      this.socket.emit('Match ready', {'room' : room})
    }

    // setPlayers(room : string, players : tournamentPlayersInterface)
    // {
    //   this.socket.emit('set players', {'room' : room, 'players' : players})
    // }
    
    sendUpdateInfo(room : string)
    {
      this.socket.emit('Get players', {'room' : room})
    }

    //indicate to global that a match identificate by it's room has ended
    tournamentEmitEndMatch(room : string, globalRoom : string, result : sendMatchResult)
    {
      const login = this.tokenService.getlogin()
      this.socket.emit('TournamentEndMatch', {'room': room, 'globalroom' : globalRoom, 'login' : login, 'result' : result})
    }

    tournamentEmitEndFinal(room : string, globalRoom : string, result : sendMatchResult)
    {
      const login = this.tokenService.getlogin()
      this.socket.emit('TournamentEndFinal', {'room': room, 'globalroom' : globalRoom, 'login' : login, 'result' : result})
    }


    ///////////// invite game /////////////////////////////
    emitInvite(invited : string)
    {
      const login = this.tokenService.getlogin()
      this.socket.emit('invite', {'login' : login, 'invited' : invited})
    }

  

}