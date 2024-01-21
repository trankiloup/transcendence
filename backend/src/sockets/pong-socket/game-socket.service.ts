import { Injectable } from '@nestjs/common';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import { scoreDTO } from 'src/game/score/DTO/score.dto';
import { ScoreService } from 'src/game/score/score.service';
import { getScore } from './Interface/getScore.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameSocketService {

    constructor(
        private ScoreService : ScoreService,
        private matchmakingService : MatchmakingService,
        private userService : UserService
        ){

    }

    sendScore(score : scoreDTO)
    {
        this.ScoreService.registerScore(score)
    }


    //enregistrer les scores dans la db et previens 
    async tournamentRegisterScore(room, leftplayerScore, righplayerScore)
    {
        await this.matchmakingService.tournamentUpdateScores(room, leftplayerScore, righplayerScore)
       
    }


    async setIngameStatus(login : string)
    {
        await this.userService.gameUpdateUserStatus(login, 'INGAME')
    }

    async setOnlineStatus(login : string)
    {
        await this.userService.gameUpdateUserStatus(login, 'ONLINE')
    }

    async deleteGame(room : string)
    {
        await this.matchmakingService.pvpDeleteRoom(room)
    }
}
