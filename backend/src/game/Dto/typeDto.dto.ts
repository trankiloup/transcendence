import { IsString } from "class-validator";

export class typeDto
{
    @IsString()
    type: string
}