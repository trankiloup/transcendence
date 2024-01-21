import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgClass} from "@angular/common";
import { CommonModule } from '@angular/common';
import {ModalComponent} from "../modal/modal.component";
import {Subject, Subscription, takeUntil} from "rxjs";
import {Router} from "@angular/router";
import { MatchService } from './match.service';
import { ResMessage } from '../../Interface/Resmessage.interface';
import { GameSocketService } from 'src/app/sockets/game-socket/game-socket.service';
import { AppService } from 'src/app/app.service';
import { GameService } from '../../game.service';
import { mePlayer } from '../../Interface/me-player.interface';
import { GlobalSocketService } from 'src/app/sockets/global/global-socket.service';
import { UserSocketService } from 'src/app/sockets/user-list-socket/user-socket.service';




@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css','../../../app.component.css']
})
export class MatchComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private matchService : MatchService,
    private GameSocketService : GameSocketService,
    // private appService : AppService,
    private gameService : GameService,
    private gobalSocketService : GlobalSocketService,
    private userSocketService : UserSocketService
    ) {

  };

  player1: string = ""
  player2: string = ""
  player3: string = ""
  player4: string = ""
  scorePlayer1Part1:number = 0
  scorePlayer2Part1:number = 0
  scorePlayer3Part2:number = 0
  scorePlayer4Part2:number = 0
  scoreFinaleFinisher1:number = 0
  scoreFinaleFinisher2:number = 0
  finisher1:string = ""
  finisher2:string = ""
  rank1:string = ""
  rank2:string = ""
  rank3:string = ""
  rank4:string = ""

  gameFull : boolean = false

  // private playerListe : tournamentPlayersInterface = new tournamentPlayersInterface()

  mePlayer! : mePlayer

  buttonText: string = 'Join the tournament';
  disableButton: boolean = false

  globalRoom : string = '0'

  goGame$ = this.gobalSocketService.goGame()

  playerList$ = this.gobalSocketService.updateInfo()
  destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit(){

    this.playerList$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data =>{
      if (data)
      {
        this.player1 = data.player1
        this.player2 = data.player2
        this.player3 = data.player3
        this.player4 = data.player4
        this.finisher1 = data.finisher1
        this.finisher2 = data.finisher2
        this.scorePlayer1Part1 = data.scorePlayer1
        this.scorePlayer2Part1 = data.scorePlayer2
        this.scorePlayer3Part2 = data.scorePlayer3
        this.scorePlayer4Part2 = data.scorePlayer4
        this.scoreFinaleFinisher1 = data.scoreFinaleFinisher1
        this.scoreFinaleFinisher2 = data.scoreFinaleFinisher2
        this.rank1 = data.rank1
        this.rank2 = data.rank2
        this.rank3 = data.rank3
        this.rank4 = data.rank4
      }
    })

    this.goGame$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      if (data === true)
      {
        this.disableButton = false
        this.buttonText = 'Go game'
      }
    })

    this.isPlayerRegistered()
  }

  ///checker if player registered to finalist

  //check if player is registered to a match
  isPlayerRegistered()
  {
    this.matchService.isPlayerRegistered().subscribe((data) => {
      if(data.wrongpage === true)
      {
        // console.log('You are allready registered to another game')
        this.disableButton = true
        return;
      }
      else if (data.registered === true)
      {
        this.globalRoom = data.globalRoomId.toString()
        if (data.gameFull === true)
        {
          this.gameFull = true
          if (data.gameReady === true)
            this.disableButton = false
          else
            this.disableButton = true
          this.buttonText = "Go game"

        }
        else
          this.buttonText = "Unsubcribe from tournament"
        this.gobalSocketService.sendUpdateInfo(this.globalRoom)
      }
      else
        this.getJoinOrCreate()
    })
  }

  //if player not registered, diplay join or create button
  getJoinOrCreate()
  {
    this.matchService.tournamentJoinOrCreate().subscribe({
      next: (data: ResMessage) => {
        if (data.message === 'create')
        {
          this.buttonText = 'Create a tournament'
        }
        else if (data.message === 'join')
          this.buttonText = 'Join the tournament'
        else if (data.message === 'cancel')
          this.buttonText = 'Unsubcribe from tournament'
        else
          this.disableButton = true
      }
    })

    this.gobalSocketService.showPreviousScore()
  }


  //s'inscrit ou se desinscrit du match
  onClick()
  {
    if (this.buttonText === 'Create a tournament' || this.buttonText === 'Join the tournament')
    {
      this.matchService.registerPlayerToMatch().subscribe({
        next: (data) => {
          if (data === true)
          {
            this.buttonText = 'Unsubcribe from tournament'
          }
          else
            console.error('Error while trying to register')
        },
        error : () => console.error('Error while trying to register'),
        complete : () => this.registerTournament()
      })
    }
    else if (this.buttonText === 'Unsubcribe from tournament')
    {
      this.cancelRegistration()
    }
    else if (this.buttonText === 'Go game')
      this.router.navigate(['/game'])

  }


  registerTournament()
  {
      this.gameService.getMePlayer().subscribe({
        next :(data) => {
          this.mePlayer = data
          if (!data || data.globalRoomId <= 0)
          {
            console.error('register tournament, error on me player data')
            return
          }
          this.globalRoom = data.globalRoomId.toString()
          if (data.globalRoomId === 0)
            return
        },
        complete : () => {
          this.gobalSocketService.registerTournament(this.globalRoom)
          this.isMatchFull()
        }
      })
  }


  // sendMePlayer()
  // {
  //   this.gobalSocketService.getPlayers(this.globalRoom)
  // }

  isMatchFull()
  {
    this.matchService.isMatchFull().subscribe( (data) => {
      if (data === true)
      {
        this.buttonText = 'Go game'
        this.disableButton = false
        this.gobalSocketService.matchReady(this.globalRoom)
      }
    })

  }



  cancelRegistration()
  {
    this.gobalSocketService.removePlayerFromRoom(this.globalRoom)
    this.matchService.cancelSubcription().subscribe({
      complete : () => {
        this.gobalSocketService.sendUpdateInfo(this.globalRoom)
        window.location.reload() }
      })
  }

  getColor(rank:string):string{
    if(rank == this.player1)
      return 'neonBlue'
    if (rank == this.player2)
      return 'neonGreen'
    if (rank == this.player3)
      return 'neonPinkSlow'
    if (rank == this.player4)
      return 'neonOrangeSlow'
    return''
  }
  back(){
    this.router.navigateByUrl('/overview');
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

