import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PvpVsMatchService {

  constructor(
    private httpClient : HttpClient
  ) { }

  cancelRegister() : Observable<any>
  {
    const url = 'https://localhost:3000/matchmaking/removequeue'
    return this.httpClient.get(url)
  }


}
