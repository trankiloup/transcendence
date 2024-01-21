import { Injectable } from "@angular/core";
import { Socket} from "ngx-socket-io";
import { tokenGetter } from "src/main";
import { ExtendedSocketIoConfig } from "../SocketConfig.interface";

// configuration personalisee du socket
// au lieu de tout faire sur le meme socket, j'ai pense que c'etait mieux de diviser les taches
// d'un ca sera plus clair et de deux, ca evite les conflits git si on travaille toutes les 2 sur le meme fichier 
// On aura surement 3 socket : userliste, chat, jeu
//
// ton socket aura pour namespace chat. Donc attention a bien ajouter le namespace dans ton gateway cote nestjs
// le jwt token sera passe dans toutes les requetes. tu pourras avoir le login de la personne
// ta une fonction dans le auth controler du backend qui te permet d'extraire le login du Jwt Token :
// async extractLoginFromJWT( token : string) : Promise<string>

// si tu fais des testes de socket sur postman, pense bien a mettre la bonne url, avec chat a la fin (sur les sockets uniquement)
  const configChat: ExtendedSocketIoConfig = {
    url: 'https://localhost:3000/chat', options: {
      extraHeaders: {
        Authorization: tokenGetter()
      }
    }
  };


// ca cree une classe Custome qui herite de socket, mais avec les parametres de config juste au dessus
@Injectable({providedIn: 'root'})
export class CustomChatSocket extends Socket {
  constructor() {
    super(configChat)
  }
}
