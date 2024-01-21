import { Injectable } from '@nestjs/common';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { UserService } from 'src/user/user.service';
import { MatchInfo } from 'src/game/Interface/matchInfo.interface';
import { ScoreService } from 'src/game/score/score.service';
import { TournementScoreLogin } from './Interfaces/tournamentScoreLogin.interface';
import { AuthService } from 'src/auth/auth.service';
import { finalistLogin } from './Interfaces/finalistLogin.interface';

@Injectable()
export class GlobalSocketService {

    constructor(
        private matchMakinginService : MatchmakingService,
        private scoreService : ScoreService,
        private authService : AuthService,
        private userService : UserService
    ){}


    async getMatchInfo(roomId : string) : Promise<MatchInfo>
    {

        const matchInfo = await this.matchMakinginService.getMatchInfo(roomId)
        return matchInfo
    }


    async registerScore(score : TournementScoreLogin)
    {
        await this.scoreService.registerTournamentScore(score)
    }

    async setUserOffline(login : string)
    {
        await this.authService.logoutFromLogin(login)
    }

    async setUserOnline(login : string)
    {
        await this.userService.updateUserStatusFromLogin(login, 'ONLINE')
    }

    async registerFinalist(globalRoom : string, finalist : finalistLogin)
    {
        await this.matchMakinginService.registerToFinal(globalRoom, finalist)
    }

    async removeAllQueues()
    {
        await this.matchMakinginService.deleteAllQueues()
    }

    async matchTimout(globalRoom : string)
    {
        this.scoreService.matchTimeOut(+globalRoom)
    }

}

