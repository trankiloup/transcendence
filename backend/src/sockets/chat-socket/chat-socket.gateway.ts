import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { getConversationsDTO } from "src/chat/DTO/getConversations.dto";
import { getRelationsListDTO } from "src/chat/DTO/getRelationsList.dto";
import { getRoomDTO } from "src/chat/DTO/getRoom.dto";
import { ChatService } from "src/chat/chat.service";
import { friendsDTO } from "src/user/relations/DTO/friends.dto";
import { RelationsService } from "src/user/relations/relations.service";
import { UserService } from "src/user/user.service";

@WebSocketGateway({cors: {origin : ['https://localhost:3000', 'https://localhost:4200']}, namespace : 'chat'})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

    private rooms: Map<string, Set<string>> = new Map();
    constructor(
        private chatService : ChatService,
        private userService : UserService,
        private relationService : RelationsService
    ){}

    @WebSocketServer()
    server: Server

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, data: string) {
        client.join(data);
        if (!this.rooms.has(data))
            this.rooms.set(data, new Set())
        this.rooms.get(data).add(client.id)
    }

    handleConnection(client: Socket, ...args:any[]){
        this.updateChatList()
    }

    handleDisconnect(client: Socket) {
        this.updateChatList()
    }

    async updateChatList()
    {
        let chatList = await this.chatService.getChatList();
        for(var i = 0; i < chatList.length; i++) {
            if (!chatList[i].username)
                chatList[i].username = await this.userService.getUsernameByLogin(chatList[i].login)
        }
        this.server.emit('chatlist', chatList);
    }

    async updateConvList(id: number, room: string, other: number) {
        let conv : getRoomDTO[] = []
        let convList = await this.chatService.getConversationsById(id)
        for (var i = 0; i < convList.length; i++){
            let msg : boolean = false;
            if (convList[i].id_1 == id) {
                if (convList[i].id_2 == other)
                    msg = true;
                let newElem = {id: convList[i].id_2, name: convList[i].user_2, room: convList[i].room, conversations: convList[i].conversations, new: msg}
                conv.push(newElem);
            }
            else {
                if (convList[i].id_1 == other)
                    msg = true;
                let newElem = {id: convList[i].id_1, name: convList[i].user_1, room: convList[i].room, conversations: convList[i].conversations, new: msg}
                conv.push(newElem);
            }
        }
        this.server.to(room).emit('convs', conv);
    }

    async updateFriendsList(id: number, room: string){
        let list : friendsDTO[] = []
        let friends = await this.relationService.getFriends(id)
        for (var i = 0; i < friends.length; i++){
            let newElem = {user_id: friends[i].id_2, username: friends[i].user_2.username, status: friends[i].status}
            list.push(newElem)
        }
        this.server.to(room).emit('friends-list', list)

    }

    @SubscribeMessage('updateChatList')
    handleUpdateChatList(client : Socket, data : any) {
        this.updateChatList();
    }

    upChat(data : number) {
        let bool : number[] = [data]
        this.server.emit('new-chat', bool)
    }

    @SubscribeMessage('up-chat')
    handleUpChat(client : Socket, data : {up :number}) {
        const {up} = data
        this.upChat(up)
    }

    upChatRoom(room: string){
        let bool : number[] = [0]
        this.server.to(room).emit('new-chat', bool)
    }

    @SubscribeMessage('up-chat-room')
    handleUpChatRoom(client: Socket, data : {room : string}) {
        const {room} = data
        this.upChatRoom(room);
    }

    @SubscribeMessage('updateConvList')
    handleUpdateConvList(client : Socket, data : {id: number, roomId: string, other: number}) {
        const {id, roomId, other} = data
        this.updateConvList(id, roomId, other)
    }

    @SubscribeMessage('updateFriendsList')
    handleUpdateFriendsList(client : Socket, data: {id: number, roomId: string}){
        const {id, roomId} = data
        this.updateFriendsList(id, roomId)
    }

    @SubscribeMessage('test')
    test(client : Socket)
    {
        this.server.emit('message', 'test recu')
    }
}
