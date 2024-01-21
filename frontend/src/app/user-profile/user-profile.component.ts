import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { UserProfileService } from './user-profile.service';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router} from '@angular/router';
import { getMeProfile } from '../interfaces/getMeProfile.interface';
import { updateUserProfile } from '../interfaces/updateUserProfile.interface';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserSocketService } from '../sockets/user-list-socket/user-socket.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, MatSnackBarModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css','../app.component.css'],
  providers: [UserSocketService]
})

export class UserProfileComponent implements OnInit{

  constructor(
    private userProfileService : UserProfileService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private sanitizer : DomSanitizer

  ){}

    userMe! : getMeProfile

  //form for name validation
  usernameForm!: FormGroup;

  //curent values
  currentUsername = "default"
  userAvatarUrl = 'default-avartar.png'
  // userAvatar ="/assets/default-avatar.png"
  userAvatar : any

  fileImage! : File

  //new values from form before validation
  username = ""

  //boolean to display error messages or apply button
  usernameError = false
  avatarApplyButton = false

  //error message
  usernameErrorMessage = "Username between 2 and 25 characters. No space. No consecutive -_."

  formData : FormData = new FormData()

  file! : File


  ngOnInit(): void {

    this.usernameForm = new FormGroup({
      username : new FormControl(null, Validators.compose([
          Validators.minLength(2),
          Validators.maxLength(15),
          Validators.pattern("^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9])*")
        ])),
    })
    this.getMeProfile();
   }

  getMeProfile()
  {
    this.userProfileService.getMeProfile().subscribe({
      next:(data :getMeProfile) => {
        this.currentUsername = data.username
        this.userAvatarUrl = data.avatarUrl
        // console.log("In profile AvatarUrl: " + this.userAvatarUrl)
        // console.log("In profile Avatar: " + this.userAvatar)
      },
      complete : () => this.displayAvatarImage(),
      error: () => console.log('Error')
    })
  }

  displayAvatarImage()
  {
    this.userProfileService.getAvatar(this.userAvatarUrl).subscribe({
    next :(data) => {
      let objectUrl = URL.createObjectURL(data);
      this.userAvatar = this.sanitizer.bypassSecurityTrustUrl(objectUrl)

    },
   })

  }

  displayAvatarSnackbar(error : string)
  {
    this._snackBar.open(error, '', { duration: 3000 });
  }

  onUploadImage(event : any)
  {
    try {
      const file : File= event.target.files[0]
      const fileSize = file.size
      if (fileSize > 5000000)
      {
        this.displayAvatarSnackbar('File size to big. Must be under 5Mo')
        return
      }
      let fileType = file.type
      if(fileType.match(/image\/*/))
      {
        this.file = file
        let reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.onload = (event : any) => {
          this.userAvatar = event.target.result
        }
        this.formData = new FormData()
        this.formData.append('file', this.file)
      }
      else
        this.displayAvatarSnackbar('Wrong image format')
    }
    catch (error)
      {
        this.displayAvatarSnackbar('Wrong image format')
      }
  }

  applyNewAvatar()
  {
    if (this.formData && this.file)
    {
      this.userProfileService.uploadFile(this.formData).subscribe({
        complete : () => this.displayAvatarSnackbar("Image uploaded")
      })
    }
  }

  onSubmitUsername()
{
  this.usernameError = false
  if (this.usernameForm.status != 'VALID')
  {

    this.usernameErrorMessage="Invalid username format"
    this.usernameError = true
    return

  }
    this.userProfileService.updateUsername(this.usernameForm.value.username).subscribe({
    next :(data : updateUserProfile) =>{
      if (data.username === null)
      {
        this.usernameErrorMessage="Username not available",
        this.usernameError = true
      }
      else
      {
        this.currentUsername = this.usernameForm.value.username
        this._snackBar.open('Username updated', '', { duration: 2000 });
      }
    },
    error :(error) => console.log(error)
})
}

back(){
    history.go(-1)
}

}
