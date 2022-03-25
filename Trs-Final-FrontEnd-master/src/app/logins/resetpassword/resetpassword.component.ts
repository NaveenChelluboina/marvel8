import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { LoginService } from '../login.service'
import { AlertService } from '../../shared/services/alert.service';
import { MustMatch } from '../../shared/must-match.validator';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss'],
  providers: [LoginService, AlertService],
})
export class ResetpasswordComponent implements OnInit {
  public form:FormGroup;
  today = Date.now();
  userId: string;
  resToken: string;
  timeStamp: string;
  isOneLetter = false;
  isOneCapitalLetter = false;
  isOneNumber = false;
  isOneSpecialCaharacter = false;
  isMinLength = false;
  isValidate = false;
  private _submitted: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, public fb: FormBuilder, public router:Router, public loginService: LoginService, public alertService: AlertService) {
    this.createForm();
    this.activatedRoute.queryParams.subscribe(params => {
      this.userId = params.uid;
      this.resToken = params.resetToken;
      this.timeStamp = params.tC;
    });
  }
  get password() { return this.form.get('password'); };
  get confirmPassword() { return this.form.get('confirmPassword'); };

  createForm() {
    this.form = this.fb.group({
      password: new FormControl('', [Validators.minLength(8), Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    },{
      validator: MustMatch('password','confirmPassword')
    });
  }

  ngOnInit() {
    this.loginService.urlResetPasswordCheck(this.userId, this.resToken, this.timeStamp).then(res => {
      if (!res.success) {
        this.alertService.createAlert(res.message, 0);
        this.router.navigate(['/login']);
      } else {
      }
    });
  }

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


  public onSubmit(values:any):void {
    if (this.form.valid) {
      if(values['password'] === values['confirmPassword']) {
        this.loginService.resetPassword(values.password, this.userId, this.resToken).then(res => {
          if (res.success) {
            this.alertService.createAlert('Password has been sucessfully reset. Please login again', 1);
            this.router.navigate(['/login']);
          } else {
            this.alertService.createAlert(res.message, 0);
          }
        });
      } else {
      }
    }
  }

}
