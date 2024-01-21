import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tokenInterface } from '../interfaces/token.interface';



@Injectable({
  providedIn: 'root'
})
export class TwoFaService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  responselist: any

  isActivatedTwoFa() {

    const url = 'https://localhost:3000/auth/activated'
    return this.httpClient.get<number>(url)
  }

  updateStatusTwoFa(status : number) {

    return this.httpClient.get(`https://localhost:3000/auth/update-status/${status}`)
  }

  sendMail() {

    const url = 'https://localhost:3000/two-fa/mail'
    return this.httpClient.get(url)
  }

  getAutorization(code: string) {

    return this.httpClient.get<boolean>(`https://localhost:3000/two-fa/autorization/${code}`)
  }

  getNewTokenJwt() {
    const url = 'https://localhost:3000/auth/jwt'
    return this.httpClient.get<tokenInterface>(url)
  }

}
