import { Module } from '@nestjs/common';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingService } from './matchmaking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { matchEntity } from '../Entities/OneVsOneMatch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([matchEntity]),
    UserModule
  ],
  controllers: [MatchmakingController],
  providers: [MatchmakingService],
  exports: [MatchmakingService, TypeOrmModule]

})
export class MatchmakingModule {}
