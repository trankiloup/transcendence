import { Injectable, NotFoundException, InternalServerErrorException, Req, Res, BadRequestException, forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import {Request, Response} from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './Entities/chat.entity';
import { getChatListDTO } from './DTO/getChatList.dto'; 
import { UserService } from 'src/user/user.service';
import { PrivateMessage } from './Entities/priv-msg.entity';
import { Conversations } from './Entities/conversations.entity';
import { getConversationsDTO } from './DTO/getConversations.dto';
import { relationStatus } from 'src/user/relations/Entity/relations.entity';
import { RelationsService } from 'src/user/relations/relations.service';

@Injectable()
export class ChatService {

    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        @InjectRepository(PrivateMessage) private privateMessageRepository: Repository<PrivateMessage>,
        @InjectRepository(Conversations) private conversationsRepository: Repository<Conversations>,
        private userService : UserService,
      ) {};
      
      async saveChatMessage(user: string, newMessage: string) : Promise<Chat>
      {
          const newChat : Chat = new Chat();
          newChat.login = user
          newChat.message = newMessage
          return this.chatRepository.save(newChat)
      }

      async savePrivateMessage(id_auth: number, id_dest: number, message: string) : Promise<PrivateMessage>
      {
        const newMessage : PrivateMessage = new PrivateMessage();
        newMessage.id_auth = id_auth
        let user = await this.userService.findUserById(id_auth)
        newMessage.user_auth = user
        newMessage.id_dest = id_dest
        user = await this.userService.findUserById(id_dest)
        newMessage.user_dest = user
        newMessage.message = message
        let room = await this.getRoom(id_auth, id_dest)
        newMessage.room = room.room
        newMessage.conversation = room
        this.conversationsRepository.save(room)
        return this.privateMessageRepository.save(newMessage)
      }

      async createConversation(id_1: number, id_2: number)
      {
        let conv : Conversations = await this.conversationsRepository.findOne({
          where : [
            {id_1:id_1, id_2:id_2},
            {id_1:id_2, id_2:id_1},
          ]
        })
        if (conv)
          return 
        const newConversation : Conversations = new Conversations();
        newConversation.id_1 = id_1
        newConversation.id_2 = id_2
        let user = await this.userService.findUserById(id_1)
        newConversation.user_1 = user
        user = await this.userService.findUserById(id_2)
        newConversation.user_2 = user
        return this.conversationsRepository.save(newConversation)
      }

      async getAllMessages() : Promise<Array<Chat>>
      {
        return this.chatRepository.find({});
      }

      async getRoom(id1: number, id2: number) : Promise<Conversations | null> {
        const conv = await this.conversationsRepository.findOne({
          where : [
            { id_1: id1, id_2: id2},
            { id_2: id1, id_1: id2},
          ]
        })
        if (conv)
          return conv
        return null
      }

      async getConversationsById(id_user: number): Promise<getConversationsDTO[] | null> {
        try {
          const conversations: Conversations[] = await this.conversationsRepository.find({
            where: [
              { id_1: id_user },
              { id_2: id_user },
            ],
            relations: ['messages'],
          });
      
          const rooms: getConversationsDTO[] = conversations.map(Convs => ({
            id_1: Convs.id_1,
            id_2: Convs.id_2,
            user_1: Convs.user_1.username,
            user_2: Convs.user_2.username,
            room: Convs.room,
            conversations: Convs.messages.map(Messages => ({
              id_auth: Messages.id_auth,
              id_dest: Messages.id_dest,
              message: Messages.message,
              username_auth: Messages.user_auth.username,
              username_dest: Messages.user_dest.username,
            })),
          }));
      
          return rooms;

        } catch (error) {
          console.error(error);
          throw new InternalServerErrorException("Error on reading conversations");
        }
      }

      async getChatList() : Promise<Array<getChatListDTO>>{
        try {
          let chatList : getChatListDTO[] = []
          const chats : Chat[] = await this.getAllMessages();
          if (chats) {
              chatList = chats.map(Chat => ({
              login : Chat.login,
              message : Chat.message, 
              username : ""
            }))
          }
          return chatList
        }
        catch {
          throw new InternalServerErrorException("error getChatList")
        }
      }
}
