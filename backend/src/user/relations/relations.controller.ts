import { Controller, Get, Post, Param, ParseIntPipe, Body, UseGuards, Req, Res, HttpException, NotFoundException, InternalServerErrorException, Put, BadRequestException } from '@nestjs/common';
import { Request, Response} from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Relations } from './Entity/relations.entity';
import { UserService } from 'src/user/user.service';
import { RelationsService } from './relations.service';
import { userIdLoginDto } from '../Dto/userIdLogin.dto';
import { RelationDTO } from './DTO/relation.dto';
import { usersDTO } from './DTO/users.dto';
import { BlockedListDTO } from './DTO/blockedList.dto';


@Controller('relations')
export class RelationsController {

    constructor (
        private userService : UserService,
        private relationsService : RelationsService,
        @InjectRepository(Relations) private relationsRepository: Repository<Relations>,

    ){};

    @Post('member')
    async registredNewMember( @Req() req: Request, @Body() user : userIdLoginDto) 
    {
        return this.relationsService.NewMember(user);
    }

    @Post('update-status')
    async updateRelationStatus( @Req() req:Request, @Body() relation : RelationDTO){
        return this.relationsService.updateStatus(relation.user1, relation.user2, relation.status);
    }

    @Get('status/:user1/:user2')
    async getStatusBtId(@Param('user1') user1: number, @Param('user2') user2 : number) {
        return this.relationsService.getStatus(user1, user2);
    }

    @Get('blocked-users/:id')
    async getBlockedUsers ( @Param('id') id: number ) : Promise<BlockedListDTO[]> 
    {
        return this.relationsService.getBlockedUsersList(id);
    }
}