import { Module } from '@nestjs/common';
import { GameGateway } from './game-socket.gateway';
import { ScoreService } from 'src/game/score/score.service';
import { GameSocketService } from './game-socket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pvpScoreEntity } from 'src/game/score/Entitites/pvpScore.entity';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { matchEntity } from 'src/game/Entities/OneVsOneMatch.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/Entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { tournamentScoreEntity } from 'src/game/score/Entitites/tournamentScore.entity';
import { rpsScoreEntity } from 'src/game/score/Entitites/rpsScore.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([pvpScoreEntity, matchEntity, User, tournamentScoreEntity, rpsScoreEntity])
  ],
  providers: [GameGateway, GameSocketService, ScoreService, MatchmakingService, UserService, JwtService]
})
export class GameSocketModule {}
