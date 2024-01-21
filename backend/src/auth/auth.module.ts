import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/Entities/user.entity'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { jwtStrategy } from './Strategies/jwt.strategy';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { MatchmakingModule } from 'src/game/matchmarking/matchmaking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10800s' }
    }),
    MatchmakingModule
  ],
  controllers: [AuthController],
  providers: [AuthService, jwtStrategy, UserService, MatchmakingService],
  exports: [AuthService]
})
export class AuthModule { }
