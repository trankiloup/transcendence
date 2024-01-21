import { relationStatus } from "../enum/relations-status.enum"

export interface FriendsList {
    user_id : number
    username : string
    status : relationStatus
}