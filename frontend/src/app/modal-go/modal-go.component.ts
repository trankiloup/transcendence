import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {Router} from "@angular/router";
import {AppComponent} from "../app.component";

@Component({
  selector: 'app-modal-go',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-go.component.html',
  styleUrls: ['./modal-go.component.css','../app.component.css'],
})
export class ModalGoComponent {
  constructor(
    private app:AppComponent,
    private router:Router,
    ) {
  };

  close(){
    this.app.setEnable(false);
  }

  goGame(){

    this.app.setEnable(false);
    if (window.location.pathname === '/game')
      window.location.reload()
    else
      this.router.navigateByUrl('/game');
  }


}
