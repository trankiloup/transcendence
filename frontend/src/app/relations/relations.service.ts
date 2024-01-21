import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class RelationsService {
  
    constructor(
      private httpClient:HttpClient,
       ) {}
       
       responselist : any

       newMember(user : number) {
           const url = "https://localhost:3000/relations/member"
           const body = {id: user};
           return this.httpClient.post(url, body);
       }
 
       addFriend(user1: number, user2: number) {
            const url = "https://localhost:3000/relations/update-status"
            const body = {user1 : user1, user2 : user2, status: 'FRIEND'}
            return this.httpClient.post(url, body)
       }

       blockUser(user1: number, user2: number){
            const url = "https://localhost:3000/relations/update-status"
            const body = {user1 : user1, user2 : user2, status: 'BLOCKED'}
            return this.httpClient.post(url, body)
       }

       deblockUser(user1: number, user2: number) {
          const url = "https://localhost:3000/relations/update-status"
          const body = {user1 : user1, user2 : user2, status: 'DEBLOCKED'}
          return this.httpClient.post(url, body)
       }

       removeRelation(user1: number, user2: number){
          const url = "https://localhost:3000/relations/update-status"
          const body = {user1 : user1, user2 : user2, status: 'NONE'}
          return this.httpClient.post(url, body)
     }

       getStatus(user1: number, user2: number) {
          return this.httpClient.get<number>(`https://localhost:3000/relations/status/${user1}/${user2}`);
       }
  }