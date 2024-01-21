import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { FormsModule, NgForm } from '@angular/forms';
import { NgFor, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../authguard/token.service';
import { HttpParams } from '@angular/common/http';
import { tokenInterface } from '../interfaces/token.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, NgFor]
})
export class LoginComponent {

  constructor(
    private loginService: LoginService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute,

  ) { }

  responseRoute: any

  // ngOnInit() {
  //   this.route.queryParams.subscribe(params => {
  //     const token: tokenInterface = {
  //       access_token: params['token']
  //     }
  //     if (token) {
  //       this.tokenService.saveToken(token.access_token)
  //       this.router.navigate(['overview']);
  //     }
  //   })
  // }



  //this will be replace by 42 api login
  onSubmitLogin(f: NgForm) {
    if (f.value.login !== '') {
      this.loginService.sendLogin(f.value.login).subscribe({
        next: (data) => {
          this.tokenService.saveToken(data.access_token)
          // console.log('acces token = ', data.access_token)
          this.router.navigate(['/overview'])
        },
        error: (error) => {
          console.log('Error :', error)
        }
      })
    }
  }


}
