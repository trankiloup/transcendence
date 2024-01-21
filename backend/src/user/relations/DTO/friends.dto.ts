import { relationStatus } from "../Entity/relations.entity"

export class friendsDTO{
    user_id : number
    username : string
    status : relationStatus
}