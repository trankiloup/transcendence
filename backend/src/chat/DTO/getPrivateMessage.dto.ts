import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class getPrivateMsgDTO
{
    id_auth: number
    id_dest: number

    message: string
    
    username_auth: string
    username_dest: string
}