import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class getMeProfile{
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(15)
    username : string

    @IsNotEmpty()
    avatarUrl :string
}