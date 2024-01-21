import { Controller, Post, Body, Get, Req, Param, UseGuards, Res, HttpStatus, UnauthorizedException, HttpCode } from '@nestjs/common';
import { User } from 'src/user/Entities/user.entity';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { TwoFaService } from './two-fa.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../Guards/jwt-auth.guard';



@Controller('two-fa')
export class TwoFaController {

    constructor(
        private twoFaService: TwoFaService,
        private userService: UserService,
    ) { }

    // @Get('auth')
    // async checkAuth() {
    //     console.log("check auth");
    // }

    @UseGuards(JwtAuthGuard)
    @Get('mail')
    async sendMail(@Req() req: Request) {
        const login = await this.userService.extractLoginFromJWT(req);
        if (!login)
            return
        this.twoFaService.sendMail(login);
    }

    @UseGuards(JwtAuthGuard)
    @Get('autorization/:code')
    async getAutorization(@Req() req: Request, @Param('code') code: string): Promise<boolean> {

        const user: User = await this.userService.extractUserFromReq(req);
        if (!user)
            return false;

        return this.twoFaService.getAutorization(user, code)
    }

    // @Get('jwt')
    // async newJwtToken(@Req() req: Request) {
    //     const bool: boolean = true;
    //     const user: User = await this.userService.extractUserFromReq(req);
    //     //ok ici
    //     const token = await this.twoFaService.newTokenJwt(user, bool);
    //     console.log(token)
    //     return (token);
    // }
    //     const user: User = await this.userService.extractUserFromReq(req);
    //     return await this.authService.signToken(user, true);
    // }

}
