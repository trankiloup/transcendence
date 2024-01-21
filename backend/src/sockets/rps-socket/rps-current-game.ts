
import { Server } from "http";
import { gameStatusInt } from "./Interface/gameStatus.interface";
import { RpsSocketService } from "./rps-socket.service";
import { playerPosition } from "src/game/Interface/player-position.interface";
import { Inject } from "@nestjs/common";
import { GameResultInt } from "./Interface/gameResult.interface";

export class RpsCurrentGame {
    constructor(
        private rpsSocketService : RpsSocketService,
    ){
    }

    private player1_score = 0
    private player2_score = 0
    private maxScore  = 3

    private player1 : string = 'waiting for opponent'
    private player1_login : string = ""
    private player2 : string = 'waiting for opponent'
    private player2_login : string = ""

    private player1_card : string = ""
    private player2_card : string = ""

    private gameStarted : boolean = false

    private room : number = 0
    private surveyNumberOfGame : number = 0

    private resultEmitted : boolean = false

    private gameState : string = "Not Started"



    updateUsername( player : playerPosition, login : string)
    {
        if (player.position === 1)
        {
            this.player1 = player.username
            this.player1_login = login
        }
        else if (player.position === 2)
        {
            this.player2 = player.username
            this.player2_login = login
        }
        this.room = player.globalRoomId
    }

    getMatchStatus() : gameStatusInt
    {
        let gameStatus = new gameStatusInt()
        gameStatus.player1 = this.player1
        gameStatus.player1_login = this.player1_login
        gameStatus.player2 = this.player2
        gameStatus.player2_login = this.player2_login
        gameStatus.player1_score = this.player1_score
        gameStatus.player2_score = this.player2_score
        return gameStatus
    }

    bothPlayerRegistered() : boolean
    {
        if (this.player1_login && this.player2_login)
            return true
        return false
    }


    putMatchStarted()
    {
      this.gameStarted = true
    }

    newGame()
    {
        this.resultEmitted = false
        this.resetPlayerCard()
        this.surveyNumberOfGame +=1
        this.surveyIfPlayerLeft()
    }

    getResult()
    {
        if (!this.player1_card)
            this.player1_card = this.getRandomCard()
        if (!this.player2_card)
            this.player2_card = this.getRandomCard()


    }

    calcResult() : GameResultInt
    {
        this.getResult()
        let gameResult = new GameResultInt()
        if ( this.player1_card === 'rock' && this.player2_card === 'cheers' ||
            this.player1_card === 'beer' && this.player2_card === 'rock' ||
            this.player1_card == 'cheers' && this.player2_card == 'beer')
            {
                this.player1_score += 1;
                gameResult.winner = this.player1
            }
        else if (this.player1_card === 'rock' && this.player2_card === 'rock' ||
            this.player1_card === 'beer' && this.player2_card === 'beer' ||
            this.player1_card === 'cheers' && this.player2_card == 'cheers') 
            {
                gameResult.tied = true
            }
        else if (this.player1_card === 'rock' && this.player2_card === 'beer' ||
            this.player1_card === 'beer' && this.player2_card === 'cheers' ||
            this.player1_card === 'cheers' && this.player2_card == 'rock')
            {
                this.player2_score += 1;
                gameResult.winner = this.player2
            }
        gameResult.player1_card = this.player1_card
        gameResult.player2_card = this.player2_card
        return gameResult
    }

    getRandomCard() : string
    {
        const randomChoice = ['rock', 'beer', 'cheers']
        const randomIndex = Math.floor(Math.random() * randomChoice.length)
        return randomChoice[randomIndex]
    }

    setGameStarded()
    {
        this.gameStarted = true
        this.surveyNumberOfGame += 1
        this.surveyIfPlayerLeft()
    }


    isGameStarted()
    {
        return this.gameStarted
    } 

    isResultEmitted() : boolean
    {
        return this.resultEmitted
    }

    isGameOver() : boolean
    {
        if (this.player1_score >= this.maxScore || this.player2_score >= this.maxScore)
            return true
        return false
    }

    setResultEmitted()
    {
        this.resultEmitted = true
        this.surveyNumberOfGame += 1
    }

    resetPlayerCard()
    {
        this.player1_card = ""
        this.player2_card = ""
    }

    registerPlayerCard(player : playerPosition, card : string)
    {
        if (player.position === 1)
        {
            if (this.player1_card === "")
                this.player1_card = card
        }
        else if (player.position === 2)
        {
            if (this.player2_card === "")
                this.player2_card = card
        }
    }

    isEndOfMatch() : boolean
    {
        if (this.player1_score >= this.maxScore || this.player2_score >= this.maxScore)
            return true
        return false
    }

    setscore(player1_score: number, player2_score: number)
    {
        this.player1_score = player1_score
        this.player2_score = player2_score
    }

    getGameState() : string
    {
        return this.gameState
    }

    surveyIfPlayerLeft()
    {
        const lastSurvey = this.surveyNumberOfGame
        setTimeout(() => {
            if (!this.isEndOfMatch() && lastSurvey === this.surveyNumberOfGame)
            {
                // console.log('delete match')
                this.rpsSocketService.removeMatchFromMatchmaking(this.room)
            }
        }, 15000)
    }

  
}