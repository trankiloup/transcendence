import { Controller, Post, Body, Get, Req, Param, UseGuards, Res, HttpStatus, UnauthorizedException, HttpCode, Redirect, Query } from '@nestjs/common';
import { User } from 'src/user/Entities/user.entity';
import { AuthService } from './auth.service';
import { signUpDto } from './DTO/signup.dto';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) { }

    @Get('isloggedin')
    async isUserLoggedIn(@Req() req: Request): Promise<boolean> {
        return this.authService.isTokenValid(req)
    }

    // Test whithout API 42 //

    // @Post('login')
    // async login(@Req() req: Request,
    //     @Body() newuser: signUpDto
    // ) {
    //     let user = await this.userService.getUserByLogin(newuser.login)
    //     // console.debug(user);
    //     if (!user)
    //         user = await this.authService.createUser(newuser.login)
    //     this.userService.updateUserStatus(user, 'ONLINE')
    //     return this.authService.signToken(user, true)
    // }

    @Get('callback')
    async ft_callback42(@Query('code') code: string, @Res() res: Response) {
        const accessToken = await this.authService.getAccessTokenApi(code);
        // console.log("Token -> ", accessToken);
        const data = await this.authService.getUserInfApi(accessToken);
        // console.log("DATA -> ", data);
        let user = await this.authService.userIsRegisteredbyLogin(data.login)
        if (!user) {
            user = await this.authService.createUser(data);
        }
        // this.userService.updateUserStatus(user, 'ONLINE')
        if (user.twofa === -1){
            const tokenJwt = await this.authService.signToken(user, true);
            this.userService.updateUserStatus(user, 'ONLINE');
            res.redirect(`https://localhost:4200/redirect?token=${tokenJwt.access_token}`)
        }
        else {
            const tokenJwt = await this.authService.signToken(user, false);
            res.redirect(`https://localhost:4200/redirect?token=${tokenJwt.access_token}`)
        }
        // console.log("token JWT -> ", tokenJwt.access_token, " ... ", accessToken)
    }

    @Get('activated')
    async isActivatedTwoFa(@Req() req: Request){
        const user: User = await this.userService.extractUserFromReq(req);
        if (!user)
            return 0;
        else
            return user.twofa;
    }

    @Get('update-status/:status')
    async updateStatus(@Req() req: Request, @Param('status') status : number) {
        // console.log("update status", status)
        const user: User = await this.userService.extractUserFromReq(req);
        if (!user)
            return false;
        this.authService.updateStatusTwoFa(user.login, status);
    }

    @Get('jwt')
    async newJwtToken(@Req() req: Request) {
        const bool: boolean = true;
        const user: User = await this.userService.extractUserFromReq(req);
        this.userService.updateUserStatus(user, 'ONLINE')
        return await this.authService.signToken(user, bool);
    }

    @UseGuards(JwtAuthGuard)
    @Get('logout')
    @HttpCode(HttpStatus.OK)
    async signout(@Req() req: Request) {
        return this.authService.logout(req)
    }
}
