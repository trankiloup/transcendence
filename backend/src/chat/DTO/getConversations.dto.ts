import { PrivateMessage } from "../Entities/priv-msg.entity"
import { getPrivateMsgDTO } from "./getPrivateMessage.dto"
import { IsString, IsNotEmpty, IsInt, ValidateNested} from 'class-validator'

export class getConversationsDTO
{

    id_1: number
    id_2: number
    user_1: string
    user_2: string
    room: number
    conversations: getPrivateMsgDTO[]
}