import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {ModalService} from "./modal.service";
import { ResMessage } from '../../Interface/Resmessage.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css', '../../../app.component.css'],

})

export class ModalComponent implements OnInit,OnDestroy {

  createdSubscription: Subscription;
  isCreated:boolean;
  span:Element | null= null;
  constructor(
    private modal:ModalService,
    private router:Router, 
    private snackbar : MatSnackBar
    ) {
    this.createdSubscription = new Subscription;
    this.isCreated = false;
  };

  private playerRegistered = false
  private message = ""

ngOnInit(){

  this.message = ""
  //j'interroge le back qui me dit ou aller
  this.modal.PvpCreateOrJoinPvp().subscribe({
    next: (data : ResMessage) => {
      if (data.message === "create")
        this.isCreated = false
      else if (data.message === 'join')
        this.isCreated = true
      else
      {
        this.message = "forbidden"
      }

    },
    complete : () => {
      this.span = document.getElementsByClassName("close")[0];
      this.playerRegistered = true
      this.createdSubscription = this.modal.isCreatedPvp.asObservable().subscribe(result =>{this.isCreated =result});
    }
  })
}



  close() {
      if (this.playerRegistered === true)
      {
        this.modal.cancelSubcription().subscribe({
          complete :() => this.playerRegistered = false} )
      }
      this.modal.isClicked.next(false);
    }
  goGame(){
      if (this.message === "")
      this.modal.registerPlayerToPvp().subscribe({
        next : (data) => {
          if (data === false)
          {
            this.close()
            this.snackbar.open('You are already registered to a tournament', '', {duration : 3000})
            return
          }
        },
        complete: () => this.modal.isCreatedPvp.next(true)
      })
      else
      {
        this.close()
        this.snackbar.open('You are already registered to a tournament', '', {duration : 3000})
      }
      
    }
  ngOnDestroy(){
    this.createdSubscription.unsubscribe();
    this.snackbar.dismiss
  }
}
