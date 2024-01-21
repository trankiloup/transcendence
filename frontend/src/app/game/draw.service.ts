import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawService {

  constructor() {
       }

  //general
  private width : number = 300;
  private height : number = 150;
  private color : string = "#66ff00";

  //paddles
  private widthPad : number = 5;
  private heightPad : number = 40;
  private xleftpad : number = 5;
  private xrightpad : number = 290;
  private radiusPad : number = 4;

  //ball
  private radiusBall : number = 4


  // context! : any



  // initDrawService(pong : HTMLCanvasElement)
  // {
  //   context = pong.getContext('2d')

  // }

  clearAll(context : any)
  {
    // context = pong.getContext('2d');
    context.clearRect(0, 0, this.width, this.height);
  }

  drawBall(context : any, x : number,y : number)
  {
    context.beginPath();
    context.arc(x, y, this.radiusBall, 0, Math.PI * 2, true);
    context.closePath();
    context.fillStyle = this.color;
    context.fill();
  }

  drawLeftPaddle(context : any, y : number)
  {
    // console.log(context.canvas.height, context.canvas.width)
    // console.log(window.innerHeight, window.innerWidth)
    context.beginPath();
    context.beginPath();
    context.moveTo(this.xleftpad + this.radiusPad, y);
    context.arcTo(this.xleftpad + this.widthPad, y, this.xleftpad + this.widthPad, y + this.height, this.radiusPad);
    context.arcTo(this.xleftpad + this.widthPad, y + this.heightPad, this.xleftpad, y + this.heightPad, this.radiusPad);
    context.arcTo(this.xleftpad, y + this.heightPad, this.xleftpad, y, this.radiusPad);
    context.arcTo(this.xleftpad, y, this.xleftpad + this.widthPad, y, this.radiusPad);
    context.closePath();

    context.fillStyle = this.color;
    context.fill();
  }

  drawRighPaddle(context : any, y : number)
  {

    context.beginPath();
    context.beginPath();
    context.moveTo(this.xrightpad + this.radiusPad, y);
    context.arcTo(this.xrightpad + this.widthPad, y, this.xrightpad + this.widthPad, y + this.height, this.radiusPad);
    context.arcTo(this.xrightpad + this.widthPad, y + this.heightPad, this.xrightpad, y + this.heightPad, this.radiusPad);
    context.arcTo(this.xrightpad, y + this.heightPad, this.xrightpad, y, this.radiusPad);
    context.arcTo(this.xrightpad, y, this.xrightpad + this.widthPad, y, this.radiusPad);
    context.closePath();

    context.fillStyle = this.color;
    context.fill();

  }

  drawNet(context : any)
  {
    context.beginPath();
    context.moveTo((this.width)/2, this.height/2 - 50);
    context.lineTo((this.width)/2, this.height/2 + 50);
    context.strokeStyle = "#66ff00";
    context.lineWidth = 2;
    context.stroke();

  }

}
