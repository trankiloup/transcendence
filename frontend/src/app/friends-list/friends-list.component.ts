import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSocketService } from 'src/app/sockets/user-list-socket/user-socket.service';
import {filter, find, map, Observable} from 'rxjs';
import {Router} from "@angular/router";
import { ChatService } from 'src/app/chat/chat.service';
import { RelationsService } from 'src/app/relations/relations.service';
import { ChatSocketService } from 'src/app/sockets/chat-socket/chat-socket.service';
import { relationStatus } from 'src/app/enum/relations-status.enum';
import { getIdUser } from '../interfaces/getIdUser.interface';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-friends-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit {

  constructor(
    private userSocketService : UserSocketService,
    private router:Router,
    private chatService : ChatService,
    private relationService : RelationsService,
    private chatSocketService: ChatSocketService,
    private chatComponent : ChatComponent,
    ){}

    relation = relationStatus;

    id : number = 0;

    currentList : number = 0;

    friendsList$ = this.chatSocketService.friendsListUpdate$.pipe()


  ngOnInit(): void {
    
    this.chatService.getUserId().subscribe({
      next:(data : getIdUser) => {
        this.id = data.id
        this.chatSocketService.updateFriendsList(this.id, this.id.toString());
      },
    });
    }

    goMatchHistory(user: string){
      this.router.navigate(['/score-history', user]);
      }  

    updateCurrentList(list: number){
      this.currentList = list;
    }

    addFriend(user : number){
      this.relationService.addFriend(this.id, user).subscribe({
        next: () => {
          this.chatSocketService.updateFriendsList(this.id, this.id.toString());
          this.chatSocketService.updateFriendsList(user, user.toString());
        }
      });
    }
      
    removeRelation(user : number){
      this.relationService.removeRelation(this.id, user).subscribe({
        next: () => {
          this.chatSocketService.updateFriendsList(this.id, this.id.toString());
          this.chatSocketService.updateFriendsList(user, user.toString());
        }
      });
    }
  
    blockUser(user : number){
      this.relationService.blockUser(this.id, user).subscribe({
        next: () => {
          this.chatSocketService.updateFriendsList(this.id, this.id.toString());
          this.chatSocketService.updateFriendsList(user, user.toString());
          this.chatComponent.updateCurrentChatConv();
        }
      });
    }
  
    deblockUser(user : number) {
      this.relationService.deblockUser(this.id, user).subscribe({
        next: () => {
          this.chatSocketService.updateFriendsList(this.id, this.id.toString());
          this.chatSocketService.updateFriendsList(user, user.toString());
          this.chatComponent.updateCurrentChatConv();
        }
      });
    }

}
