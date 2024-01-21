import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private tokenService : TokenService,
    private router :Router
    ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const token = this.tokenService.getToken()

    //si on a un token, on le clone, on ajoute le token dans le header
    //ca permet au gard du back de verifier si le token est valide
    if (token !== null)
    {
      let clone = request.clone({
        headers: request.headers.set('Authorization', 'Bearer '+ token)
    })
    return next.handle(clone)
  }

    return next.handle(request).pipe( tap(() => {}, error => {
      if (error instanceof HttpErrorResponse) {
        if (error.status !== 401)
          return;
        this.router.navigate(['unauthorized']);
      }
    }))
  }
}

export const TokenInterceptorProvider ={
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true
}