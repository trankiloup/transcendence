import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserProfileService} from "../user-profile/user-profile.service";
import {Router} from "@angular/router";
import {getMeProfile} from "../interfaces/getMeProfile.interface";
import {UserListComponent} from "../users/user-list/user-list.component";
import {AccountMenuComponent} from "../menus/account-menu/account-menu/account-menu.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, UserListComponent, AccountMenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css','../app.component.css']
})
export class HeaderComponent {
  user:string = "";
  open:boolean = false;
  constructor(
    private userProfileService: UserProfileService,
    private router: Router,
  ){}
  ngOnInit():void{
    this.username();
  }
  username() : void{
    let user:string ="";
    this.userProfileService.getMeProfile().subscribe({
      next:(data :getMeProfile) => {
        this.user= data.username;
      },
      // error: () => this.router.navigate(['']) //on error
    })
  }
  seeProfile(){
    this.router.navigateByUrl('/user-profile');
  }
  openUser(){
    this.open = !this.open;
  }
}
