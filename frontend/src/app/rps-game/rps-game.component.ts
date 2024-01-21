import { Component, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSocketService } from '../sockets/user-list-socket/user-socket.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { positions } from '../sockets/rps-game-socket/Interface/positions.interface';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { RpsGameService } from './rps-game.service';
import { mePlayer } from '../game/Interface/me-player.interface';
import { RpsSocketService } from '../sockets/rps-game-socket/rps-game-socket.service';
import { gameStatusInt } from './Interfaces/gameStatusInt.interface';
import { ResMessage } from '../game/Interface/Resmessage.interface';
import { GameResultInt } from './Interfaces/gameResult.interface';
import { stateInt } from './Interfaces/state.interface';


@Component({
  selector: 'app-rps-game',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, NgIf],
  templateUrl: './rps-game.component.html',
  styleUrls: ['./rps-game.component.css', '../app.component.css'],
  providers:[UserSocketService],
})
export class RpsGameComponent implements OnDestroy{

  constructor(
    private route: ActivatedRoute,
    private rpsGameService : RpsGameService,
    private snackbar : MatSnackBar,
    private router: Router,
    private rpsSocketService : RpsSocketService
  ){}

  // public selectCard: boolean = true;
  public selectedCard: string | null = null;

  public rock: HTMLElement | null= document.getElementById('Rock');
  public beer: HTMLElement | null = document.getElementById('Beer');
  public cheers: HTMLElement | null = document.getElementById('Cheers');
  public leftScore: number = 0;
  public rightScore: number = 0;
  public leftname : string = "waiting for opponent";
  public rightname : string = "waiting for opponent";
  public showWinnerScore: boolean = false;
  public winner!: string;
  public winnerScore!: number;
  public loserScore!: number;
  private player : mePlayer = new mePlayer()
  private mouseClickHandler!: (e: MouseEvent) => void

  public gamestarted : boolean = false
  public gameover: boolean = false;

  public displayselectcard : boolean = false
  public cardchoosen : boolean = false
  public displayResultCard : boolean = false
  public displayMatchResult : boolean = false
  public displayRules : boolean = true

  public PlayButton : string = "Register"
  public hideRegisterButton : boolean = true

  public player1_card : string | null = null
  public player2_card : string | null = null

  public ResultText : string = ""

  private timeToPlay : number = 7
  private timeSeeResult : number = 3

  matchStatus$ = this.rpsSocketService.updatePlayers()
  gameStarts$ = this.rpsSocketService.gameStarts()
  matchEnd$ = this.rpsSocketService.matchEnd()
  gameResult$ = this.rpsSocketService.gameResult()
  nextGame$ = this.rpsSocketService.nextGame()
  destroy$: Subject<boolean> = new Subject<boolean>();



  ngOnInit() {

    if (!this.playRock)
    {
      console.error("Impossible de trouver l'élément HTML avec l'ID 'rock'.");
      return;
    }
    if (!this.playBeer)
    {
      console.error("Impossible de trouver l'élément HTML avec l'ID 'beer'.");
      return;
    }
    if (!this.playCheers)
    {
      console.error("Impossible de trouver l'élément HTML avec l'ID 'cheers'.");
      return;
    }
    this.initSocketObservable()

    this.rpsGameService.isPlayerAvailable().subscribe(
      (data : ResMessage) => {
        if (data.message === 'true')
          this.hideRegisterButton = false
        else if (data.message === 'false')
        {
          this.displaySnackbarError('You are already register to a game')
          return
        }
        else if (data.message === 'ingame')
        {
          this.registerRts()
        }
      }
    )


  this.mouseClickHandler = (e : MouseEvent) => { }
  window.addEventListener('click', this.mouseClickHandler)
  }

