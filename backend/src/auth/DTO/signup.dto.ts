import { IsNotEmpty, IsString } from "class-validator";

export class signUpDto
{
    @IsNotEmpty()
    @IsString()
    login: string
}