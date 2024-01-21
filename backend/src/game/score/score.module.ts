import { Module } from '@nestjs/common';
import { PvpScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pvpScoreEntity } from './Entitites/pvpScore.entity';
import { tournamentScoreEntity } from './Entitites/tournamentScore.entity';
import { matchEntity } from '../Entities/OneVsOneMatch.entity';
import { rpsScoreEntity } from './Entitites/rpsScore.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([pvpScoreEntity, tournamentScoreEntity, matchEntity, rpsScoreEntity])
  ],
  controllers: [PvpScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
