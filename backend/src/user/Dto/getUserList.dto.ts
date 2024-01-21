import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class getUserListDto{

    id : number

    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(25)
    username : string

    status: 'ONLINE' | 'OFFLINE' | 'INGAME'

}