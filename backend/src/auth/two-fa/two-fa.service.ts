import { Injectable, InternalServerErrorException, BadRequestException, Req, Res, UnauthorizedException, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepositoryUtils } from 'typeorm'
import { UserService } from 'src/user/user.service';
import { CodeDTO } from 'src/user/Dto/code.dto';
import { User } from 'src/user/Entities/user.entity';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class TwoFaService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private userService: UserService,
        private jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) { }

    private async setTransport() {

        try {
            const OAuth2 = google.auth.OAuth2;
            const client = new OAuth2(
                await this.configService.get('CLI_ID'),
                await this.configService.get('CLI_SECRET'),
                'https://developers.google.com/oauthplayground',
            );

            client.setCredentials({
                refresh_token: this.configService.get('REFRESH_TOKEN')
            });

            const accessToken: string = await new Promise((resolve, reject) => {
                client.getAccessToken((err, token) => {
                    // console.log(token);
                    if (err) {
                        console.log('Failed to create access token');
                    }
                    resolve(token);
                })
            })

            const config: Options = {
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: await this.configService.get('CLI_EMAIL'),
                    clientId: await this.configService.get('CLI_ID'),
                    clientSecret: await this.configService.get('CLI_SECRET'),
                    accessToken: accessToken,
                },
                tls: {
                    rejectUnauthorized: false,
                    ciphers: "SSLv3",
                },
                host: "smtp.gmail.com",
                port: 587,
            }
            this.mailerService.addTransporter('gmail', config);
        }
        catch (error) {
            console.error(error);
            throw error;
        }

    }

    private async generateRandomCode(login: string): Promise<string> {

        const characters = '0123456789'
        let result: string = ""
        for (var i = 0; i < 4; i++) {
            const index = Math.floor(Math.random() * 10);
            result += characters[index];
        }


        const user: User = await this.userRepository.findOneBy({ login: login });
        if (!user)
            return "";

        user.code = result;
        // console.log(result) 
        await this.userRepository.save(user);
        return result;
    }

    async sendMail(login: string) {

        const user: User = await this.userRepository.findOneBy({ login: login });
        const code = await this.generateRandomCode(login);
        const mail = user.email;

        await this.setTransport();
        this.mailerService.sendMail({
            transporterName: 'gmail',
            to: mail,
            from: await this.configService.get('CLI_EMAIL'),
            subject: 'Verification Code',
            template: 'action',
            context: {
                code: code,
            }
        }).catch((error) => {
            console.log("send mail error: " + error)
        })
    }

    private async DeleteCode(login: string) {

        const user: User = await this.userRepository.findOneBy({ login: login })

        if (!user)
            return

        user.code = "";
        await this.userRepository.save(user);
    }

    async getAutorization(user: User, code: string): Promise<boolean> {

        if (user.code == code)
            return true;

        this.DeleteCode(user.login);

        return false;
    }
}
