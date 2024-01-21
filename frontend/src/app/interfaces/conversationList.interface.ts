import { MessageInterface } from "./struct-message.interface"

export interface ConversationListInterface {
    id : number
    name : string
    room : number
    conversations: MessageInterface[]
    new : boolean
}