import { tournamentScore } from "src/game/Interface/tournamentScore.Interface"
import { tournamentNameScore } from "./Interfaces/tournamentNameScore.interface"
import { MatchInfo } from "src/game/Interface/matchInfo.interface"
import { finalistLogin } from "./Interfaces/finalistLogin.interface"
import { TournementScoreLogin } from "./Interfaces/tournamentScoreLogin.interface"
import { MatchResult } from "src/game/Interface/matchResult.interface"
import { GlobalSocketService } from "./global-socket.service"

export class tournament
{
    constructor(
        private tournamentId : string,
        private globalSocketService : GlobalSocketService
    ){}

    player1 : string = ""
    player2 : string = ""
    player3 : string = ""
    player4 : string = ""
    finisher1:string = ""
    finisher2:string = ""
    
    player1_login : string = ""
    player2_login : string = ""
    player3_login : string = ""
    player4_login : string = ""
    finisher1_login :string = ""
    finisher2_login :string = ""

    scorePlayer1:number = 0
    scorePlayer2:number = 0
    scorePlayer3:number = 0
    scorePlayer4:number = 0
    scoreFinaleFinisher1:number = 0
    scoreFinaleFinisher2:number = 0

    match1Cancel : boolean = false
    match2Cancel : boolean = false
    finalCancel : boolean = false

    match1finished : boolean = false
    match2Finished : boolean = false
    finalFinished : boolean = false

    rank1:string = ""
    rank2:string = ""
    rank3:string = ""
    rank4:string = ""

    rank1_login : string = ""
    rank2_login : string = ""
    rank3_login : string = ""
    rank4_login : string = ""

    finaleRoom : string = ""
    tournamentRoom : string = ""

    registered : boolean = false

    // nbMatchFinished : number = 0
    
    //emit just one that final ready
    finalReady : boolean = false
    finalEmitted : boolean = false

    tournamentFinished : boolean = false
    

    //set result a the end of each game
    setMatchResult(result : MatchResult)
    {
        if (result.gameStatus === "MATCH1")
        {
            this.scorePlayer1 = result.player1_score
            this.scorePlayer2 = result.player2_score
            this.match1finished = true
        }
        else if (result.gameStatus === 'MATCH2')
        {
            this.scorePlayer3 = result.player1_score
            this.scorePlayer4 = result.player2_score
            this.match2Finished = true
        }
        else if (result.gameStatus === "FINAL")
        {
            this.scoreFinaleFinisher1 = result.player1_score
            this.scoreFinaleFinisher2 = result.player2_score
            this.finalFinished = true
        }
        this.setRanking()
    }



    isFinalReadY() : boolean
    {
        if (this.match1finished && this.match2Finished)
            return true
        return false
    }

    setFinalEmitted()
    {
        this.finalEmitted = true
    }

    getFinalEmitted(): boolean
    {
        return this.finalEmitted
    }


    setTournamentFinished()
    {
        this.tournamentFinished = true
    }

    getTournamentFinished()
    {
        return this.tournamentFinished
    }

    isTournamentOver() : boolean
    {
        if (this.scoreFinaleFinisher1 === 0 && this.scoreFinaleFinisher2 === 0)
            return false
        return true
    }

    getNameScores() : tournamentNameScore
    {
        let res = new tournamentNameScore()
        if (this.player1)
            res.player1 = this.player1
        if (this.player2)
            res.player2 = this.player2
        if (this.player3)
            res.player3 = this.player3
        if (this.player4)
            res.player4 = this.player4
        if (this.finisher1)
            res.finisher1 = this.finisher1
        if (this.finisher2)
            res.finisher2 = this.finisher2
        res.scorePlayer1 = this.scorePlayer1
        res.scorePlayer2 = this.scorePlayer2
        res.scorePlayer3 = this.scorePlayer3
        res.scorePlayer4 = this.scorePlayer4
        res.scoreFinaleFinisher1 = this.scoreFinaleFinisher1
        res.scoreFinaleFinisher2 = this.scoreFinaleFinisher2
        res.rank1 = this.rank1
        res.rank2 = this.rank2
        res.rank3 = this.rank3
        res.rank4 = this.rank4
        return res
    }



    setInfo(res : MatchInfo)
    {
        this.player1 = res.player1
        this.player1_login = res.player1_login
        this.player2 = res.player2
        this.player2_login = res.player2_login
        this.player3 = res.player3
        this.player3_login = res.player3_login
        this.player4 = res.player4
        this.player4_login = res.player4_login

        if (res.finisher1)
        {
            this.finisher1 = res.finisher1
            this.finisher1_login = res.finisher1_login
        }
        if (res.finisher2)
        {
            this.finisher2 = res.finisher2
            this.finisher2_login = res.finisher2_login
        }

        if (res.match2Finished)
        {
            this.scorePlayer1 = res.scorePlayer1
            this.scorePlayer2 = res.scorePlayer2
            this.match1Cancel = res.match1Cancel
            this.match1finished = res.match1finished
        }

        if (res.match2Finished)
        {
            this.scorePlayer3 = res.scorePlayer3
            this.scorePlayer4 = res.scorePlayer4
            this.match2Cancel = res.match2Cancel
            this.match2Finished = res.match2Finished
        }

        if (res.finalFinished)
        {   
            this.scoreFinaleFinisher1 = res.scoreFinaleFinisher1
            this.scoreFinaleFinisher2 = res.scoreFinaleFinisher2
            this.finalCancel = res.finalCancel
            this.finalFinished = res.finalFinished
        }
    
        this.finaleRoom = res.finaleRoom

        this.setRanking()
    }

