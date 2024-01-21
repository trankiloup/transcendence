import {Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards} from '@nestjs/common';
import { Request, Response } from 'express';
import { MatchmakingService } from './matchmaking.service';
import { roomDto } from '../Dto/room.dto';
import { JwtAuthGuard } from 'src/auth/Guards/jwt-auth.guard';
import { typeDto } from '../Dto/typeDto.dto';
import { playerPosition } from '../Interface/player-position.interface';
import { PlayerTournamentInfo } from '../Interface/playerTournamentInfo.interface';
import { tournamentScore } from '../Interface/tournamentScore.Interface';
import { registerScoreTournament } from '../Interface/registerScoreTournament.interface';
import { roomNumberDto } from '../Dto/roomNumber.dto';
import { inviteUserId } from '../Interface/inviteUserId.dto';


@Controller('matchmaking')
export class MatchmakingController {

    constructor(
        private matchService : MatchmakingService

    ){}

    @UseGuards(JwtAuthGuard)
    @Get('removequeue')
    async removeplayerFromQueue( @Req() req : Request)
    {
        return this.matchService.removeFromQueue(req)
    }

    @UseGuards(JwtAuthGuard)
    @Get('tournament/removequeue')
    async removeplayerFromQueueTournament( @Req() req : Request)
    {
        return this.matchService.removeFromQueueTournament(req)
    }

    // @UseGuards(JwtAuthGuard)
    @Delete('delete')
    async deleteRoom( @Body() room : roomDto)
    {
        return this.matchService.deleteRoom(room)
    }


    @UseGuards(JwtAuthGuard)
    @Post('pvpjoinorcreate')
    async pvpJoinOrCreate(@Req() req: Request, @Body() type : typeDto, @Res() res: Response)
    {
        return this.matchService.pvpJoinOrCreate(req, type, res)
    }

    @UseGuards(JwtAuthGuard)
    @Post('matchjoinorcreate')
    async matchJoinOrCreate(@Req() req: Request, @Body() type : typeDto, @Res() res: Response)
    {
        return this.matchService.matchJoinOrCreate(req, type, res)
    }

    @UseGuards(JwtAuthGuard)
    @Post('register')
    async registerPvp(@Req() req:Request, @Body() type : typeDto) : Promise<boolean>
    {
        return this.matchService.registerMatch(req, type)
    }

    @UseGuards(JwtAuthGuard)
    @Get('getroom')
    async getRoom (@Req() req: Request) : Promise<number>
    {
        return this.matchService.getRoom(req)
    }

    @UseGuards(JwtAuthGuard)
    @Get('player-position')
    async getPlayerPosition(@Req() req: Request) : Promise <playerPosition>
    {
        return this.matchService.getPlayer(req)
    }


    @UseGuards(JwtAuthGuard)
    @Put('gamestarted')
    async gameStarted(@Req() req: Request, @Body() room : roomDto) : Promise <any>
    {
        return this.matchService.matchStarted(req, room)
    }

    @UseGuards(JwtAuthGuard)
    @Get('matchfull')
    async isMatchFull(@Req() req: Request) : Promise<boolean>
    {
        return this.matchService.isMatchFull(req)
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('tournament/isregistered')
    getPlayerTournamentInfo(@Req() req: Request) : Promise<PlayerTournamentInfo>
    {
        return this.matchService.getPlayerTournamentInfo(req)
    }

    @UseGuards(JwtAuthGuard)
    @Put('tournament/globalroom')
    getTournamentRoom(@Req() req: Request, @Body() room : roomDto) : Promise<roomDto>
    {
        return this.matchService.getTournamentRoom(req, room)
    }


    @UseGuards(JwtAuthGuard)
    @Get('rps/available')
    isAvailable(@Req() req:Request, @Res() res:Response)
    {
        return this.matchService.rpsAvailable(req, res)
    }

    @UseGuards(JwtAuthGuard)
    @Get('rps/register')
    rpsRegister(@Req() req : Request)
    {
        return this.matchService.rpsRegister(req)
    }


    @UseGuards(JwtAuthGuard)
    @Get('rps/meplayer')
    rpsGetMePlayer(@Req() req : Request)
    {
        return this.matchService.rpsGetMePlayer(req)
    }


    @UseGuards(JwtAuthGuard)
    @Put('rps/gamefull')
    rpsIsGameFull(@Req() req : Request, @Body() room : roomNumberDto) : Promise<boolean>
    {
        return this.matchService.rpsIsGameFull(req, room)
    }



    @UseGuards(JwtAuthGuard)
    @Put('rps/unregister')
    rpsUnregister(@Req() req : Request, @Body() room : roomNumberDto)
    {
        return this.matchService.rpsUnregister(req, room)
    }

    @UseGuards(JwtAuthGuard)
    @Post('invite')
    AmIAvailable(@Req() req : Request, @Body() userId: inviteUserId, @Res() res: Response)
    {
        return this.matchService.registerInvite(req, userId, res)
    }





}
