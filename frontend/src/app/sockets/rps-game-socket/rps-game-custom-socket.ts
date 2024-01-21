import { Injectable } from "@angular/core";
import { Socket} from "ngx-socket-io";
import { tokenGetter } from "src/main";
import { ExtendedSocketIoConfig } from "../SocketConfig.interface";



  const configRpsGame: ExtendedSocketIoConfig = {
    url: 'https://localhost:3000/rps', options: {
      extraHeaders: {
        Authorization: tokenGetter()
      }
    }
  };

@Injectable({providedIn: 'root'})
export class CustomRpsGameSocket extends Socket {
  constructor() {
    super(configRpsGame)
  }
}