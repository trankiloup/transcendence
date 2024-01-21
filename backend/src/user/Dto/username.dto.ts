import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class usernameDto{
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(15)
    username : string
}