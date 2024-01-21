import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/Entities/user.entity';
import { UserService } from 'src/user/user.service';
import { jwtStrategy } from '../Strategies/jwt.strategy';
import { TwoFaController } from './two-fa.controller';
import { TwoFaService } from './two-fa.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), JwtModule,
  ],
  controllers: [TwoFaController],
  providers: [TwoFaService, jwtStrategy, UserService, ConfigService],
  exports: [TwoFaService]

})
export class TwoFaModule { }
