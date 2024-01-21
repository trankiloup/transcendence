export class MatchInfo
{
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

    tournamentRoom : string = ""
    finaleRoom : string = ""
}