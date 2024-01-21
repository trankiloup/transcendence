import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RelationsService } from './relations.service';

@Component({
  selector: 'app-relations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relations.component.html',
  styleUrls: ['./relations.component.css']
})
export class RelationsComponent {

    constructor(
      private router: Router,
      private relationsService: RelationsService,
    ) {}
  
}
