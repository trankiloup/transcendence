import { Injectable } from "@angular/core";
import { Socket} from "ngx-socket-io";
import { tokenGetter } from "src/main";
import { ExtendedSocketIoConfig } from "../SocketConfig.interface";

  const configGlobal: ExtendedSocketIoConfig = {
    url: 'https://localhost:3000/global', options: {
      extraHeaders: {
        Authorization: tokenGetter()
      }
    }
  };


@Injectable({providedIn: 'root'})
export class CustomGlobalSocket extends Socket {
  constructor() {
    super(configGlobal)
  }
}