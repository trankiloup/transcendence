import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WarmUpService } from './warm-up.service';
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'app-warm-up',
  templateUrl: './warm-up.component.html',
  styleUrls: ['./warm-up.component.css', '../app.component.css'],
  standalone: true,
  imports: [NgOptimizedImage],
})
export class WarmupComponent {

  constructor(
    private router: Router,
    private warmupService: WarmUpService
  ) { }

  login() {
    this.warmupService.isUserLoggedIn().subscribe({
      next: data => {
        if (data === true)
          this.router.navigate(['two-fa']);
        else {
          this.warmupService.getRedirectToApi42() // <-- With Api42
          // this.router.navigate(['login']); // <-- Without Api42
        }
      },
      error: (error) => console.log(error)
    })
  }

}
