import { Component, OnDestroy, } from '@angular/core';
import { CommonModule} from '@angular/common';
import { UserSocketService } from '../sockets/user-list-socket/user-socket.service';
import { GameSocketService } from '../sockets/game-socket/game-socket.service';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { GameService } from './game.service';
import { DrawService } from './draw.service';
import { positions } from '../sockets/game-socket/Interface/positions.interface';
import { CountdownComponent } from './countdown/countdown.component';
import { mePlayer } from './Interface/me-player.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TokenService } from '../authguard/token.service';
import { GlobalSocketService } from '../sockets/global/global-socket.service';
import { sendMatchResult } from './pvp-vs-match/match/Interfaces/sendMatchResult.interface';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css',"../app.component.css"],
  standalone: true,
  imports:[CommonModule, CountdownComponent, MatSnackBarModule],
  providers:[UserSocketService]
})
export class GameComponent implements OnDestroy{

  constructor(
    private gameSocketService : GameSocketService,
    private gameService : GameService,
    private drawService : DrawService,
    private snackbar : MatSnackBar,
    private router : Router,
    private tokenService : TokenService,
    private globalSocketService : GlobalSocketService
    ) {
    }


  // private gameStarted: boolean;
  public leftScore: number = 0;
  public rightScore: number = 0;
  public leftname : string = "waiting for opponent";
  public rightname : string = "waiting for opponent";
  // public gameover: boolean;
  public showWinnerScore: boolean = false;
  public winner!: string;
  public winnerScore!: number;
  public loserScore!: number;


  private pong! : HTMLCanvasElement;
  private pongheight : number = 150
  private pongwith : number = 300

  private yleftPad : number = 5
  private yrightPad : number = 100
  private xball : number = 150
  private yball : number = 100
  private room : string  = ""
  private globalRoom : string = ""

  private gameStarted : boolean = false
  private player! : mePlayer


  private keydownHandler!: (e: KeyboardEvent) => void

  postions$ = this.gameSocketService.newPosition();
  endGamePVP$ = this.gameSocketService.endOfGamePVP()
  endGameTournament$ = this.gameSocketService.endOfGameTournament()
  destroy$: Subject<boolean> = new Subject<boolean>();

  updatePlayer$ = this.gameSocketService.updatePlayer()

  gameStartedObs : Observable<any> = this.gameSocketService.gameStarted()
  gameStartedSub! : Subscription
 

