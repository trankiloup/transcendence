import { Module } from '@nestjs/common';
import { RpsSocketGateway } from './rps-socket.gateway';
import { RpsSocketService } from './rps-socket.service';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pvpScoreEntity } from 'src/game/score/Entitites/pvpScore.entity';
import { matchEntity } from 'src/game/Entities/OneVsOneMatch.entity';
import { User } from 'src/user/Entities/user.entity';
import { tournamentScoreEntity } from 'src/game/score/Entitites/tournamentScore.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ScoreService } from 'src/game/score/score.service';
import { rpsScoreEntity } from 'src/game/score/Entitites/rpsScore.entity';

@Module({

    imports : [
        TypeOrmModule.forFeature([pvpScoreEntity, matchEntity, User, tournamentScoreEntity, rpsScoreEntity])
    ],
    providers:[RpsSocketGateway, RpsSocketService, MatchmakingService, UserService, JwtService, ScoreService]
})
export class RpsSocketModule {}
