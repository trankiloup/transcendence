import {Component, OnDestroy, OnInit,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import {AccountMenuComponent} from "../../menus/account-menu/account-menu/account-menu.component";
import {UserListComponent} from "../../users/user-list/user-list.component";
import {ModalComponent} from "./modal/modal.component";
import {Subscription} from "rxjs";
import {ModalService} from "./modal/modal.service";
import { PvpVsMatchService } from './pvp-vs-match.service';
import { GameSocketService } from 'src/app/sockets/game-socket/game-socket.service';
import {HeaderComponent} from "../../header/header.component";

@Component({
  selector: 'app-pvp-vs-match',
  standalone: true,
  imports: [CommonModule, AccountMenuComponent, UserListComponent, ModalComponent, HeaderComponent],
  templateUrl: './pvp-vs-match.component.html',
  styleUrls: ['./pvp-vs-match.component.css','../../app.component.css'],
  providers : [GameSocketService]

})
export class PvpVsMatchComponent implements OnInit,OnDestroy{


  isClick:boolean ;
  private subscriptionClicked: Subscription ;
  private subscriptionCreated: Subscription ;

  ngOnInit(){
    this.subscriptionClicked = this.modal.isClicked.asObservable().subscribe(data =>{
      this.isClick = data;
    });
    this.subscriptionCreated = this.modal.isCreatedPvp.asObservable().subscribe(data =>{
      if(data == true)
        this.router.navigateByUrl('/game');
    });
  }

  constructor (
    private router: Router,
    private modal: ModalService,
    private gameSocketService : GameSocketService
    ) {
    this.subscriptionClicked = new Subscription;
    this.subscriptionCreated = new Subscription;
    this.isClick = false;
  };

  openModal(): void {
    this.modal.isClicked.next(true);
  }
  goToMatch(){
    this.router.navigateByUrl('/Match');
  }
  ngOnDestroy(): void {
    this.subscriptionClicked.unsubscribe();
    this.subscriptionCreated.unsubscribe();
  }
  back(){
    this.router.navigateByUrl('/overview');
  }
}
