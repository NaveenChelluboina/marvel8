import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LoginService } from '../../../logins/login.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Router } from '@angular/router';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';
import { PasswordDialogComponent } from './password-dialog/password-dialog.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserMenuComponent implements OnInit {

  public userImage = '../assets/img/profile_pic.png';
  name: any;
  public userData: any;
  public hasPermissions: boolean;
  public d: any;
  designation: any;
  userType = sessionStorage.getItem('userType');

  constructor(private dialogRef: MatDialog, private changeDetectorRefs: ChangeDetectorRef, public dialog: MatDialog, public router: Router, public loginService: LoginService, public alertService: AlertService) { }

  public logoutUser() {
    this.loginService.logOut().then(res => {
      if (res.success) {
        this.dialog.closeAll();
        localStorage.removeItem('trs_user_info');
        localStorage.removeItem('shadowlogin');
        localStorage.removeItem('settings');
        localStorage.removeItem('userType');
        localStorage.removeItem('checkForAdminCreation');
        
        sessionStorage.removeItem('trs_user_info');
        sessionStorage.removeItem('settings');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('CurrentYear');
        sessionStorage.removeItem('checkForAdminCreation');
        sessionStorage.clear();
        this.router.navigate(['/login']);
        this.alertService.createAlert(res.message, 1);
      }
      else {
        this.alertService.createAlert(res.message, 0);
      }
    }).catch(e => {
      console.log(e);
    });
    // this.router.navigate(['/login']);
  }

  openProfileDialog() {
    let dialogRef = this.dialog.open(ProfileDialogComponent, {
      data: null,
      height: 'auto',
      width: '600px',
      autoFocus: false,
      panelClass: 'my-dialog'
    });

    dialogRef.afterClosed().subscribe(prospects => {

    });
  }
  openPasswordDialog() {
    let dialogRef = this.dialog.open(PasswordDialogComponent, {
      data: null,
      height: 'auto',
      width: '600px',
      autoFocus: false,
      panelClass: 'my-dialog'

    });

    dialogRef.afterClosed().subscribe(prospects => {

    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    var currentUser = JSON.parse(sessionStorage.getItem('trs_user_info'));
    this.userData = currentUser;
    for (let i = 0; i < this.userData.user_permissions.length; i++) {
      if (this.userData.user_permissions[i].right_master_id == 19) {
        this.d = this.userData.user_permissions[i].permission_type;
      }
    }
    console.log(this.d);
    if (parseInt(this.d.split('')[1]))
      this.hasPermissions = true;
    else
      this.hasPermissions = false;
    console.log(this.hasPermissions);
  }

}
