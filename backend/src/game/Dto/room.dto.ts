import { IsNotEmpty, IsString } from "class-validator";

export class roomDto{
    @IsNotEmpty()
    @IsString()
    room : string
}