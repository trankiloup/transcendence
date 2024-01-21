import { playerPosition } from "src/game/Interface/player-position.interface";
import { positions } from "./Interface/positions.interface";
import { playersUsername } from "./Interface/players-username.interface";
import { ScoreService } from "src/game/score/score.service";
import { scoreDTO } from "src/game/score/DTO/score.dto";
import { GameSocketService } from "./game-socket.service";
import { getScore } from "./Interface/getScore.interface";
import { Server} from 'socket.io'
import { WebSocketServer } from "@nestjs/websockets";

export class CurrentGame {
    constructor( private gameSocketService : GameSocketService

    ){
        const randomSign = Math.random() < 0.5 ? -1 : 1; //random initial ball directionn
        this.xspeed = 1.2 * randomSign
        this.yspeed = 1.2
        this.gameStarded = false
    }

    @WebSocketServer()
    server: Server


    private pongheight : number = 150;
    private pongwidth : number = 300;
    private xleftPad : number = 5
    private yleftPad : number = 5;
    private xrightPad : number = 290;
    private yrightPad : number = 100;
    private radius : number = 4;
  
    private leftScore = 0
    private rightScore = 0
    private maxScore  = 3

    private padwidth : number = 5;
    private padheight : number = 40;
    private xball : number = 150;
    private yball : number = 100;
    private xspeed : number
    private yspeed : number 

    private leftplayer : string = 'waiting for opponent'
    private rightplayer : string = 'waiting for opponent'
    private leftplayer_login = ""
    private rightplayer_login = ""

    private match_type = "NONE"
    private gameStarded : boolean

    private endOfCountDown : boolean = false
    

    getPosition() : positions
    {
        this.update_ball_position()
        const position = new positions()
        position.xball = this.xball
        position.yball = this.yball
        position.yleftPad = this.yleftPad
        position.yrightPad = this.yrightPad
        position.leftscore = this.leftScore
        position.rightscore = this.rightScore
        return position
    }

    updateUsername( player : playerPosition, login : string)
    {
      if (player.position === 1)
      {
        this.leftplayer = player.username
        this.leftplayer_login = login
      }
      else if (player.position === 2)
      {
        this.rightplayer = player.username
        this.rightplayer_login = login
      }
      this.match_type = player.type
    }

    getPlayerUsername()
    {
      let players = new playersUsername ()
      players.leftplayer = this.leftplayer
      players.rightplayer = this.rightplayer
      return players
    }

    getPlayerLogin()
    {
      let players = new playersUsername()
      players.leftplayer = this.leftplayer_login
      players.rightplayer = this.rightplayer_login
      return players
    }

    putMatchStarted()
    {
      this.gameStarded = true
    }

    newGame()
    {
        const randomSign = Math.random() < 0.5 ? -1 : 1; //random initial ball direction
        this.xball = 150
        this.yball = 100
    
        this.xspeed = 1.2 * randomSign
        this.yspeed = 1.2
    }

    isGameStarted()
    {
        return this.gameStarded
    } 

    getMatchType()
    {
      return this.match_type
    }

    isEndOfMatch() : boolean
    {
        if (this.leftScore >= this.maxScore || this.rightScore >= this.maxScore)
            return true
        return false
    }

    bothPlayerRegistered() : boolean
    {
      if (this.leftplayer_login && this.rightplayer_login)
        return true
      return false
    }

    setscore(leftScore, rightScore)
    {
        this.leftScore = leftScore
        this.rightScore = rightScore
    }

    getScore()
    {
      const score = new getScore()
      score.leftScore = this.leftScore
      score.rightscore = this.rightScore
      return score
    }
    updateScore(playerscore : number)
    {
        if (playerscore == -1)
            this.leftScore += 1
        else
            this.rightScore += 1
        if (this.leftScore < this.maxScore && this.rightScore < this.maxScore)
            this.newGame()
        else
          this.sendScore()
    }

