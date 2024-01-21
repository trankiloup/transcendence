import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResMessage } from '../../Interface/Resmessage.interface';
import { initMatchPage } from './Interfaces/initMatchPage.interface';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(
    private httpClient : HttpClient
  ) {}

  tournamentJoinOrCreate()
  {
    const url = 'https://localhost:3000/matchmaking/matchjoinorcreate'
    return this.httpClient.post<ResMessage>(url, {type : 'TOURNAMENT'})
  }

  registerPlayerToMatch() : Observable<boolean>
  {
    const url = 'https://localhost:3000/matchmaking/register'
    return this.httpClient.post<boolean>(url, {type : 'TOURNAMENT'})
  }

  cancelSubcription() : Observable<any>
  {
    const url = 'https://localhost:3000/matchmaking/tournament/removequeue'
    return this.httpClient.get(url)
  }

  isMatchFull() : Observable<boolean>
  {
    const url = 'https://localhost:3000/matchmaking/matchfull'
    return this.httpClient.get<boolean>(url)
  }

  isPlayerRegistered() : Observable <initMatchPage>
  {
    const url = 'https://localhost:3000/matchmaking/tournament/isregistered'
    return this.httpClient.get<initMatchPage>(url)
  }

}
