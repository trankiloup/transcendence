import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { mePlayer } from '../game/Interface/me-player.interface';
import { ResMessage } from '../game/Interface/Resmessage.interface';

@Injectable({
  providedIn: 'root'
})
export class RpsGameService {

  constructor(
    private httpClient : HttpClient
  ) { }


    isPlayerAvailable()
    {
      const url = 'https://localhost:3000/matchmaking/rps/available'
      return this.httpClient.get<ResMessage>(url)
    }

    rpsRegister() : Observable<mePlayer>
    {
      const url = 'https://localhost:3000/matchmaking/rps/register'
      return this.httpClient.get<mePlayer>(url)
    }

    rpsGetMePlayer() : Observable<mePlayer>
    {
      const url = 'https://localhost:3000/matchmaking/rps/meplayer'
      return this.httpClient.get<mePlayer>(url)
    }

    rpsIsGameFull(roomId : number) : Observable<boolean>
    {
      const url = 'https://localhost:3000/matchmaking/rps/gamefull'
      return this.httpClient.put<boolean>(url, {room :roomId})  
    }

    rpsUnregister(roomId : number) : Observable<any>
    {
      const url = 'https://localhost:3000/matchmaking/rps/unregister'
      return this.httpClient.put<boolean>(url, {room :roomId})   
    }
}
