import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class scoreDTO{
    @IsNotEmpty()
    @IsString()
    player : string

    @IsNotEmpty()
    @IsString()
    opponent: string

    @IsNotEmpty()
    @IsNumber()
    player_score : number
    
    @IsNotEmpty()
    @IsNumber()
    opponentscore : number
}