import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './Entities/chat.entity';
import { PrivateMessage } from './Entities/priv-msg.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from 'src/user/user.module';
import { Conversations } from './Entities/conversations.entity';
import { RelationsModule } from 'src/user/relations/relations.module';


@Module({
    imports: [TypeOrmModule.forFeature([Chat]), TypeOrmModule.forFeature([PrivateMessage]), TypeOrmModule.forFeature([Conversations]), UserModule, RelationsModule],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule {}
