import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../../../../shared/services/alert.service';
import { AdminService } from '../../../../admin/admin.service';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MustMatch } from '../../../../shared/must-match.validator';
import { CarriersService } from '../../../../carriers/carriers.service';

@Component({
  selector: 'app-password-dialog',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.scss'],
  providers: [AlertService]
})
export class PasswordDialogComponent implements OnInit {
  changePasswordForm: FormGroup;
  isOneLetter = false;
  isOneCapitalLetter = false;
  isOneNumber = false;
  isOneSpecialCaharacter = false;
  isMinLength = false;
  isValidate = false;
  currentUser : any;
  checkingPassword = false;
  constructor(private carrierService : CarriersService,public dialogRef: MatDialogRef<PasswordDialogComponent>,@Inject(MAT_DIALOG_DATA) public user: number, private fb: FormBuilder, private alertService: AlertService) { 
    this.createPasswordForm();
   }

   get userNewPassword() { return this.changePasswordForm.get('userNewPassword');};
   get userNewReenterPassword() { return this.changePasswordForm.get('userNewReenterPassword');};

  ngOnInit() {
    this.currentUser = JSON.parse(sessionStorage.getItem('trs_user_info'));
    this.changePasswordForm.controls['userEmail'].setValue(this.currentUser.email);
    this.changePasswordForm.controls['userEmail'].disable();
  }

  get userCurrentPassword() { return this.changePasswordForm.get('userCurrentPassword')}

  onKeyPress(e) {
    var pswd = e.value;
    //validate the length
    if (pswd.length < 8) {
      this.isMinLength = false;
    } else {
      this.isMinLength = true;
    }

    //validate letter
    if (pswd.match(/[A-z]/)) {
      if (pswd != '_') {
        this.isOneLetter = true;
      } else {
        this.isOneLetter = false;
      }
    } else {
      this.isOneLetter = false;
    }

    //validate uppercase letter
    if (pswd.match(/[A-Z]/)) {
      this.isOneCapitalLetter = true;
    } else {
      this.isOneCapitalLetter = false;
    }

    //validate special character
    if (pswd.match(/[!@#\$%\^&\_\+\<\>\.\,\=\:\;\'\?\(\)\[\]\\\/\|\*{}-]/)) {
      this.isOneSpecialCaharacter = true;
    } else {
      this.isOneSpecialCaharacter = false;
    }

    //validate number
    if (pswd.match(/\d/)) {
      this.isOneNumber = true;
    } else {
      this.isOneNumber = false;
    }

  }

  onKeyPressed(f) {
    var pswd = f.value;
    const password = this.userNewReenterPassword;
    if (pswd !== password) {
      this.checkingPassword = true;
    } else {
      this.checkingPassword = false;
    }
  }
  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }


  createPasswordForm() {
    this.changePasswordForm = this.fb.group({
      userEmail: new FormControl('', [Validators.required, Validators.maxLength(30), this.noWhiteSpaceValidator]),
      userCurrentPassword: new FormControl('', [Validators.required, Validators.maxLength(30),this.noWhiteSpaceValidator]),
      userNewPassword: new FormControl('', [Validators.required, Validators.maxLength(30),this.noWhiteSpaceValidator]),
      userNewReenterPassword: new FormControl('', [Validators.required, Validators.maxLength(30),this.noWhiteSpaceValidator]),
    },{
      validator: MustMatch('userNewPassword','userNewReenterPassword')
    })
  }

  close(): void {
    this.dialogRef.close();
  }

  updatePassword(formData) {
    let temp = {};
    temp['email'] = this.currentUser.email;
    temp['old_password'] = formData.userCurrentPassword;
    temp['new_password'] = formData.userNewPassword;
    this.carrierService.changePassword(temp).then(data => {
      if(data.success) {
          this.alertService.createAlert("Password updated Successfully" , 1);
          this.dialogRef.close('save');
      }
      else {
          this.alertService.createAlert(data.message , 0);
      }
    });
  }

}