    areFirstMatchOver() : boolean
    {
        if (this.finisher1_login && this.finisher2_login)
            return true
        return false
    }

    setRanking()
    {
        if (this.match1finished)
        {
            if (this.scorePlayer1 < this.scorePlayer2)
            {
                if (this.rank4 === "")
                {
                    this.rank4 = this.player1
                    this.rank4_login = this.player1_login
                }
                else if (this.rank3 === "" && this.rank4 != this.player1)
                {
                    this.rank3 = this.player1
                    this.rank3_login = this.player1_login
                }
                this.finisher1_login = this.player2_login
                this.finisher1 = this.player2
            }
            else if (this.scorePlayer1 > this.scorePlayer2)
            {
                if (this.rank4 === "")
                {
                    this.rank4 = this.player2
                    this.rank4_login = this.player2_login
                }
                else if (this.rank3 === "" && this.rank4 != this.player2)
                {
                    this.rank3 = this.player2
                    this.rank3_login = this.player2_login
                }
                this.finisher1_login = this.player1_login
                this.finisher1 = this.player1
            }
        }
        if (this.match2Finished)
        {
            if (this.scorePlayer3 < this.scorePlayer4)
            {
                if (this.rank4 === "")
                {
                    this.rank4 = this.player3
                    this.rank4_login = this.player3_login
                }
                else if (this.rank3 === "" && this.rank4 != this.player3)
                {
                    this.rank3 = this.player3
                    this.rank3_login = this.player3_login
                }
                this.finisher2_login = this.player4_login
                this.finisher2 = this.player4
            }
            else if (this.scorePlayer3 > this.scorePlayer4)
            {
                if (this.rank4 === "")
                {
                    this.rank4 = this.player4
                    this.rank4_login = this.player4_login
                }
                else if (this.rank3 === "" && this.rank4 != this.player4)
                {
                    this.rank3 = this.player4
                    this.rank3_login = this.player4_login
                }
                this.finisher2_login = this.player3_login
                this.finisher2 = this.player3
            }
        }
        if (this.finalFinished)
        {
            if (this.scoreFinaleFinisher1 < this.scoreFinaleFinisher2)
            {
                this.rank1 = this.finisher2
                this.rank2 = this.finisher1
            }
            else if ( this.scoreFinaleFinisher1 > this.scoreFinaleFinisher2)
            {
                this.rank1 = this.finisher1
                this.rank2 = this.finisher2
            }
            this.getFinalRankLogin()
        }
    }

    getFinalRankLogin()
    {
        if (this.rank1 === this.player1)
            this.rank1_login = this.player1_login
        else if (this.rank1 === this.player2)
            this.rank1_login = this.player2_login
        else if (this.rank1 === this.player3)
            this.rank1_login = this.player3_login
        else if (this.rank1 === this.player4)
            this.rank1_login = this.player4_login

        if (this.rank2 === this.player1)
            this.rank2_login = this.player1_login
        else if (this.rank2 === this.player2)
            this.rank2_login = this.player2_login
        else if (this.rank2 === this.player3)
            this.rank2_login = this.player3_login
        else if (this.rank2 === this.player4)
            this.rank2_login = this.player4_login
    }

    getFinalist() : finalistLogin
    {
        let finalist = new finalistLogin()
        finalist.firstFinalist = this.finisher1_login
        finalist.secondFinalist = this.finisher2_login
        finalist.finalRoom = this.finaleRoom
        return finalist
    }


    removePlayer(name : string)
    {
        if (this.player1 === name)
            this.player1 = ""
        else if (this.player2 === name)
            this.player2 = ""
        else if (this.player3 === name)
            this.player3 = ""
        else if (this.player4 === name)
            this.player4 = ""
    }

    isTournamentEmpty() : boolean
    {
        if (!this.player1 && !this.player2 && !this.player3 && !this.player4)
            return true
        return false
    }


    //to register inside database
    getTournamentScore() : TournementScoreLogin
    {
        let score = new TournementScoreLogin()
        score.rank1 = this.rank1_login
        score.rank2 = this.rank2_login
        score.rank3 = this.rank3_login
        score.rank4 = this.rank4_login

        return score
    }

    getRegistered() : boolean
    {
        return this.registered
    }

    setRegistered()
    {
        this.registered = true
    }

    startTimeLimit(globalRoom : string)
    {
        // console.log('')
        setTimeout(() => {
            if (!this.isTournamentOver())
            {
                this.globalSocketService.matchTimout(globalRoom)
                // console.log('Tournament over')
            }
        }, 1000 * 60 * 10)
    }


}