import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProfileService } from '../user-profile/user-profile.service';
import { Observable } from 'rxjs';
import { ChatSocketService } from '../sockets/chat-socket/chat-socket.service';
import { getIdUser } from '../interfaces/getIdUser.interface';
import { ConversationInterface } from '../interfaces/struct-conversations.interface';
import { Router } from '@angular/router';
import { BlockedList } from '../interfaces/blockedList.interface';

@Injectable({
    providedIn: 'root'
  })
  export class ChatService {
  
    constructor(
      private httpClient:HttpClient,
      private userProfileService:UserProfileService,
      private chatSocketService: ChatSocketService,
      private router: Router,
       ) {}

    getUserId() {
      const url = 'https://localhost:3000/chat/user-id'
      return this.httpClient.get<getIdUser>(url)
    }

    getRoom() {
      const url = 'https://localhost:3000/chat/room'
      return this.httpClient.get<ConversationInterface>(url)
    }

    createRoom(id_1: number, id_2: number) {
      const url = 'https://localhost:3000/chat/new-conversation'
      const body = {id_1: id_1, id_2: id_2}
      return this.httpClient.post(url, body)
    }

    getAllConversations(id : number)
    {
      return this.httpClient.get<ConversationInterface[]>(`https://localhost:3000/chat/${id}`)
    }

    sendMessageChat(newMessage: string, login: string) {
      const url = 'https://localhost:3000/chat/new-chat-message'
      const body = {login: login, message: newMessage};
      return this.httpClient.post(url, body)
    }

    sendPrivateMessage(newMessage: string, author: number, dest: number) {
      const url = 'https://localhost:3000/chat/new-private-message'
      const body = {id_auth: author, id_dest: dest, message: newMessage};
      return this.httpClient.post(url, body)
    }

    getBlockedUsers(id: number) {
      return this.httpClient.get<BlockedList[]>(`https://localhost:3000/relations/blocked-users/${id}`)
    }

  }