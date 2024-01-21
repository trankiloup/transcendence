import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import { ResMessage } from '../../Interface/Resmessage.interface';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isClicked: Subject<boolean> = new Subject;
  isCreatedPvp: Subject<boolean> = new Subject;
  constructor(
    private httpClient : HttpClient
  ) { }
  

  PvpCreateOrJoinPvp() : Observable<ResMessage>
  {
    const url = 'https://localhost:3000/matchmaking/pvpjoinorcreate'
    return this.httpClient.post<ResMessage>(url, {type : 'PVP'})
  }

  cancelSubcription() : Observable<any>
  {
    const url = 'https://localhost:3000/matchmaking/removequeue'
    return this.httpClient.get(url)
  }

  registerPlayerToPvp() : Observable<boolean>
  {

    const url = 'https://localhost:3000/matchmaking/register'
    return this.httpClient.post<boolean>(url, {type : 'PVP'})
  }
}
