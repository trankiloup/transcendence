import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSocketService } from 'src/app/sockets/game-socket/game-socket.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})
export class CountdownComponent implements OnInit, OnDestroy{

  constructor(
    private gameSocketService : GameSocketService
  ){
  }

  countdown! : Observable<number>
  subcription! : Subscription

  private count : number = 3
  public countString : string = ""

  ngOnInit(): void {
    this.countdown = this.gameSocketService.countDown()
    this.subcription = this.countdown.subscribe((data) => {
      this.count = data
      if (this.count === -1)
        this.countString = ""
      else
        this.countString = this.count.toString()
    })
  }

  ngOnDestroy(): void {
    this.subcription.unsubscribe()
    
  }
  



}
