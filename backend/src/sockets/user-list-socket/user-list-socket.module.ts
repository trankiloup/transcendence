import { Module } from '@nestjs/common';
import { UserListGateway } from './user-list.gateway';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/Entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { matchEntity } from 'src/game/Entities/OneVsOneMatch.entity';

@Module({
    // imports:[TypeOrmModule.forFeature([User]), UserModule],
    imports:[TypeOrmModule.forFeature([User, matchEntity])],
    providers:[UserListGateway, UserService, JwtService, AuthService, MatchmakingService],
})
export class UserListSocketModule {}
