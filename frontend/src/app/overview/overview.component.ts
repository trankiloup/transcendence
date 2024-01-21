import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router} from '@angular/router';
import { AccountMenuComponent } from '../menus/account-menu/account-menu/account-menu.component';
import { UserListComponent } from '../users/user-list/user-list.component';
import {NgIf, NgOptimizedImage} from "@angular/common";
import { GlobalSocketService } from '../sockets/global/global-socket.service';
import {HeaderComponent} from "../header/header.component";
import { RelationsComponent } from '../relations/relations.component';
import { ChatService } from '../chat/chat.service';
import { RelationsService } from '../relations/relations.service';
import { getIdUser } from '../interfaces/getIdUser.interface';
import { ChatSocketService } from '../sockets/chat-socket/chat-socket.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css','../app.component.css','../menus/account-menu/account-menu/account-menu.component.css'],
  standalone: true,
  imports: [AccountMenuComponent, UserListComponent, NgOptimizedImage, NgIf, HeaderComponent, RelationsComponent]
})
export class OverviewComponent implements OnInit{

  constructor (
    private router: Router,
    private globalSocketService : GlobalSocketService,
    private cdr: ChangeDetectorRef,
    private chatService: ChatService,
    private relationsService: RelationsService,
    private chatSocketService: ChatSocketService,
  ){ }

  id : number = 0;
  login : string = "";

  ngOnInit():void{
    this.globalSocketService.onConnect(),
    this.chatService.getUserId().subscribe({
      next:(data : getIdUser) => {
        this.login = data.login
        this.id = data.id
        this.chatSocketService.joinRoom(this.id);
        this.relationsService.newMember(this.id).subscribe();
      },
    });
  }

  game() : void {
    this.router.navigateByUrl('/pvpOrMatch');
  }
  chat() : void {
    this.router.navigateByUrl('/chat');
  }
  rpsGame() {
    this.router.navigateByUrl('/rpsGame');
  }
}
