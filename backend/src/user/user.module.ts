import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from './Entities/user.entity'
import { JwtService } from '@nestjs/jwt';
import { matchEntity } from 'src/game/Entities/OneVsOneMatch.entity';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';



@Module({
  imports: [TypeOrmModule.forFeature([User, matchEntity])],
  controllers: [UserController],
  providers: [UserService, JwtService, MatchmakingService],
  exports: [UserService]
})
export class UserModule {}
