import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccountMenuService {

  constructor(private httpClient:HttpClient){}

  logout(){
    const url = "https://localhost:3000/auth/logout"
    return this.httpClient.get(url)
  }
}
