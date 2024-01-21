import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Req,
  Res,
  BadRequestException,
  forwardRef,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User, userStatus } from './Entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { getUserListDto } from './Dto/getUserList.dto';
import { userIdLoginDto } from './Dto/userIdLogin.dto';
import { friendsDTO } from './relations/DTO/friends.dto';
import { Relations } from './relations/Entity/relations.entity';
import { ListDTO } from 'src/chat/DTO/list.dto';
import { getRelationsListDTO } from 'src/chat/DTO/getRelationsList.dto';
import { RpsScoreInt } from 'src/sockets/rps-socket/Interface/RpsScore.interface';

@Injectable()
export class UserService  {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService, // @Inject(forwardRef(()=> AuthService))
    // @InjectRepository(OneVsOneMatch) private match : Repository<OneVsOneMatch>
  ) // private authService : AuthService,
  {}

  async getAllUser(): Promise<Array<User>> {
    return this.userRepository.find({});
  }

  async getUserList(): Promise<Array<getUserListDto>> {
    try {
      let userList: getUserListDto[] = [];
      const users: User[] = await this.getAllUser();
      if (users) {
        userList = users.map((User) => ({
          id: User.id,
          username: User.username,
          status: User.status,
        }));
      }
      return userList;
    } catch {
      throw new InternalServerErrorException('Error on reading users');
    }
   }

  async findUserById(id: number): Promise<User> {

        const user = await this.userRepository.findOneBy({id: id });
        if (user)
            return user;
        throw new NotFoundException ('Id not found');

  }

  async getUsernameById(id: number) {
    return (await this.findUserById(id)).username
  }

  async extractLoginFromJWT(@Req() req: Request): Promise<string | null> {
    try {
      const tokenHeader = req.headers.authorization;
      const token = tokenHeader.replace('Bearer ', '');
      const decodedToken = this.jwtService.decode(token);
      if (typeof decodedToken === 'object' && 'login' in decodedToken) {
        const login = decodedToken['login'];
        return login;
      }
      return null;
    } catch (error) {
      throw new BadRequestException('Invalid Token');
    }
  }

  async extractIdLoginFromReq(
    @Req() req: Request,
  ): Promise<userIdLoginDto | null> {
    try {
      const tokenHeader = req.headers.authorization;
      const token = tokenHeader.replace('Bearer ', '');
      const decodedToken = this.jwtService.decode(token);
      if (
        typeof decodedToken === 'object' &&
        'login' in decodedToken &&
        'sub' in decodedToken
      ) {
        const payload: userIdLoginDto = {
          login: decodedToken['login'],
          id: decodedToken['sub'],
        };
        return payload;
      }
      return null;
    } catch (error) {
      throw new BadRequestException('Invalid Token');
    }
  }

  async getUserByLogin(login: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { login: login },
    });
    return user;
  }

  async getUsernameByLogin(login : string) : Promise<string>
  {
    const user = await this.getUserByLogin(login)
    if (user)
      return user.username
    else
      return ""
  }

  async getUserByUserName(userName: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username: userName },
    });
    if(user)
      return user;
    else
      return null;
  }

  async extractUserFromReq(@Req() req: Request): Promise<User> {
    const login = await this.extractLoginFromJWT(req);
    if (!login) throw 'Login not found';

    return await this.getUserByLogin(login);
  }

  //return false if unsername in db
  //return true if username == user's login else false
  // user can only have it own login as usermane
  async getLoginByUsername(username: string): Promise<User>
  {
    const user = await this.getUserByUserName(username);
    return user;
  }

  async isUsernameUnique(login: string, username: string): Promise<boolean> {
    let user = await this.userRepository.findOne({
      where: { username: username },
    });
    // username found, username not available
    if (user) return false;

    user = await this.userRepository.findOne({
      where: { login: username },
    });
    // prevent a user to take another user login as username
    if (user && user.login !== login) return false;

    return true;
  }

  //generate a unique username by adding number after login (ex mbihan02)
  async generateUniqueUsername(login: string): Promise<string> {
    const add = 0;
    const previousUsername = login;
    let username: string = previousUsername;
    while (!(await this.isUsernameUnique(login, username))) {
      username = previousUsername + add;
    }
    return username;
  }

  async updateUserStatus(user: User, status: string) {
    try {
      if (user) {
        if (status === 'OFFLINE') user.status = userStatus.OFFLINE;
        else if (status === 'ONLINE') user.status = userStatus.ONLINE;
        else if (status === 'INGAME') user.status = userStatus.INGAME;
        else throw new NotFoundException('Status does not exist');
        await this.userRepository.save(user);
      } else return;
    } catch (error) {
      throw error;
    }
  }


  async getUsernameFromLogin(login : string) : Promise<string>
  {
    if (login === "")
      return ""
    const user = await this.userRepository.findOneBy({login : login})
    if (!user)
      return ""
    return user.username
  }


  async updateUserStatusFromLogin(login : string, status : string)
  {
    const user : User = await this.userRepository.findOneBy({login : login})
    if (user)
      await this.updateUserStatus(user, status)
  }


  async gameUpdateUserStatus(login : string, status : string)
  {
    const user : User = await this.userRepository.findOneBy({login : login})
    if (user && user.status != userStatus.OFFLINE)
      await this.updateUserStatus(user, status)
  }

  //register in db image name in user's database
  async updateAvatar(@Req() req:Request, url : string)
  {
    const user = await this.extractUserFromReq(req)
    if (!user)
      return
    const replacedURL = url.replace("uploads/", "");
    user.avatarURL = replacedURL
    await this.userRepository.save(user)
  }

  //update Rps rank
  async setRpsRank(score : RpsScoreInt)
  {
    const player1 = await this.getUserByLogin(score.player1_login)
    if (player1)
    {
      if (score.player1_score > score.player2_score)
        player1.rtsRank += 1
      else
        player1.rtsRank -=1
      await this.userRepository.save(player1)
    }
    
    const player2 = await this.getUserByLogin(score.player2_login)
    if (player2)
    {
      if (score.player2_score > score.player1_score)
        player2.rtsRank += 1
      else
        player2.rtsRank -=1
      await this.userRepository.save(player2)
    }
  }

}
