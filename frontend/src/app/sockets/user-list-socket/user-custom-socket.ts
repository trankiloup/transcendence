import { Injectable } from "@angular/core";
import { Socket} from "ngx-socket-io";
import { tokenGetter } from "src/main";
import { ExtendedSocketIoConfig } from "../SocketConfig.interface";



  const config: ExtendedSocketIoConfig = {
    url: 'https://localhost:3000/user', options: {
      extraHeaders: {
        Authorization: tokenGetter()
      }
    }
  };

@Injectable({providedIn: 'root'})
export class CustomSocket extends Socket {
  constructor() {
    super(config)
  }
}