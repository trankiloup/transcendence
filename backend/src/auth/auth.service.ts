import { Injectable, InternalServerErrorException, BadRequestException, Req, Res, UnauthorizedException, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'
import { User, userStatus } from '../user/Entities/user.entity'
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken'
import { UserService } from 'src/user/user.service';
import { MatchmakingService } from 'src/game/matchmarking/matchmaking.service';
import axios, { AxiosResponse } from 'axios';

//inject forwardref because user and auth depend on each other
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private jwtService: JwtService,
        private userService: UserService,
        private match: MatchmakingService,
    ) { }

    async getAccessTokenApi(code: string) {
        // console.log(code);
        return await axios.post(process.env.FT_OAUTH_TOKEN, {
            grant_type: 'authorization_code',
            client_id: process.env.FT_UID,
            client_secret: process.env.FT_SECRET,
            code: code,
            redirect_uri: process.env.FT_REDIRECT_CALLBACK,
        }).then(token => token.data.access_token)
            .catch(err => console.log(err));
    }

    async getUserInfApi(token: string) {
        // console.log(token);

        return await axios.get(process.env.FT_V2_ME, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(data => data.data)
            .catch(error => console.log(error))
    }

    // Test without API //

    // async createUser(login: string): Promise<User> {

    //     const newUser: User = new User();
    //     newUser.login = login
    //     let username = login
    //     if (!await this.userService.isUsernameUnique(login, username)) {
    //         username = await this.userService.generateUniqueUsername(login)
    //         newUser.username = username
    //     }
    //     else
    //         newUser.username = login
    //     return this.userRepository.save(newUser)
    // }

    // Test with API //

    async createUser(data: any): Promise<User> {

        const newUser: User = new User();
        if (!await this.userService.isUsernameUnique(data.login, data.login)) {
            newUser.username = await this.userService.generateUniqueUsername(data.login)
        }
        else
            newUser.username = data.login
        newUser.login = data.login;
        newUser.email = data.email;
        newUser.twofa = 0;
        return this.userRepository.save(newUser);
    }

    // async userIsRegisteredbyLogin(login: string): Promise<boolean> {
    //     let user = await this.userRepository.findOneBy({ login: login })
    //     if (!user)
    //         return false;
    //     this.userService.updateUserStatus(user, 'ONLINE')
    //     return true;
    // }

    async userIsRegisteredbyLogin(login: string): Promise<User> {
        let user: User;
        user = await this.userRepository.findOneBy({ login: login })
        return user;
    }

    async signToken(user: User, bool: boolean) {
        const jwtPayload = {
            sub: user.id,
            login: user.login,
            two_fa: bool
        }
        return {
            access_token: this.jwtService.sign(jwtPayload),
            // refreshToken : this.jwtService.sign(jwtPayload, {expiresIn:'7d'})

        }
    }

    async isTokenValid(@Req() req: Request): Promise<boolean> {
        try {
            const tokenHeader = req.headers.authorization
            const token = tokenHeader.replace('Bearer ', '');
            const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
            if (verifiedToken) {
                if (await this.userService.extractUserFromReq(req) !== null)
                    return true;
            }
            return false
        }
        catch (error) {
            return false
        }
    }

    async logout(@Req() req: Request) {
        const login = await this.userService.extractLoginFromJWT(req)
        await this.match.removePlayerFromQueue(login)
        let user = await this.userRepository.findOneBy({ login: login })
        if (!user)
            throw new NotFoundException("user not found")

        // if (user.refreshToken !== '')
        // {
        //     user.refreshToken = ''
        //     await this.userRepository.save(user)
        // }
        await this.userService.updateUserStatus(user, 'OFFLINE')

    }

    /////////Functions for socket that can send jwt token ///////////////////////

    async extractLoginFromJWT(token: string): Promise<string> {
        try {
            const decodedToken = await this.jwtService.decode(token)
            if (typeof decodedToken === 'object' && 'login' in decodedToken && 'sub' in decodedToken) {
                const login = decodedToken['login']
                return login
            }
            return null
        }
        catch (error) {
            return null
        }
    }

    async logoutFromLogin(login: string) {
        if (login) {
            await this.match.removePlayerFromQueue(login)
            const user = await this.userService.getUserByLogin(login)
            if (user)
                await this.userService.updateUserStatus(user, 'OFFLINE')
        }
    }

    // fonction appellee
    //si un client quitte toutes les pages, et revient son status passe en reconnecte.
    async reconnectedClientFromJwt(token: string) {
        const login = await this.extractLoginFromJWT(token)
        if (login) {
            const user = await this.userRepository.findOneBy({ login: login })
            if (user && user.status === userStatus.OFFLINE)
                await this.userService.updateUserStatus(user, 'ONLINE')
        }
    }

    async updateStatusTwoFa(login : string, status : number){

        // console.log(status)
        let user : User = await this.userRepository.findOneBy({login: login});
        if (!user)
            return ;

        user.twofa = status;
        this.userRepository.save(user);
    }
}
