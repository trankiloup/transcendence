import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { TwoFaService } from './two-fa.service';
import { TokenService } from '../authguard/token.service';
import { tokenInterface } from '../interfaces/token.interface';

@Component({
  selector: 'app-two-fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './two-fa.component.html',
  styleUrls: ['./two-fa.component.css', '../app.component.css', '../warm-up/warm-up.component.css']
})
export class TwoFaComponent {// implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private twoFaService: TwoFaService,
  ) { }

  @ViewChild('myForm') myForm!: NgForm;

  digit1: string = ''
  digit2: string = ''
  digit3: string = ''
  digit4: string = ''

  digits: string[] = ['digit1', 'digit2', 'digit3', 'digit4'];

  send: number = -1;

  ngOnInit() {
    this.twoFaService.isActivatedTwoFa().subscribe({
      next: (data) => {
        if (data == 1)
          this.send = 0;
        else if (data == 0)
          this.send = -1;
        else if (data == -1)
          this.connexion();
      }
    })
  }

  sendEmail() {
    this.send = 1;
    this.twoFaService.sendMail().subscribe();
  }

  checkValidity(index: number, input: any) {
    const value = input.target.value;
    if (!value.match(/[0-9]/)) {
      input.target.value = ""
      return
    }
    if (index > 3)
      return
    const nextCase = document.getElementById(this.digits[index]);
    if (nextCase) {
      nextCase.focus();
    }
  }

  connexion() {
    this.twoFaService.getNewTokenJwt().subscribe({
      next: (tok) => {
        this.tokenService.saveToken(tok.access_token)
        // console.log(tok.access_token)
        this.router.navigateByUrl('overview');
      }
    })
  }

  desactivateSecurity() {
    this.twoFaService.updateStatusTwoFa(-1).subscribe({
      next: () => this.connexion(),

    });
  }

  activateSecurity() {
    this.twoFaService.updateStatusTwoFa(1).subscribe({
      next: () => this.send = 0,
    });
  }


  submitForm() {
    const code: string = this.digit1 + this.digit2 + this.digit3 + this.digit4;
    // console.log('Submitted Code:', code);
    this.digit1 = ''
    this.digit2 = ''
    this.digit3 = ''
    this.digit4 = ''

    this.twoFaService.getAutorization(code).subscribe({
      next: (data) => {
        if (data == true) {
          this.twoFaService.getNewTokenJwt().subscribe({
            next: (tok) => {
              this.tokenService.saveToken(tok.access_token)
              // console.log(tok.access_token)
              this.router.navigateByUrl('overview');
            }
          })
        } else
          this.send = 2;
      }
    })
  }

}
