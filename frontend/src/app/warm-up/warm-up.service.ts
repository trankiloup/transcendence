import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarmUpService {

  constructor(private httpClient: HttpClient) { }


  isUserLoggedIn(): Observable<boolean> {
    const url = "https://localhost:3000/auth/isloggedin"
    return this.httpClient.get<boolean>(url)
  }

  getRedirectToApi42() {
    window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-043b817f3c0c03f0b57aa9eb38551c06e477ffd51891c7c40a1949b764cc8595&redirect_uri=https%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&response_type=code';
  }
}
