import { Injectable, numberAttribute } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomChatSocket } from './chat-custom-socket';
import { ChatInterface } from 'src/app/interfaces/struct-chat.interface';
import { ConversationListInterface } from 'src/app/interfaces/conversationList.interface';
import { FriendsList } from 'src/app/interfaces/friendsList.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService{

  constructor(
    private socket: CustomChatSocket,
    ) {
      // bon courage
    }

    /* Main Channel */

    chatUpdate$: Observable<ChatInterface[]> = this.socket.fromEvent('chatlist');

    updateChatList() : void {
      this.socket.emit('updateChatList')
    }

    newChat$ : Observable<number[]> = this.socket.fromEvent('new-chat')

    upChat(up : number) : void {
      this.socket.emit('up-chat', {up})
    }

    upChatRoom(room : string) : void {
      this.socket.emit('up-chat-room', {room})
    }

      /* Private Message */

      joinRoom(roomId: number) {
        this.socket.emit('joinRoom', roomId.toString())
      }
      
      conversationListUpdate$ : Observable<ConversationListInterface[]> = this.socket.fromEvent('convs')
  
    updateConversationList(id : number, roomId: string, other: number) {
      this.socket.emit('updateConvList', {id, roomId, other})
    }

      /* Relations */

      friendsListUpdate$ : Observable<FriendsList[]> = this.socket.fromEvent('friends-list')

      updateFriendsList(id: number, roomId: string) {
        this.socket.emit('updateFriendsList', {id, roomId})
      }

    //  blockedListUpdate$ : Observable<number[]> = this.socket.fromEvent('blocked-list')

      /*updateBlockedList(id: number, roomId: string) {
        this.socket.emit('updateBlockedList', {id, roomId})
      }*/


}


