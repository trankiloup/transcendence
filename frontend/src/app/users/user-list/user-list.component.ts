import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSocketService } from 'src/app/sockets/user-list-socket/user-socket.service';
import {filter, find, map, Observable, Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {UserListService} from "./user-list.service";
import {GetLoginByUsername} from "../../interfaces/getLoginByUsername";
import { ChatService } from 'src/app/chat/chat.service';
import { RelationsService } from 'src/app/relations/relations.service';
import { ChatSocketService } from 'src/app/sockets/chat-socket/chat-socket.service';
import { relationStatus } from 'src/app/enum/relations-status.enum';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy{


  constructor(
    private userSocketService : UserSocketService,
    private userListService : UserListService,
    private router:Router,
    private chatService : ChatService,
    private relationService : RelationsService,
    private chatSocketService: ChatSocketService,
    ){}

    id:number = 0;
    room:string = this.id.toString();
    status: number = 0;
    relation = relationStatus;

    user:string="" ;
    subscription: Subscription = new Subscription;

    userList$ = this.userSocketService.userUpdate$.pipe(
      map(users=> users.filter(user => user.status === 'ONLINE' || user.status === 'INGAME'))
    )

  setUser(name: string, id: number) {
      this.user = name;
    // console.log("name: " + name);
    this.relationService.getStatus(this.id, id).subscribe({
      next: relation => {
      this.status = relation;
    }})
  }


  goMatchHistory(){
    this.router.navigate(['/score-history', this.user]);
    }

  ngOnInit(): void {
      this.chatService.getUserId().subscribe({
        next: (data) => {
          this.id = data.id;
          this.userSocketService.updateUserList()
        } 
      })
      }

  ngOnDestroy(): void {
    // this.userSocketService.onDestroy()
/*
    this.subscription.unsubscribe();
*/
     this.userSocketService.onDestroy()
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
      }
    });
  }

  deblockUser(user : number) {
    this.relationService.deblockUser(this.id, user).subscribe({
      next: () => {
        this.chatSocketService.updateFriendsList(this.id, this.id.toString());
        this.chatSocketService.updateFriendsList(user, user.toString());
      }
    });
  }

}
