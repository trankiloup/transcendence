import { Component, NgZone, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { GameSocketService } from './sockets/game-socket/game-socket.service';
import {ModalGoComponent} from "./modal-go/modal-go.component";
import {NgIf} from "@angular/common";
import { GlobalSocketService } from './sockets/global/global-socket.service';
import { AppService } from './app.service';
import { UserSocketService } from './sockets/user-list-socket/user-socket.service';
import { TokenService } from './authguard/token.service';
import { ModalInviteComponent } from './modal-go/modal-invite/modal-invite/modal-invite.component';

export const broadCastChannel = new BroadcastChannel('logout')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, ModalGoComponent, NgIf, ModalInviteComponent],


})
export class AppComponent implements OnInit{
  constructor(
    private globalSocketService : GlobalSocketService,
    private appService : AppService,
    private tokenService : TokenService,
    private router : Router,
    private ngZone : NgZone
  ){
    broadCastChannel.onmessage = (event) => {
      if (event.data === 'logout')
      {
        if (this.tokenService.isLogged())
        {
          this.ngZone.run(() => this.router.navigate(['home']))
          this.tokenService.clearToken()
        }
      }
    }
  }

  private enable:boolean = false;
  private enableInvite : boolean = false

  ngOnInit(): void {
    this.appService.PopUpVariable.subscribe((data) => {
      if (data === true)
        this.enable = true
      else
        this.enable = false
    })

    this.appService.InvitePopUp.subscribe((data) => {
      if (data === true)
        this.enableInvite = true
      else 
        this.enableInvite = false
    })
  }

  public setEnable(value:boolean){
    this.enable = value;
  }
  public getEnable():boolean{

    return (this.enable);
  }

  public setInvite(value : boolean)
  {
    this.enableInvite = value
  }

  public getInvite():boolean{

    return (this.enableInvite);
  }

  }

