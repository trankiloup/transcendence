import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSocketService } from 'src/app/sockets/user-list-socket/user-socket.service';
import { map, Subscription } from 'rxjs';
import { ChatService } from 'src/app/chat/chat.service';
import { ChatComponent } from 'src/app/chat/chat.component';
import { RelationsService } from 'src/app/relations/relations.service';
import { ChatSocketService } from 'src/app/sockets/chat-socket/chat-socket.service';
import { UserListService } from './user-list.service';
import { Router } from '@angular/router';
import { relationStatus } from 'src/app/enum/relations-status.enum';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ResMessage } from 'src/app/game/Interface/Resmessage.interface';
import { getIdUser } from 'src/app/interfaces/getIdUser.interface';
import { GlobalSocketService } from 'src/app/sockets/global/global-socket.service';

@Component({
  selector: 'app-user-list-chat',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './user-list-chat.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListChatComponent implements OnInit, OnDestroy{
  
  constructor(
    private userSocketService : UserSocketService,
    private chatService : ChatService,
    private chatComponent : ChatComponent,
    private relationService : RelationsService,
    private chatSocketService: ChatSocketService,
    private userListService : UserListService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private globalSocketService : GlobalSocketService
    ){}

    id : number = 0;
    room : string = this.id.toString();
    userList$ = this.userSocketService.userUpdate$.pipe();
    status: number = 0;
    relation = relationStatus;

    user: string = ""
    subscription: Subscription = new Subscription;

  ngOnInit(): void {
    this.chatService.getUserId().subscribe({
      next: (data) => {
        this.id = data.id;
        this.userSocketService.updateUserList()
      } 
    })
  }

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

  createPrivateMessage(id_dest: number, username: string){
    this.chatComponent.createPrivateConv(id_dest, username)
  }

  ngOnDestroy(): void {
    this._snackBar.dismiss()
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

  displayErrorSnackbar(error : string)
  {
    this._snackBar.dismiss()
    this._snackBar.open(error, '', { duration: 3000 });
  }


  inviteToGame(user : number)
  {
    this.userListService.createMatchmaking(user).subscribe({
      next : (data) => {
      if (data.message === 'ok')
        this.sendRequest(user)
      else
        this.displayErrorSnackbar(data.message)},
      error : (error) => console.log(error)
    })
  }

  sendRequest(userId: number)
  {
    let login : string = ""
    this.userListService.getLogin(userId).subscribe({
      next : (data : getIdUser) => {
        if (!data || !data.login)
          return
        login = data.login
      },
      error : (error) => console.log(error),
      complete : () => {
        this.globalSocketService.emitInvite(login)
        this.router.navigateByUrl('/game');
      }
      })

  } 


}
