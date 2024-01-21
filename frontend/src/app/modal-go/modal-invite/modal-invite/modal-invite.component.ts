import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-invite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-invite.component.html',
  styleUrls: ['./modal-invite.component.css']
})
export class ModalInviteComponent {

  constructor (
    private appComponent: AppComponent,
    private router : Router
  ){}



  close(){
    this.appComponent.setInvite(false);
    // console.log('close')
  }

  goGame(){

    this.appComponent.setInvite(false);
    if (window.location.pathname === '/game')
      window.location.reload()
    else
      this.router.navigateByUrl('/game');
  }


}
