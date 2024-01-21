import { Injectable, NotFoundException, InternalServerErrorException, Req, Res, BadRequestException, forwardRef, Inject, UnauthorizedException } from '@nestjs/common';
import {Request, Response} from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { Relations, relationStatus } from './Entity/relations.entity';
import { User } from '../Entities/user.entity';
import { userIdLoginDto } from '../Dto/userIdLogin.dto';
import { BlockedListDTO } from './DTO/blockedList.dto';

@Injectable()
export class RelationsService {

    constructor(
        @InjectRepository(Relations) private relationsRepository: Repository<Relations>,
        private userService : UserService,
      ) {};

        async NewMember(id: userIdLoginDto) {
            try{
                const relationrep : Relations[] = await this.relationsRepository.find({where: {id_1: id.id}})
                if (relationrep[0])
                    return 
                    
                let listUsers : User[] = await this.userService.getAllUser();
                let id_user : User = await this.userService.findUserById(id.id);
                listUsers.forEach(Users => {
                    if(Users.id != id.id){
                    const relation1 : Relations = new Relations();
                    relation1.id_1 = id.id;
                    relation1.id_2 = Users.id;
                    relation1.user_2 = Users;
                    relation1.status = relationStatus.NONE;
                    relation1.relation = id_user;
                    this.relationsRepository.save(relation1);
                    const relation2 : Relations = new Relations();
                    relation2.id_1 = Users.id;
                    relation2.id_2 = id.id;
                    relation2.user_2 = id_user;
                    relation2.status = relationStatus.NONE;
                    relation2.relation = Users;
                    this.relationsRepository.save(relation2);}
                })
                return
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        
        }
        
    async updateStatus(user1: number, user2: number, status: string){
        try {
            let relation : Relations = await this.relationsRepository.findOne({where : {id_1:user1, id_2:user2}})
            let bis : Relations = await this.relationsRepository.findOne({where : {id_1:user2, id_2:user1}})
            if (!relation || !bis)
                return

            if (status == "DEBLOCKED") {
                if (bis.status == relationStatus.BLOCKED)
                    relation.status = relationStatus.ME_BLOCKED
                else {
                    relation.status = relationStatus.NONE
                    bis.status = relationStatus.NONE
                }
            }
            else if (status == "NONE") {
                relation.status = relationStatus.NONE
                bis.status = relationStatus.NONE
            }
            else if (status == "FRIEND") {
                if (relation.status == relationStatus.INVITED) {
                    relation.status = relationStatus.FRIEND
                    bis.status = relationStatus.FRIEND
                }
                else {
                    relation.status = relationStatus.PENDING
                    bis.status = relationStatus.INVITED
                }
            }
            else if (status == "BLOCKED"){
                 relation.status = relationStatus.BLOCKED;
                 if (bis.status != relationStatus.BLOCKED)
                    bis.status = relationStatus.ME_BLOCKED;
            }
            else throw new NotFoundException('Status does not exist');
            await this.relationsRepository.save(relation);
            await this.relationsRepository.save(bis);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getFriends(user: number) : Promise<Relations[]> {
        try {
            let relations : Relations[] = await this.relationsRepository.find(
                {where: {id_1: user}})
            return relations;
        }
        catch (error) {
            console.log(error)
            throw error;
        }
    }

    async getStatus(user1: number, user2: number) : Promise<relationStatus>{
        try {
            const relation : Relations = await this.relationsRepository.findOne({where: {id_1:user1, id_2:user2}})
            if (!relation)
                return 0
            return relation.status
        }
        catch (error) {
            console.log(error)
            throw error;
        }
    }


    async getBlockedUsersList(id: number) : Promise<BlockedListDTO[]> {
        try {
            const relations : Relations[] = await this.relationsRepository.find({where: {id_1: id, status: relationStatus.BLOCKED}})
            if (!relations)
                return []
            const blockedList : BlockedListDTO[] = relations.map(Rel => ({
                login: Rel.user_2.login,
            }))
            return blockedList;
        }
        catch {
          throw new InternalServerErrorException("error getChatList")
        }
      }

}
