import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toggle',
  templateUrl: './my-toogle.component.html',
  styleUrls: ['./my-toogle.component.css'],
  standalone: true,

  imports: [
    NgClass,
  ],
  /*animations: [
    trigger('toggleTrigger', [
      state('off', style({ transform: 'translateX(0%)' })),
      state('on', style({ transform: 'translateX(100%)' })),
      transition('on <=> off', [
        animate('2ms')
      ])
    ])
  ],*/
  encapsulation: ViewEncapsulation.None
})

export class MyToogleComponent implements OnInit {
  @Input() toggleOn = false;
  @Output() toggledTo = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  toggleClick(): any {
    if (this.toggleOn) {
      this.toggleOn = false;
      this.toggledTo.emit('off');
    } else {
      this.toggleOn = true;
      this.toggledTo.emit('on');
    }
  }
}
