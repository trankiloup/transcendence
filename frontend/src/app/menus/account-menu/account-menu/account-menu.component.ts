import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatMenuModule} from '@angular/material/menu'
import { Router } from '@angular/router';
import { AccountMenuService } from './account-menu.service';
import {MatButtonModule} from '@angular/material/button';
import {UserListComponent} from "../../../users/user-list/user-list.component";
import {getMeProfile} from "../../../interfaces/getMeProfile.interface";
import {UserProfileService} from "../../../user-profile/user-profile.service";
import { TokenService } from 'src/app/authguard/token.service';
import { UserSocketService } from 'src/app/sockets/user-list-socket/user-socket.service';
import { broadCastChannel } from 'src/app/app.component';
import { GlobalSocketService } from 'src/app/sockets/global/global-socket.service';



@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, UserListComponent],
  templateUrl: './account-menu.component.html',
  styleUrls: ['./account-menu.component.css','../../../app.component.css'],
})
export class AccountMenuComponent  {

  constructor(
    private route: Router,
    private userProfileService: UserProfileService,
    private accountMenuService : AccountMenuService,
    private tokenService : TokenService,
    private UserSocketService : UserSocketService,
    private globalSocketService : GlobalSocketService
    ){}

  user:string = "";
  ngOnInit():void{
    this.username();
  }
  clickUserProfile()
  {
    this.route.navigate(['/user-profile'])

  }
  username() : void{
    let user:string ="";
    this.userProfileService.getMeProfile().subscribe({
      next: (data: getMeProfile) => {
        this.user = data.username;
      },
       })
  }
  scoreHistory()
  {
    let road:string='/score-history/'+this.user;
    // console.log("road: " + road);
    this.route.navigate([road])

  }
  logout()
  {
    const login = this.tokenService.getlogin()
    this.accountMenuService.logout().subscribe({
      next: () => {
        this.globalSocketService.logout(login)
        this.tokenService.clearToken()

      },
      error: (error) => {
        // console.log("Error on logout :", error),
        this.tokenService.clearToken()},
    })
    broadCastChannel.postMessage('logout')
    this.route.navigate(['/home'])
  }





}