  // affichage du jeu pong avant le lancement du jeu
  ngOnInit() {
    this.pong = document.getElementById("pong-init") as HTMLCanvasElement;
    if (!this.pong)
    {
      console.error("Impossible de trouver l'élément canvas avec l'ID 'canvas'.")
      return
    }
    let context = this.pong.getContext('2d')
    if (!context)
    {
      console.error("Impossible de trouver l'élément canvas avec l'ID 'canvas'.");
      return
    }
    this.drawService.drawLeftPaddle(context, this.yleftPad)
    this.drawService.drawRighPaddle(context, this.yrightPad)
    this.drawService.drawBall(context, this.xball, this.yball)
    this.drawService.drawNet(context)

 


    this.updatePlayer$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.leftname = data.leftplayer
      this.rightname = data.rightplayer
    })

    
    this.endGamePVP$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.endOfGame())

    this.endGameTournament$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.endOfGameTournament())

    this.postions$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data : positions) =>{
        this.yleftPad = data.yleftPad,
        this.yrightPad = data.yrightPad,
        this.xball = data.xball,
        this.yball = data.yball,
        this.leftScore = data.leftscore
        this.rightScore = data.rightscore
        this.animate()
    })

  
    this.keydownHandler = (e : KeyboardEvent) => {
      if(e.key === "w" || e.key === "W") {
        this.gameSocketService.upleft(this.room)
    }
    if(e.key === "s" || e.key === "S") {
      this.gameSocketService.downleft(this.room)
    }
    if(e.key === "ArrowUp") {
      this.gameSocketService.upright(this.room)
    }
    if(e.key === "ArrowDown") {
      this.gameSocketService.downright(this.room)
    }
  }
  window.addEventListener('keydown', this.keydownHandler)

     //get player info from matchmaking
     this.gameService.getMePlayer().subscribe({
      next :(data) => {
        if (!data)
        {
            this.diplaySnackbar()
            return;
        }
        else
          this.player = data
    },
    error : (error) => console.error('Error :' ,error),
    complete : () => this.getRoom()
    })
  }

  animate ()
  {
    this.pong = document.getElementById("pong-init") as HTMLCanvasElement
    let context = this.pong.getContext('2d')

    if (this.pong && context)
    {
      this.drawService.clearAll(context)
      this.drawService.drawBall(context, this.xball, this.yball)
      this.drawService.drawLeftPaddle(context, this.yleftPad)
      this.drawService.drawRighPaddle(context, this.yrightPad)
      this.drawService.drawNet(context)
    }
  }


  async getRoom()
  {
    this.gameService.getRoom().subscribe({
      next : (data) => {
        this.room = data.toString()
        if (this.room  === '' || this.room === '0')
        {
          this.snackbar.open('You are not registered to a game', 'Register')
          this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
            this.router.navigate(['pvpOrMatch']),
            this.snackbar.dismiss
            )

          return
        }
        else
        {
          this.gameSocketService.joinPvpRoom(this.room, this.tokenService.getlogin(), this.player)
        }
      },
      error : () => {
        this.snackbar.open('You are not registered to a game', 'Register')
        this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
          this.router.navigate(['pvpOrMatch'])
        )
      },
      complete:() => {
        if (this.room)
          this.sendMeProfile()
        }
    })
  }

  //snackbar if a player is not registered
  diplaySnackbar()
  {
    this.snackbar.open('Your are not registered to a game', 'Register')
    this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
      this.router.navigate(['pvpOrMatch']),
      this.snackbar.dismiss
      )
  }

  sendMeProfile()
  {
    if (this.room === '0')
      return
    this.gameSocketService.sendPlayerInfo(this.player, this.room, this.tokenService.getlogin())
    this.listenToStartGame()
  }

  listenToStartGame()
  {
    this.gameStartedSub = this.gameStartedObs.subscribe(() =>{
      if (this.player.position === 1)
      {
        this.gameService.gameStarted(this.room).subscribe(() => {
          this.gameStarted = true
        })
      }
    })

  }

  endOfGame()
  {
    this.diplayWinner()
    this.gameService.deleteMatch(this.room).subscribe()
    this.gameSocketService.leaveRoom(this.room)
    this.room = ""

    this.snackbar.open('End Of Game', 'Go back Home')
    this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
      this.router.navigate(['overview']),
      this.snackbar.dismiss
      )
  }

  //snackbar if a player is not registered
  diplaySnackbarResult()
  {
    this.snackbar.open('End Of Game', 'See Result')
    this.snackbar._openedSnackBarRef?.onAction().subscribe(() =>
      this.router.navigate(['Match']),
      this.snackbar.dismiss
      )
  }

  async endOfGameTournament()
  {
    this.diplayWinner()
    this.gameSocketService.leaveRoom(this.room)
    // await this.tournamentRegisterScore()

    this.diplaySnackbarResult()


    await this.gameService.tournamentGetGlobalRoom(this.room).subscribe({
      next : (data) => this.globalRoom = data.room,
      complete : () => {
        this.sendTournamentScore(this.globalRoom)
      }
    })

  }

  sendTournamentScore(globalRoom : string)
  {
    let result = new sendMatchResult()
    result.player1_score = this.leftScore
    result.player2_score = this.rightScore
    result.gameStatus = this.player.gameStatus
    if (result.gameStatus === "FINAL")
      this.globalSocketService.tournamentEmitEndFinal(this.room, this.globalRoom, result)
    else
      this.globalSocketService.tournamentEmitEndMatch(this.room, this.globalRoom, result)

    this.room = ""
  }

  // async tournamentRegisterScore()
  // {
  //     await this.gameService.registerScore(this.room, this.leftScore, this.rightScore).subscribe()
  // }

  diplayWinner()
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

    this.showWinnerScore = true;
    this.gameService.deleteMatch(this.room).subscribe()
  }

  ngOnDestroy(): void {
    this.gameSocketService.onDestroy(this.room)
    this.destroy$.next(true);
    this.destroy$.unsubscribe();

  
    if (!this.gameStarted)
    {
      this.gameService.removePlayerFromQueue().subscribe()
    }

    window.removeEventListener('keydown', this.keydownHandler)

    this.snackbar.dismiss()

  }

  }

