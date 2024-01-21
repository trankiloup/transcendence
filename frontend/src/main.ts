import { FormsModule } from '@angular/forms';
import { Routes, RouterModule, provideRouter } from '@angular/router';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgFor, CommonModule } from '@angular/common';
import { TokenInterceptorProvider } from './app/authguard/token.interceptor';
import { authTokenGuard } from './app/authguard/auth-token.guard';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ModalGoComponent } from "./app/modal-go/modal-go.component";
import { ModalGoService } from "./app/modal-go/modal-go.service";

const routes: Routes = [
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./app/warm-up/warm-up.component').then(module => module.WarmupComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./app/unauthorized/unauthorized.component').then(module => module.UnauthorizedComponent)
  },
  {
    path: 'overview',
    loadComponent: () => import('./app/overview/overview.component').then(module => module.OverviewComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./app/login/login.component').then(module => module.LoginComponent), title: 'Login'
  },
  {
    path: 'user-profile',
    loadComponent: () => import('./app/user-profile/user-profile.component').then(module => module.UserProfileComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'game',
    loadComponent: () => import('./app/game/game.component').then(module => module.GameComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'pvpOrMatch',
    loadComponent: () => import('./app/game/pvp-vs-match/pvp-vs-match.component').then(module => module.PvpVsMatchComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'Match',
    loadComponent: () => import('./app/game/pvp-vs-match/match/match.component').then(module => module.MatchComponent),
    canActivate: [authTokenGuard]
  },

  {
    path: 'rpsGame',
    loadComponent: () => import('./app/rps-game/rps-game.component').then(module => module.RpsGameComponent),
    canActivate: [authTokenGuard]
  },

  {
    path: 'chat',
    loadComponent: () => import('./app/chat/chat.component').then(module => module.ChatComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'relations',
    loadComponent: () => import('./app/relations/relations.component').then(module => module.RelationsComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'score-history/:userNameRoute',
    loadComponent: () => import('./app/score-history/score-history.component').then(module => module.ScoreHistoryComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'two-fa',
    loadComponent: () => import('./app/two-fa/two-fa.component').then(module => module.TwoFaComponent),
    canActivate: [authTokenGuard]
  },
  {
    path: 'redirect',
    loadComponent: () => import('./app/redirect/redirect.component').then(module => module.RedirectComponent),
  },

  {
    path: 'not-found',
    loadComponent: () => import('./app/not-found/not-found.component').then(module => module.NotFoundComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./app/not-found/not-found.component').then(module => module.NotFoundComponent)
  },

];

export function tokenGetter() {
  return localStorage.getItem('token')
}

const config: SocketIoConfig = { url: 'https://localhost:3000', options: {} };

bootstrapApplication(AppComponent, {
  providers: [
    TokenInterceptorProvider,
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      SocketIoModule.forRoot(config),
    ),
    provideRouter(routes),
    provideNoopAnimations(),
  ]
})
  .catch(err => console.error(err));
