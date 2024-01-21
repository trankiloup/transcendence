import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { mePlayer } from './Interface/me-player.interface';
import { roomInterface } from './pvp-vs-match/match/Interfaces/room.interface';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(
    private httpClient : HttpClient
  ) { }

  getRoom(): Observable<number>
  {
    const url = 'https://localhost:3000/matchmaking/getroom'
    return this.httpClient.get<number>(url)
  }

  removePlayerFromQueue() : Observable<any>
  {
    const url = 'https://localhost:3000/matchmaking/removequeue'
    return this.httpClient.get(url)
  }

  deleteMatch(roomId : string)
  {
    const url = 'https://localhost:3000/matchmaking/delete'
    return this.httpClient.delete(url, {body :{room : roomId}})
  }

  getMePlayer() : Observable<mePlayer>
  {
    const url = 'https://localhost:3000/matchmaking/player-position'
    return this.httpClient.get<mePlayer>(url)
  }

  gameStarted(roomId : string) : Observable<any>
  {
    const url = 'https://localhost:3000/matchmaking/gamestarted'
    return this.httpClient.put(url, {room : roomId})
  }

  tournamentGetGlobalRoom(room : string) : Observable<roomInterface>
  {    
    const url = 'https://localhost:3000/matchmaking/tournament/globalroom'
    return this.httpClient.put<roomInterface>(url, {room : room})

  }

  registerScore(room : string, leftscore : number, rightcore : number) : Observable<any>
  {
    const url = 'https://localhost:3000/matchmaking/tournament/registerscore'
    return this.httpClient.put<string>(url, { room: room, leftscore : leftscore, rightcore : rightcore})
  }
}
