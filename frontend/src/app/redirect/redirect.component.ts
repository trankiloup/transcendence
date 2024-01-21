import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../authguard/token.service';
import { tokenInterface } from '../interfaces/token.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  constructor(
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private router: Router
  ) { }


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token: tokenInterface = {
        access_token: params['token']
      }
      if (token.access_token) {
        this.tokenService.saveToken(token.access_token)
        this.router.navigate(['two-fa']);
      }
      else
        this.router.navigate(['home']);
    })
  }
}