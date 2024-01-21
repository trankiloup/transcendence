import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from "./user/user.module"
import { User } from './user/Entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/Entities/chat.entity';
import { UserListSocketModule } from './sockets/user-list-socket/user-list-socket.module';
import { GameSocketModule } from './sockets/pong-socket/game-socket.module';
import { MatchmakingModule } from './game/matchmarking/matchmaking.module';
import { matchEntity } from './game/Entities/OneVsOneMatch.entity';
import { ChatSocketModule } from './sockets/chat-socket/chat-socket.module';
import { ScoreModule } from './game/score/score.module';
import { pvpScoreEntity } from './game/score/Entitites/pvpScore.entity';
import { PrivateMessage } from './chat/Entities/priv-msg.entity';
import { Conversations } from './chat/Entities/conversations.entity';
import { GlobalSocketModule } from './sockets/global/global-socket.module';
import { tournamentScoreEntity } from './game/score/Entitites/tournamentScore.entity';
import { RpsSocketModule } from './sockets/rps-socket/rps-socket.module';
import { rpsScoreEntity } from './game/score/Entitites/rpsScore.entity';
import { TwoFaModule } from './auth/two-fa/two-fa.module';
import { Relations } from './user/relations/Entity/relations.entity';
import { RelationsModule } from './user/relations/relations.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}), //set .env globaly. Access by process.env.ENV_DATA
    TypeOrmModule.forRoot({                 //setup db
        type: 'postgres',
        host: process.env.PG_HOST,
        port: parseInt(<string>process.env.PG_PORT),
        username: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_NAME,
        entities: [User, matchEntity, pvpScoreEntity, Chat, PrivateMessage, Conversations, tournamentScoreEntity, rpsScoreEntity, Relations],                     //put your entities there
        synchronize: true,                // a virer en production
      }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      defaults: {
        from: `"Transcendence" <${process.env.CLI_EMAIL}>`,
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        }
      }
    }),
    UserModule,
    AuthModule,
    ChatModule,
    MatchmakingModule,
    UserListSocketModule,
    ChatSocketModule,
    ScoreModule,
    GameSocketModule,
    GlobalSocketModule,
    RpsSocketModule,
    RelationsModule,
    TwoFaModule,    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
