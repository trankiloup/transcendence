import {Injectable, OnDestroy} from '@angular/core';
import {GetLoginByUsername} from "../../interfaces/getLoginByUsername";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserListService{

  private user: GetLoginByUsername | undefined;
  constructor(
     private httpClient: HttpClient,
  ) {
  }
  setUser(user: GetLoginByUsername) {
    this.user = user;
  };

  createMatchmaking(user : number) : Observable<any>
  {
    const url = 'https://localhost:3000/matchmaking/invite'
    return this.httpClient.post(url, {userId : user}) 
  }

  getLogin(id : number) : Observable<any>
  {
    const url = 'https://localhost:3000/user/id/' + id
    return this.httpClient.get(url)
  }


}
