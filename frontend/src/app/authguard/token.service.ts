import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtPayload, jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(
    private router: Router,
  ) { }

  saveToken(token: string) {
    localStorage.setItem('token', token)
  }

  //check if user a a token and it is not expired
  isLogged(): boolean {
    const token = localStorage.getItem('token')

    if (!token)
      return false

    const decoded = jwtDecode(token)
    if (!decoded.exp) {
      this.clearToken()
      return false
    }
    const expirationDate = new Date(decoded.exp * 1000)
    if (expirationDate < new Date() || !decoded.sub) {
      this.clearToken()
      return false
    }
    if (this.getTwoFa() === false) {
      // console.log('two_Fa false') // a supp
      return false;
    }
    this.getlogin()
    // console.log('is looged with two_fa true')// a supp
    return true
  }

  getlogin(): string {

    const token = localStorage.getItem('token')
    if (!token)
      return ""

    const payloadString = atob(token.split('.')[1])
    const payload = JSON.parse(payloadString)
    if (payload.login)
      return (payload.login)

    return ""

  }

  getTwoFa(): boolean {
    const token = localStorage.getItem('token')
    if (!token)
      return false;

    const payloadString = atob(token.split('.')[1])
    const payload = JSON.parse(payloadString)
    if (payload.two_fa === false)
      return (false)
    return true;
  }

  clearToken() {
    localStorage.removeItem('token')

  }

  getToken(): string | null {
    return (localStorage.getItem('token'))
  }




  isLoggedwithoutTwoFa(): boolean {
    const token = localStorage.getItem('token')

    if (!token)
      return false

    const decoded = jwtDecode(token)
    if (!decoded.exp) {
      this.clearToken()
      return false
    }
    const expirationDate = new Date(decoded.exp * 1000)
    if (expirationDate < new Date() || !decoded.sub) {
      this.clearToken()
      return false
    }
    if (this.getTwoFa() === false) {
      // console.log('islogged whithout two fa')
      return true;
    }
    this.getlogin()
    return true
  }
}
