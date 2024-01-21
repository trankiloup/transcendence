import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class getRelationsListDTO
{
    id: number
    username: string
    relation: number
}