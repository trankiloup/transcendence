import { PrivateMessage } from "../Entities/priv-msg.entity"
import { getPrivateMsgDTO } from "./getPrivateMessage.dto"
import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class getRoomDTO
{
    id : number
    name : string

    room : number

    conversations : getPrivateMsgDTO[]
    new : boolean
}