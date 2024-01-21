import { Module } from '@nestjs/common';
import { GlobalGateway } from './global-socket.gateway';
import { GlobalSocketService } from './global-socket.service';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pvpScoreEntity } from 'src/game/score/Entitites/pvpScore.entity';
import { matchEntity } from 'src/game/Entities/OneVsOneMatch.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/Entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ScoreService } from 'src/game/score/score.service';
import { tournamentScoreEntity } from 'src/game/score/Entitites/tournamentScore.entity';
import { AuthService } from 'src/auth/auth.service';
import { rpsScoreEntity } from 'src/game/score/Entitites/rpsScore.entity';

@Module({

    imports : [
        TypeOrmModule.forFeature([pvpScoreEntity, matchEntity, User, tournamentScoreEntity, rpsScoreEntity])
    ],
    providers:[
        GlobalGateway, GlobalSocketService, MatchmakingService, UserService,
        JwtService, ScoreService, AuthService
    ]
})
export class GlobalSocketModule {}
