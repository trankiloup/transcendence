import { Component, OnDestroy, OnInit,} from '@angular/core';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import {ScoreHistoryService} from "./score-history.service";
import {ActivatedRoute} from "@angular/router";
import {PvpMatchInterface} from "../interfaces/pvp-match-interface";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MyToogleComponent} from "../my-toogle/my-toogle.component";
import {HeaderComponent} from "../header/header.component";
import {TournamentRank} from "../interfaces/tournament-rank";
import {Subscription} from "rxjs";
import {GetLoginByUsername} from "../interfaces/getLoginByUsername";
import {UserListService} from "../users/user-list/user-list.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {rpsMatchInterface} from "../interfaces/rps-match-interface";
@Component({
  selector: 'app-score-history',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MyToogleComponent, HeaderComponent],
  templateUrl: './score-history.component.html',
  styleUrls: ['./score-history.component.css','../app.component.css']
})
export class ScoreHistoryComponent implements OnInit, OnDestroy {
    name:  string|undefined;
    login: string|undefined ;
    avatarUrl?: string ;
    avatar: SafeUrl | undefined ;
    user: GetLoginByUsername|undefined;
    isActive: string = 'pong';
    tooglePvpTournament:string = 'pvp';
    subscribe0:Subscription = new Subscription;
    subscribe1:Subscription = new Subscription;
    subscribe2:Subscription = new Subscription;
    subscribe3:Subscription = new Subscription;
    subscribe4:Subscription = new Subscription;
    playerMatchesPvp: PvpMatchInterface[] | undefined ;
    playerMatchesRps: rpsMatchInterface[] | undefined ;
    playerMatchesTournament: TournamentRank[] | undefined;

    constructor(private route:ActivatedRoute,
                private router:Router,
                private scoreHistoryService:ScoreHistoryService,
                private userService:UserListService,
                private sanitizer : DomSanitizer ){}

  ngOnInit() {
    /*
        Get the Username
    */
    this.subscribe0 = this.route.params.subscribe((params)=>{this.name = params['userNameRoute']
    });
    /*
        Get the User with the UserName
    */
    if (this.name){
    this.subscribe3 = this.scoreHistoryService.getUserByUserName(this.name).subscribe(log => {
      if(log == null)
        this.router.navigateByUrl('/not-found')
      else {

        this.user = log;
        this.setIdentity();
        this.displayAvatarImage();
      }
      /*
          Get the History Matches
      */
      if (this.user?.login) {
        this.subscribe1 = this.scoreHistoryService.getAllPlayerMatchesPvp(this.user.login).subscribe({
          next:(matches) => {this.playerMatchesPvp = matches },
          error:() => {console.error("Error loading PVP matches: ");}});
      }

      if (this.user?.login) {
        this.subscribe2 = this.scoreHistoryService.getAllPlayerMatchesTournament(this.user.login).subscribe({
          next:(matches) => {this.playerMatchesTournament = matches},
          error:() => {console.error("Error loading tournament matches: ");}}
        )}

      if (this.user?.login) {
        this.subscribe4 = this.scoreHistoryService.getAllPlayerMatchesRps(this.user.login).subscribe({
          next:(matches) => {this.playerMatchesRps = matches },
          error:() => {console.error("Error loading PVP matches: ");}});
      }
      })
    }
  }
  setIdentity(){
    this.login = this.user?.login;
    this.avatarUrl = this.user?.avatarURL;
  }

  displayAvatarImage()
  {
    this.scoreHistoryService.getAvatar(this.avatarUrl).subscribe({
      next :(data) => {
        let objectUrl = URL.createObjectURL(data);
        this.avatar = this.sanitizer.bypassSecurityTrustUrl(objectUrl)
      },
    })
  }
  back(){
      window.history.back();
  }
  active(name: string) {
      this.isActive = name;
      // console.log("active:" + name)
   };

changeTooglePvpToMatch(value:string): void {
    this.tooglePvpTournament = value;
}

  ngOnDestroy(): void {
    this.subscribe0.unsubscribe();
    this.subscribe1.unsubscribe();
    this.subscribe2.unsubscribe();
    this.subscribe3.unsubscribe();
    this.subscribe4.unsubscribe();
  }
}