    resolveAfter1Second() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('resolved');
        }, 1000);
      });
    }
  
    async countdownFunction(x, room, server){
      while( x >= 0)
      {
        let result = await this.resolveAfter1Second()
        x--
        server.to(room).emit('count', x);
      }
      this.endOfCountDown = true
    }

    isCountDownFinished()
    {
      return this.endOfCountDown
    }

    async getCountDown(server : Server, room : string)
    {
      await this.countdownFunction(4, room, server)
    }

    
  
    leftPadUp()
    { 
      if (this.yleftPad -10 > 0)
        this.yleftPad -= 10;
      else
        this.yleftPad = 0;
    }
  
    leftPadDown(){
      if (this.yleftPad + 10 < this.pongheight - 40)
        this.yleftPad += 10;
      else
        this.yleftPad = this.pongheight - 40
    }
  
    rightPadUp()
    {
      if (this.yrightPad - 10 > 0)
        this.yrightPad -= 10;
      else
        this.yrightPad = 0
    }
  
    rightPadDown()
    {
      if (this.yrightPad < this.pongheight - 40)
        this.yrightPad +=10
      else
        this.yrightPad = this.pongheight - 40
  
    }
  
    track_pad_collision_left() {
      if (this.xball - this.radius <= this.xleftPad + this.padwidth / 2 
        && (this.yball + this.radius >= this.yleftPad - 1
        && this.yball - this.radius <= this.yleftPad + this.padheight + 1)) {
          // La balle a touché le paddle de gauche
          return true;
        }
        return false;
      }
  
    track_pad_collision_right() {
      if (this.xball + this.radius >= this.xrightPad + this.padwidth / 2 
        && (this.yball + this.radius >= this.yrightPad -1
        && this.yball - this.radius <= this.yrightPad + this.padheight + 1)) {
          // La balle a touché le paddle de droite
          return true;
        }
        return false;
      }
  
    update_ball_position() : number {
      // Mise jour des coordonnées de la balle en fonction de sa vitesse
      this.xball += this.xspeed;
      this.yball += this.yspeed;
  
      // ball moves to the right
      if (this.xball <= (this.pongwidth - this.radius)) {
        if (this.track_pad_collision_right() == true)
        {
          this.apply_bounce_angle(true);
          if (this.xspeed * 1.1 > 7 || this.xspeed * 1.1 < -7)
          {
              if (this.xspeed < 0)
                this.xspeed = 7
              else
                this.xspeed = -7
          }
          else
            this.xspeed *= -1.1;
        }
      }
      else if (this.xball > this.pongwidth - this.radius) {
        this.updateScore(-1)
        return -1;
      }
  
      // ball moves to the left
      if (this.xball >= this.radius) {
        if (this.track_pad_collision_left() == true)
        {
          this.apply_bounce_angle(true);
          if (this.xspeed * 1.1 > 7 || this.xspeed * 1.1 < -7)
          {
              if (this.xspeed < 0)
                this.xspeed = 7
              else
                this.xspeed = -7
          }
          else
            this.xspeed *= -1.1;
        }
      }
      else if (this.xball < this.radius) {
        this.updateScore(1)
        return 1;
      }
  
      // ball moves down
      if (this.yball >= (this.pongheight - this.radius))
        this.yspeed *= -1;
  
      // ball moves up
      if (this.yball - this.radius <= 0)
        this.yspeed *= -1;
      return 0;
    }
  
    apply_bounce_angle(isleft: boolean) {
      // Appliquer l'angle de rebond
      if(isleft)
        this.yspeed = Math.sin(this.calc_bounce_angle_left());
      else
        this.yspeed = Math.sin(this.calc_bounce_angle_right()); 
    }
  
  
  
    // Calculer l'angle de rebond en radians (entre -π/4 et π/4)
    calc_bounce_angle_left(): number {
      let bounceAngle: number;
      bounceAngle = this.calc_impact_pos(this.yleftPad) * Math.PI / 4;
      return(bounceAngle);
    }
  
    calc_bounce_angle_right(): number {
      let bounceAngle: number;
      bounceAngle = this.calc_impact_pos(this.yrightPad) * Math.PI / 4;
      return(bounceAngle);
    }
  
    calc_impact_pos(ypad): number {
      let relativeImpactPosition: number;
      relativeImpactPosition = ((this.yball - ypad) / ((this.padheight) / 2)) - 1;
      return (relativeImpactPosition); //retourne la position normalisée
    }
  
    sendScore()
    {
      if (this.match_type === 'PVP')
      {
        let score : scoreDTO = new scoreDTO()
        score.player = this.leftplayer_login
        score.opponent = this.rightplayer_login
        score.player_score = this.leftScore
        score.opponentscore = this.rightScore
        this.gameSocketService.sendScore(score)
      }

    }
}