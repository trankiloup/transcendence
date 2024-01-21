import { Injectable } from '@nestjs/common';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { score } from '../pong-socket/Interface/score.interface';
import { RpsScoreInt } from './Interface/RpsScore.interface';
import { ScoreService } from 'src/game/score/score.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RpsSocketService {

    constructor(
        private matchmakingService : MatchmakingService,
        private scoreService : ScoreService,
        private userService : UserService
    ){}

    async setGameStarted(room : number)
    {
        await this.matchmakingService.setMatchStarted(room)
    }

    async registerScore(score : RpsScoreInt)
    {
        await this.scoreService.rpsRegisterScore(score)
        await this.setRank(score)
    }

    async removeMatchFromMatchmaking(room : number)
    {
        await this.matchmakingService.deletematchMaking(room)
    }

    async setIngameStatus(login : string)
    {
        await this.userService.gameUpdateUserStatus(login, 'INGAME')
    }

    async setOnlineStatus(login : string)
    {
        await this.userService.gameUpdateUserStatus(login, 'ONLINE')
    }

    //update player rank
    async setRank(score : RpsScoreInt)
    {
        await this.userService.setRpsRank(score)
    }

}
