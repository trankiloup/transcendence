import { Injectable } from "@angular/core";
import { Socket} from "ngx-socket-io";
import { tokenGetter } from "src/main";
import { ExtendedSocketIoConfig } from "../SocketConfig.interface";



  const configGame: ExtendedSocketIoConfig = {
    url: 'https://localhost:3000/game', options: {
      extraHeaders: {
        Authorization: tokenGetter()
      }
    }
  };

@Injectable({providedIn: 'root'})
export class CustomGameSocket extends Socket {
  constructor() {
    super(configGame)
  }
}