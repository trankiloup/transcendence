import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AppService {

  // public PopUpChange = new EventEmitter<boolean>()

  private variable: boolean = false
  private inviteVariable: boolean = false


  public PopUpVariable = new BehaviorSubject<boolean>(this.variable)
  public InvitePopUp = new BehaviorSubject<boolean>(this.inviteVariable)

  public setGlobalPopUp(value: boolean) {
    this.variable = value
    this.PopUpVariable.next(this.variable)
  }


  public SetInvitePopUp(value: boolean) {
    this.inviteVariable = value
    this.InvitePopUp.next(this.inviteVariable)
  }

}
