import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from 'src/chat/chat.service';
import { Chat } from 'src/chat/Entities/chat.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/Entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { PrivateMessage } from 'src/chat/Entities/priv-msg.entity';
import { Conversations } from 'src/chat/Entities/conversations.entity';
import { Relations, relationStatus } from 'src/user/relations/Entity/relations.entity';
import { RelationsService } from 'src/user/relations/relations.service';

@Module({
    // imports:[TypeOrmModule.forFeature([User]), UserModule],
    imports:[TypeOrmModule.forFeature([User, Chat, PrivateMessage, Conversations, Relations])],
    providers:[ChatGateway, ChatService, UserService, JwtService, RelationsService],
})
export class ChatSocketModule {}