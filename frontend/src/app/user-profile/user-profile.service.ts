import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError , of, tap} from 'rxjs';
import { getMeProfile } from '../interfaces/getMeProfile.interface';
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {


  constructor(private httpClient:HttpClient){}




    getMeProfile():Observable<any>{
      const url= "https://localhost:3000/user/me/profile"
      return this.httpClient.get(url)
    }

    updateUsername(username : string): Observable<any>{
      const url= "https://localhost:3000/user/me/update-username"
      return this.httpClient.put(url, {username: username})
    }

    updateAvatar(avatar : string){
      const url= "https://localhost:3000/user/me/update-avatar"
      return this.httpClient.put(url, {avatar: avatar})
    }

    uploadFile(image : FormData) : Observable<any>
    {
      const url= "https://localhost:3000/user/upload-avatar"
      return this.httpClient.post(url, image)
    }

    getAvatar(image : string) : Observable<Blob>
    {
      const url = "https://localhost:3000/user/profile-image/" + image
      return this.httpClient.get(url, {responseType: 'blob'})
    }

}
