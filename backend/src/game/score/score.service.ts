import { Injectable } from '@nestjs/common';
import { scoreDTO } from './DTO/score.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { pvpScoreEntity } from './Entitites/pvpScore.entity';
import { Repository } from 'typeorm';
import { tournamentScoreEntity } from './Entitites/tournamentScore.entity';
import { TournementScoreLogin } from 'src/sockets/global/Interfaces/tournamentScoreLogin.interface';
import {matchEntity, matchStatus} from "../Entities/OneVsOneMatch.entity";
import { match } from 'assert';
import { RpsScoreInt } from 'src/sockets/rps-socket/Interface/RpsScore.interface';
import { rpsScoreEntity } from './Entitites/rpsScore.entity';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(pvpScoreEntity)
    private readonly pvpScoreRepository: Repository<pvpScoreEntity>,
    @InjectRepository(tournamentScoreEntity)
    private tournamentScoreRepository : Repository<tournamentScoreEntity>,
    @InjectRepository(matchEntity)
    private matchRepository : Repository<matchEntity>,
    @InjectRepository(rpsScoreEntity)
    private rpsScoreRepository : Repository<rpsScoreEntity>
  ) {}


    async registerScore(score : scoreDTO)
    {
      const leftScore: pvpScoreEntity = new pvpScoreEntity();
      leftScore.player_login = score.player;
      leftScore.opponent = score.opponent;
      leftScore.created = new Date();
      leftScore.player_score = score.player_score;
      leftScore.opponent_score = score.opponentscore;
      if (score.player > score.opponent) leftScore.win = true;
      else leftScore.win = false;
      await this.pvpScoreRepository.save(leftScore);

    const rightscore: pvpScoreEntity = new pvpScoreEntity();
    rightscore.opponent = score.player;
    rightscore.player_login = score.opponent;
    rightscore.created = new Date();
    rightscore.opponent_score = score.player_score;
    rightscore.player_score = score.opponentscore;
    if (score.player < score.opponent) rightscore.win = true;
    else rightscore.win = false;
    await this.pvpScoreRepository.save(rightscore);
  }

  async getAllPlayerMatchesPvp(playerLogin: string): Promise<pvpScoreEntity[]> {
    return this.pvpScoreRepository.find({
      where: { player_login: playerLogin },
    });
  }
  async getAllPlayerMatchesRps(playerLogin: string): Promise<pvpScoreEntity[]> {
    return this.rpsScoreRepository.find({
      where: { player_login: playerLogin },
    });
  }
