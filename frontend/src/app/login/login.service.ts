import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tokenInterface } from '../interfaces/token.interface';



@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  responselist: any


  sendLogin(newlogin: string): Observable<tokenInterface> {
    const url = "https://localhost:3000/auth/login"
    const body = { "login": newlogin };

    return this.httpClient.post<tokenInterface>(url, body)

  }



}



