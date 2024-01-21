import { Controller, Get, Post, Param, ParseIntPipe, Body, UseGuards, Req, Res, HttpException, NotFoundException, InternalServerErrorException, Put, BadRequestException } from '@nestjs/common';
import { Chat } from './Entities/chat.entity';
import { ChatService } from './chat.service';
import { Request, Response} from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getChatListDTO } from './DTO/getChatList.dto';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from 'src/auth/Guards/jwt-auth.guard';
import { userIdLoginDto } from 'src/user/Dto/userIdLogin.dto';
import { getPrivateMsgDTO } from './DTO/getPrivateMessage.dto';
import { PrivateMessage } from './Entities/priv-msg.entity';
import { Conversations } from './Entities/conversations.entity';
import { getConversationsDTO } from './DTO/getConversations.dto';
import { RelationsService } from 'src/user/relations/relations.service';
import { relationStatus } from 'src/user/relations/Entity/relations.entity';

@Controller('chat')
export class ChatController {

    constructor (
        private chatService : ChatService,
        private userService : UserService,
        private relationsService : RelationsService,
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        @InjectRepository(PrivateMessage) private privateMessageRepository: Repository<PrivateMessage>,
        @InjectRepository(Conversations) private conversationsRepository: Repository<Conversations>,

    ){};
         
    @UseGuards(JwtAuthGuard)
    @Get('user-id')
    async getUserId(@Req() req:Request) : Promise<userIdLoginDto>
    {
        return this.userService.extractIdLoginFromReq(req)
    }

    @UseGuards(JwtAuthGuard)
    @Post('new-chat-message')
    async sendChatMessage( @Req() req:Request, 
                        @Body() newmsg : getChatListDTO)
    {
        return this.chatService.saveChatMessage(newmsg.login, newmsg.message)
    }

    @UseGuards(JwtAuthGuard)
    @Post('new-private-message')
    async sendPrivateMessage( @Req() req:Request,
                            @Body() newmsg : getPrivateMsgDTO) : Promise<boolean>
    {        
        let status : relationStatus = await this.relationsService.getStatus(newmsg.id_dest, newmsg.id_auth);
        if (status == relationStatus.BLOCKED)
          return false;
        await this.chatService.savePrivateMessage(newmsg.id_auth, newmsg.id_dest, newmsg.message)
        return true;
    }

    @UseGuards(JwtAuthGuard)
    @Post('new-conversation')
    async createNewConversation( @Req() req: Request, 
                                @Body() newConv : getConversationsDTO)
    {
        return this.chatService.createConversation(newConv.id_1, newConv.id_2)
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllMessages( @Req() req) : Promise<Array<Chat>>
    {
        return this.chatService.getAllMessages()
    }

    @UseGuards(JwtAuthGuard)
    @Get('list')
    async getChatList() : Promise<Array<getChatListDTO>>
    {
        return this.chatService.getChatList()
    }
}