/*
  async getAllPlayerMatchesTournament(playerLogin: string): Promise<tournamentScoreEntity[]> {
    return this.tournamentScoreRepository.find({
      where: { player1_rank: playerLogin },
    });
  }
*/
  async getAllPlayerMatchesTournament(playerLogin: string): Promise<tournamentScoreEntity[]> {
    return this.tournamentScoreRepository.createQueryBuilder('tournamentScore')
        .where('tournamentScore.player1_rank = :playerLogin', { playerLogin })
        .orWhere('tournamentScore.player2_rank = :playerLogin', { playerLogin })
        .orWhere('tournamentScore.player3_rank = :playerLogin', { playerLogin })
        .orWhere('tournamentScore.player4_rank = :playerLogin', { playerLogin })
        .getMany();
  }
  async registerTournamentScore(score : TournementScoreLogin)
  {
      let scoreEntity = new tournamentScoreEntity()

      scoreEntity.player1_rank = score.rank1
      scoreEntity.player2_rank = score.rank2
      scoreEntity.player3_rank = score.rank3
      scoreEntity.player4_rank = score.rank4

      await this.tournamentScoreRepository.save(scoreEntity)
  }

  //set match full and finished remove player from queuing
  async setFinishToTournament(matchs : matchEntity[])
  {
    for (const match of matchs)
    {
      match.full = true
      match.finished = true
      await this.matchRepository.save(match)
    }
  }

  async getWinnerFromMatch(match : matchEntity) : Promise<string>
  {
    if (!match)
      return null
    if (match.player1_login && match.player2_login && match.finished)
    {
      if (match.player1_login > match.player2_login)
        return match.player1_login
      else if (match.player1_score < match.player2_score)
        return match.player2_login
    }
    return null
  }

  async getLooserFromMatch(match : matchEntity) : Promise<string>
  {
    if (!match)
      return null
    if (match.player1_login && match.player2_login && match.finished)
    {
      if (match.player1_login < match.player2_login)
        return match.player1_login
      else if (match.player1_score > match.player2_score)
        return match.player2_login
    }
    return null
  }

  async matchTimeOut(globalRoom : number)
  {
    // let score = new TournementScoreLogin()

    const matchs : matchEntity []= await this.matchRepository.find({where : {tournament_id : globalRoom}})
    if (!matchs)
      return
    this.setFinishToTournament(matchs)

  //   let global : matchEntity
  //   let match1 : matchEntity
  //   let match2: matchEntity
  //   let final : matchEntity

  //   for (const match of matchs)
  //   {
  //     if (match.matchStatus === matchStatus.GLOBAL)
  //       global = match
  //     else if (match.matchStatus === matchStatus.MATCH1)
  //       match1 = match
  //     else if (match.matchStatus === matchStatus.MATCH2)
  //       match2 = match
  //     else if (match.matchStatus === matchStatus.FINAL)
  //       final = match
  //   }



  //   //game not started
  //   if (!match1)
  //   {
  //     this.setFinishToTournament(matchs)
  //     return
  //   }

  //   if (!match1.finished && !match2.finished)
  //   {
  //     this.setFinishToTournament(matchs)
  //     return
  //   }

  //  //not final played, no winner or looser
  //   if (match1.finished && match2.finished && !final.finished)
  //   {
  //     this.setFinishToTournament(matchs)
  //     return
  //   }


  //   //match1 played
  //   if (match1.finished && !match2.finished)
  //   {
  //     score.rank1 = await this.getWinnerFromMatch(match1)
  //     score.rank2 = await this.getLooserFromMatch(match1)
  //     score.rank3 = match2.player1_login
  //     score.rank4 = match2.player2_login
  //     this.registerTournamentScore(score)
  //     this.setFinishToTournament(matchs)
  //     return
  //   }

  //   //match2 played
  //   if (match2.finished && !match1.finished)
  //   {
  //     score.rank1 = await this.getWinnerFromMatch(match2)
  //     score.rank2 = await this.getLooserFromMatch(match2)
  //     score.rank3 = match1.player1_login
  //     score.rank4 = match1.player2_login
  //     this.registerTournamentScore(score)
  //     this.setFinishToTournament(matchs)
  //     return
  //   }

  //   if (final.finished)
  //   {
  //     score.rank1 = await this.getWinnerFromMatch(final)
  //     score.rank2 = await this.getLooserFromMatch(final)
  //     score.rank3 = await this.getLooserFromMatch(match1)
  //     score.rank4 = await this.getLooserFromMatch(match2)
  //     this.registerTournamentScore(score)
  //     this.setFinishToTournament(matchs)
  //     return
  //   }
  //     this.setFinishToTournament(matchs)
  }


  async rpsRegisterScore(scores : RpsScoreInt)
  {
      let leftscore = new rpsScoreEntity()
      leftscore.player_login = scores.player1_login
      leftscore.opponent = scores.player2_login
      leftscore.player_score = scores.player1_score
      leftscore.opponent_score = scores.player2_score
      if (scores.player1_score > scores.player2_score)
        leftscore.win = true
      else
        leftscore.win = false
      await this.rpsScoreRepository.save(leftscore)

      let rightscore = new rpsScoreEntity()
      rightscore.player_login = scores.player2_login
      rightscore.opponent = scores.player1_login
      rightscore.player_score = scores.player2_score
      rightscore.opponent_score = scores.player1_score
      if (scores.player2_score > scores.player1_score)
        rightscore.win = true
      else
        rightscore.win = false
        await this.rpsScoreRepository.save(rightscore)
  }
}
