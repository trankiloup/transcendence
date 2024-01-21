import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {PvpMatchInterface} from "../interfaces/pvp-match-interface";
import {TournamentRank} from "../interfaces/tournament-rank";
import {GetLoginByUsername} from "../interfaces/getLoginByUsername";
import {rpsMatchInterface} from "../interfaces/rps-match-interface";
import {Observable, Subscription} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ScoreHistoryService {
  userObs:  Subscription= new Subscription();
  constructor( private http:HttpClient,private httpClient: HttpClient,) {
  }
  private user: GetLoginByUsername | undefined;
  setUser(user: GetLoginByUsername) {
    this.user = user;
  };

  getUser() {
    return this.user;
  }
  getUserByUserName(userName: string) {
    const url = "https://localhost:3000/user/byLogin/" + userName;
    this.userObs =  this.httpClient.get<GetLoginByUsername>(url).subscribe({
        next:(data:GetLoginByUsername)=>{this.setUser(data)},
        error:()=>{(console.error("Error getting user data:", this))}
      }
    );
    return this.httpClient.get<GetLoginByUsername>(url);
  }

  getAllPlayerMatchesPvp(playerLogin: string | null) {
    return this.http.get<PvpMatchInterface[]>(`https://localhost:3000/player-matches/pvp/${playerLogin}`);
  }

  getAllPlayerMatchesRps(playerLogin: string | null) {
    return this.http.get<rpsMatchInterface[]>(`https://localhost:3000/player-matches/rps/${playerLogin}`);
  }
  getAllPlayerMatchesTournament(playerLogin: string | null) {
    return this.http.get<TournamentRank[]>(`https://localhost:3000/player-matches/tournament/${playerLogin}`);
  }

  getAvatar(image: string | undefined) : Observable<Blob>
  {
    const url = "https://localhost:3000/user/profile-image/" + image
    return this.httpClient.get(url, {responseType: 'blob'})
  }
}