  initSocketObservable()
  {

      this.matchStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data : gameStatusInt) => {
        this.leftname = data.player1
        this.rightname = data.player2
        this.leftScore = data.player1_score
        this.rightScore = data.player2_score
      })

      this.gameStarts$
      .pipe(takeUntil(this.destroy$))
      .subscribe( (data : boolean) => {
          this.newGame() })

      this.gameResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data : GameResultInt) => {
        this.displayGameResult(data)
    })


    this.nextGame$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data : GameResultInt) => {
      this.nextGame()
    })

    this.matchEnd$
    .pipe(takeUntil(this.destroy$))
    .subscribe( () => this.endOfGame() )

  }

  //if player already registered to match
  getMePlayer()
  {
    this.rpsGameService.rpsGetMePlayer().subscribe({
      next : (data) => {
        if (!data)
        {
          this.displaySnackbarError('You are not registered to a match')
          return
        }
        this.player = data
      },
      error : (error) => console.log(error),
      complete : () => this.joinRoom()
    })
  }


  clickButton()
  {
    if (this.PlayButton === 'Register')
      this.registerRts()
    else if (this.PlayButton === 'Unregister')
      this.unregisterRps()
  }

  registerRts()
  {

    this.rpsGameService.rpsRegister().subscribe({
      next : (data) => {
        if (!data)
        {
          this.displaySnackbarError('You cannot register to this game')
          return
        }
        else
          this.player = data
      },
      error : (error) => console.log(error),
      complete : () =>{
        this.isGameFull()
        this.joinRoom()
      }
      })

  }


  isGameFull()
  {
    const room = this.player.globalRoomId
    if (room > 0)
    {
      this.rpsGameService.rpsIsGameFull(room).subscribe((data) => {
        if (data ===  true)
          this.hideRegisterButton = true
        else
        {
          this.PlayButton = 'Unregister'
          this.hideRegisterButton = false
        }
      })
    }
  }

  unregisterRps()
  {
    const room = this.player.globalRoomId
    if (room > 0)
    {
      this.rpsGameService.rpsUnregister(room).subscribe({
        error : () => console.log('Error trying to unregister from tournament'),
        complete : () => {
          this.PlayButton = "Register"
          this.hideRegisterButton = false
          this.rpsSocketService.unregister(this.player)

        }
      })
    }
  }



  joinRoom()
  {
      if (this.player && this.player.globalRoomId != 0)
        this.rpsSocketService.registerSocket(this.player)
  }

  newGame()
  {
    this.gamestarted = true
    this.displayRules = false
    this.selectedCard = '';
    this.hideRegisterButton = true
    this.displayselectcard = true
    this.cardchoosen = false
    this.ResultText = ""
    this.displayResultCard = false
    this.gameover = false
    this.cardchoosen = false

    setTimeout(() => {

      this.rpsSocketService.emitGetResult(this.player)
    }, 1000 * this.timeToPlay)
  }

  nextGame()
  {
    this.gamestarted = true
    this.displayRules = false
    this.selectedCard = '';
    this.hideRegisterButton = true
    this.displayselectcard = true
    this.cardchoosen = false
    this.ResultText = ""
    this.displayResultCard = false
    this.gameover = false
    this.cardchoosen = false
    this.rpsSocketService.emitNextGame(this.player)

    setTimeout(() => {
      this.rpsSocketService.emitGetResult(this.player)
    }, 1000 * this.timeToPlay)
  }



  displayGameResult(result : GameResultInt)
  {
    this.player1_card = result.player1_card
    this.player2_card = result.player2_card
    if (result.tied)
      this.ResultText = 'This is a tie'
    else
      this.ResultText = result.winner + ' wins this game'
    this.displayselectcard = false
    this.displayResultCard = true
    if (!this.gameover)
    {
      setTimeout(() =>{
        if (this.gameover === false)
          this.nextGame()
      }, 1000 * this.timeSeeResult)
    }
    else
      this.endOfGame()
  }

  displaySnackbarError(text : string)
  {
    this.snackbar.open(text, 'Go home')
    this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
    this.router.navigate(['overview']),
    this.snackbar.dismiss
    )
  }


//fonctions pour le jeu RPS - Rock Paper Scissors:

  //choix de la carte a jouer:
  playRock() {
    this.selectedCard = 'rock';
    this.cardchoosen = true
    this.rpsSocketService.emitPlayedCard(this.player, 'rock')
  }

  playBeer() {
    this.selectedCard = 'beer';
    this.cardchoosen = true
    this.rpsSocketService.emitPlayedCard(this.player, 'beer')

  }

  playCheers() {
    this.selectedCard = 'cheers';
    this.cardchoosen = true
    this.rpsSocketService.emitPlayedCard(this.player, 'cheers')

  }

  endOfGame()
  {
    this.gameover = true
    this.displayWinner()
    this.rpsSocketService.emitLeaveRoom(this.player)
    this.snackbar.open('End Of Game', 'Go Home')
    this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
      this.router.navigate(['overview']),
      this.snackbar.dismiss
      )
  }

  displayWinner()
  {
    if (this.leftScore > this.rightScore)
    {
      this.winner = this.leftname
      this.winnerScore = this.leftScore
      this.loserScore = this.rightScore
    }
    else
    {
      this.winner = this.rightname
      this.winnerScore = this.rightScore
      this.loserScore = this.leftScore
    }
    this.displayMatchResult = true
  }

  gameCancel()
  {
    this.snackbar.open('Something went wrong, game is canceled', 'Go Home')
    this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
      this.router.navigate(['overview']),
      this.snackbar.dismiss
      )

  }
back(){
  this.router.navigate(['overview']);
}

  ngOnDestroy(): void
  {
    this.unregisterRps()
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.snackbar.dismiss()
  }
}
