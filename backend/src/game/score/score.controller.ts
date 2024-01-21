import { Controller, Get, Param } from '@nestjs/common';
import { ScoreService } from './score.service';

@Controller('player-matches')
export class PvpScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('pvp/:playerLogin')
  async getAllPlayerMatchesPvp(@Param('playerLogin') playerLogin: string) {
    return this.scoreService.getAllPlayerMatchesPvp(playerLogin);
  }

  @Get('rps/:playerLogin')
  async getAllPlayerMatchesRps(@Param('playerLogin') playerLogin: string) {
    return this.scoreService.getAllPlayerMatchesRps(playerLogin);
  }
  @Get('tournament/:playerLogin')
  async getAllPlayerMatchesTournament(@Param('playerLogin') playerLogin: string) {
    return this.scoreService.getAllPlayerMatchesTournament(playerLogin);
  }
}
