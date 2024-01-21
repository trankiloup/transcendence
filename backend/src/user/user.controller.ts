import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Req,
  Res,
  NotFoundException,
  InternalServerErrorException,
  Put,
  BadRequestException, UseInterceptors, UploadedFile, StreamableFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './Entities/user.entity';
import { Request, Response } from 'express';
import { getMeProfile } from './Dto/getMeProfile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getUserListDto } from './Dto/getUserList.dto';
import { JwtAuthGuard } from 'src/auth/Guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { Observable, of } from 'rxjs';


export const storage = {
  storage: diskStorage({
      destination: './uploads', 
      filename: (req, file, callback) => {
          const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          callback(null, `${filename}${extension}`)
      }
  })
  
}

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Req() req): Promise<Array<User>> {
    return this.userService.getAllUser();
  }

  //get list of users with : id, username, status
  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getUserList(): Promise<Array<getUserListDto>> {
    return this.userService.getUserList();
  }

    @UseGuards(JwtAuthGuard)
    @Get('id/:id')
    findUserbyId(
        @Param('id', ParseIntPipe)index:number)
    {   
        return this.userService.findUserById(index);
    }


  @UseGuards(JwtAuthGuard)
  @Get('byLogin/:userName')
  async findLoginByUser(@Param('userName') userName: string) {
    return this.userService.getLoginByUsername(userName);
  }
  //return me username and avatar url

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMeProfile(@Req() req: Request): Promise<getMeProfile> {
    try {
      const meProfile = new getMeProfile();
      const user = await this.userService.extractUserFromReq(req);
      if (!user) {
        throw new NotFoundException();
      }
      meProfile.username = (await user).username;
      meProfile.avatarUrl = (await user).avatarURL;
      return meProfile;
    } 
    catch (error) {
      throw new NotFoundException('Could not get user profile');
    }
  }
    



  //update me username on user profile
  @UseGuards(JwtAuthGuard)
  @Put('me/update-username')
  async meUpdateUsername(@Req() req: Request, @Res() res: Response) {
    try {
      const login = await this.userService.extractLoginFromJWT(req);
      if (
        !(await this.userService.isUsernameUnique(login, req.body.username))
      ) {
        res.send({ username: null });
        return;
      }
      const user = await this.userService.extractUserFromReq(req);
      if (!user) throw 'User not found';
      user.username = req.body.username;
      this.userRepository.save(user);
      res.send({ username: user.username });
    } catch (error) {
      throw new BadRequestException('User not found');
    }
  }

    //update me avatar on user profile
    @UseGuards(JwtAuthGuard)
    @Put('me/update-avatar')
    async meUpdateAvatar( @Req() req:Request)
    {
        try {

            const user = await this.userService.extractUserFromReq(req)
            if (!user)
                throw ("User not found")
           user.avatarURL = req.body.avatar
           this.userRepository.save(user)

        }
        catch (error)
        {
            throw new InternalServerErrorException(error)
        }
    }


    @UseGuards(JwtAuthGuard)
    @Post('upload-avatar')
    @UseInterceptors(FileInterceptor('file', storage))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req:Request)
    {
      return this.userService.updateAvatar(req, file.path)
    }
    
    
    @UseGuards(JwtAuthGuard)
    @Get('idlogin')
    async test(@Req() req:Request)
    {
        return this.userService.extractIdLoginFromReq(req)
    }

    @Get('profile-image/:imageUrl')
    findProfileImage(@Param('imageUrl') imageUrl, @Res() res:Response) : Observable<any>
    {
      return of(res.sendFile(path.join(process.cwd(), 'uploads/' + imageUrl)))
    }

    // @Get('login/:id')
    // getUserLoginById

    // @UseGuards(JwtAuthGuard)
    // @Get('id/:id')
    // findUserbyId(
    //     @Param('id', ParseIntPipe)index:number)
    // {   
    //     return this.userService.findUserById(index);
    // }

 }
