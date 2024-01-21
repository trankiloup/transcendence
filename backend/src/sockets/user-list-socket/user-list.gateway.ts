import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { UserService } from "src/user/user.service";
import { Socket } from 'socket.io';




//mettre un namespace pour differencier nos sockets
@WebSocketGateway({cors: {origin : ['https://localhost:4200', 'https://localhost:3000']}, namespace : 'user'}) 
export class UserListGateway{

    constructor(
        private userService : UserService,
        ){}


    @WebSocketServer()
    server: Server

 
    //va chercher dans la db la liste
    // puis emet un evenement 'userlist' auquel elle joint la liste des users
    //cet evenement est attrape par angular dans le socket service
    // tous les utilisateurs abonnes a la liste recevront les changements
    async updateUserList()
    {
        let userList = await this.userService.getUserList()
        this.server.emit('userlist', userList);
    }


    // fonction appelee par angular quand un utilisateur se log, se deco ou est en jeu
    // permet de mettre a jour la liste 
    // angular emet le message updateUserList
    @SubscribeMessage('updateUserList')
    handleUpdateUserList(client: Socket, data: any) {
        this.updateUserList();
    }
    
}