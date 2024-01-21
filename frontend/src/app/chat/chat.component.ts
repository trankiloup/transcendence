import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgFor, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map, filter } from 'rxjs';
import { FormsModule, NgForm} from '@angular/forms';
import { UserProfileService } from '../user-profile/user-profile.service';
import { UserListChatComponent } from '../users/user-list/user-list-chat.component';
import { ChatService } from './chat.service';
import { ChatSocketService } from '../sockets/chat-socket/chat-socket.service';
import { getIdUser } from '../interfaces/getIdUser.interface';
import { ConversationListInterface } from '../interfaces/conversationList.interface';
import { relationStatus } from '../enum/relations-status.enum';
import { RelationsService } from '../relations/relations.service';
import { FriendsListComponent } from '../friends-list/friends-list.component';
import { BlockedList } from '../interfaces/blockedList.interface';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, UserListChatComponent, FormsModule, FriendsListComponent, NgFor],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css', '../app.component.css'],
  providers: [ChatSocketService]
})

export class ChatComponent implements OnInit{
@ViewChild('chatcontainer', {static: true}) private chatContainer!: ElementRef;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private userProfileService: UserProfileService,
    private chatSocketService : ChatSocketService,
    private relationService: RelationsService,
  ) {}

  responseRoute : any

  msg : string = ""

  login: string = ""
  id: number = 0
  status : number = 0;
  relation = relationStatus;

  currentIdConv: number = -1
  currentIdUser : number = -1
  currentConversation: string = "Main Conversation"

  blockedUsers : BlockedList[] = []

  newChat$ = this.chatSocketService.newChat$

  open : boolean = false;

  convList$ = this.chatSocketService.conversationListUpdate$
  .pipe(filter((messageList) => messageList.some(message => message.room.toString() === this.login)))

  chatList$ = this.chatSocketService.chatUpdate$.pipe()

  friendsList$ = this.chatSocketService.friendsListUpdate$.pipe()

  //blockedList$ = this.chatSocketService.blockedListUpdate$.pipe()
  goMatchHistory(){
    this.userProfileService.getMeProfile().subscribe({
      next: (data) => {
        this.router.navigate(['/score-history', data.username]);
      }
    })
    }

  ngOnInit(): void {
    this.chatService.getUserId().subscribe({
      next:(data : getIdUser) => {
        this.login = data.login
        this.id = data.id
        this.chatSocketService.joinRoom(this.id)
        this.convList$ = this.chatSocketService.conversationListUpdate$
        this.chatList$ = this.chatSocketService.chatUpdate$;
        this.chatSocketService.updateConversationList(this.id, this.id.toString(), -1);
        this.chatSocketService.updateChatList();
        this.newChat$ = this.chatSocketService.newChat$;
        this.chatSocketService.upChatRoom(this.id.toString())
      },
    });
  }

  openList() {
    this.open = !this.open;
  }

  onSubmitMessage(f : NgForm){
    if (f.value.msg.length == 0)
      return ;
    if (this.currentIdConv == -1){
      this.chatService.sendMessageChat(f.value.msg, this.login).subscribe({
        next:() => {this.chatSocketService.updateChatList();
          this.chatSocketService.upChat(1);
          this.chatSocketService.upChatRoom(this.id.toString());
          this.msg = "";
          this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        },
      });
    }
    else {
      this.chatService.sendPrivateMessage(f.value.msg, this.id, this.currentIdUser).subscribe({
        next:(data) => {
          if (data == true)
            this.chatSocketService.updateConversationList(this.currentIdUser, this.currentIdUser.toString(), this.id);
          this.chatSocketService.updateConversationList(this.id, this.id.toString(), -1);
          this.msg = ""
          this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        },
      })
    }
  }

  updateCurrentChatConv(){
    this.currentConversation =  "Main Conversation"
    this.currentIdConv = -1
    this.currentIdUser = -1
    this.chatService.getBlockedUsers(this.id).subscribe({
      next: data => {
        this.blockedUsers = data;
        this.chatSocketService.upChat(0);
        this.chatSocketService.updateChatList();
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    })
  }

  isBlocked(login: string) : Boolean {
      for (var i = 0; i < this.blockedUsers.length; i++){
        if (this.blockedUsers[i].login == login)
          return true
      }
      return false
  }

  updateCurrentConv(conv : ConversationListInterface) {
    this.currentIdUser = conv.id;
    this.currentIdConv = conv.room;
    this.currentConversation = conv.name;
    this.relationService.getStatus(this.id, conv.id).subscribe({
      next: relation => {
      this.status = relation;
      this.chatSocketService.updateConversationList(this.id, this.id.toString(), -1);
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;

    }})
  }

  createPrivateConv(id_dest: number, username: string){
    this.currentIdConv = id_dest
    this.currentIdUser = id_dest
    this.currentConversation = username
    this.chatService.createRoom(this.id, id_dest).subscribe({
      next:() => {
        this.chatSocketService.updateConversationList(this.id, this.id.toString(), -1);
        this.chatSocketService.updateConversationList(id_dest, id_dest.toString(), id_dest);}
      }
    )
  }
  
  clickUserProfile() : void {
    this.router.navigateByUrl('/user-profile');
  }
  game() : void {
    this.router.navigateByUrl('/game');
  }
  overview() : void {
    this.router.navigateByUrl('/overview');
  }
}
