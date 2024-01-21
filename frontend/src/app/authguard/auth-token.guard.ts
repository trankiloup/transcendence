import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';

export const authTokenGuard: CanActivateFn = (route, state) => {

  const currentRoute = route.url[0].path;
  const router = inject(Router)
  const tokenService = inject(TokenService)


  //angular protege toutes les routes sauf home. Il s'attend a ce que le token soit present
  //il ne verifie pas s'il est valide, nestjs le fera. Si y'en a pas, il redirige vers unauthorized

  if (currentRoute === 'home')
    return true;
  else if (currentRoute === 'two-fa') {
    if (tokenService.isLogged() === true) {
      router.navigate(['overview'])
      return true
    }
    else if (tokenService.isLoggedwithoutTwoFa() === true)
      return true;
    else {
      // console.log('Guard redirect to unauthorized')
      router.navigate(['unauthorized'])
      return false
    }
  }
  else if (tokenService.isLogged() === false) {
    // console.log('Guard redirect to unauthorized')
    router.navigate(['unauthorized'])
    return false
  }
  return true


  // if (currentRoute === 'home')
  //   return true;
  // else if (tokenService.isLogged() === false) {
  //   console.log('Guard redirect to unauthorized')
  //   router.navigate(['unauthorized'])
  //   return false
  // }
  // return true
};
