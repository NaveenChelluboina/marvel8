import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../../../shared/services/alert.service';
import { FormControl, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { AdminService } from '../../admin.service';
import { fbind } from 'q';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
  providers: [AlertService]
})
export class UserDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UserDialogComponent>, @Inject(MAT_DIALOG_DATA) public user: any, private alertService: AlertService, private fb: FormBuilder, private adminService: AdminService) {
    this.createUserForm();
  }

  ngOnInit() {
    this.usernameCtrl = this.fb.control('', [Validators.maxLength(30), Validators.required, this.noWhiteSpaceValidator]),
      this.getUserTypes();
    if (this.user) {
      this.addUserForm.controls['addUserName'].setValue(this.user.name);
      this.addUserForm.controls['addUserEmail'].setValue(this.user.email);
      this.addUserForm.controls['addUserEmail'].disable();
      this.addUserForm.controls['addUserNumber'].setValue(this.user.phone);
      /* this.addUserForm.controls['status'].setValue(this.user.is_active ? 'true': 'false'); */
      this.addUserForm.controls['userType'].setValue(this.user.role_id);
    }
  }
  get addUserName() { return this.addUserForm.get('addUserName'); }

  get addUserEmail() { return this.addUserForm.get('addUserEmail'); }

  get userType() { return this.addUserForm.get('userType'); }

  get addUserNumber() { return this.addUserForm.get('addUserNumber'); }


  addUserForm: FormGroup;
  usernameCtrl: FormControl;
  /* status=[{"id":'true',"title":"Active"}, {"id":'false',"title":"Inactive"}]; */
  usertypes = [];

  close(): void {
    this.dialogRef.close();
  }

  createUserForm() {
    this.addUserForm = this.fb.group({
      addUserName: new FormControl('', [Validators.maxLength(50), Validators.required, this.noWhiteSpaceValidator]),
      addUserEmail: new FormControl('', [Validators.maxLength(100), Validators.required, Validators.email, this.noWhiteSpaceValidator]),
      addUserNumber: new FormControl('', [Validators.minLength(10), Validators.maxLength(15),
      Validators.required, Validators.pattern(/^[0-9!@#$&()`.+,/"-]*$/)]),
      /* status:new FormControl('', [Validators.required]), */
      userType: new FormControl('', [Validators.required]),
      // addUserImage:new FormControl()
    });
  }

  noWhiteSpaceValidator(control: FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid = !isWhiteSpace;
    return isValid ? null : { 'whitespace': true };
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k > 47 && k < 58))
  }

  omit_special_number_char(event) {
    var k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || k == 46)
  }

  omit_non_number_char(event) {
    var k;
    k = event.charCode;
    return (k == 8 || k == 32 || (k > 47 && k < 58) || k == 101 || k == 116 || k == 120 || (k > 39 && k < 44) || k == 45 || k == 46);
  }

  getUserTypes() {
    this.adminService.getLookups({ 'code_master_id': 1 })
      .then(data => {
        if (data.success) {
          this.usertypes = data.results;
        }
        else {
          this.alertService.createAlert(data.message, 0);
        }
      });
  }

  saveUser() {
    let temp = {};
    temp["name"] = this.addUserForm.value.addUserName;
    temp["email"] = this.addUserForm.value.addUserEmail;
    temp["phone"] = this.addUserForm.value.addUserNumber;
    /* temp["is_active"] = this.addUserForm.value.status === "true" ? 1 : 0; */
    temp["role_id"] = this.addUserForm.value.userType;
    if (this.user) {
      let detail = { "userId": this.user.user_id, "updateFields": temp }
      this.adminService.updateUser(detail)
        .then(data => {
          if (data.success) {
            this.alertService.createAlert("User updated successfully", 1);
            this.dialogRef.close('save');
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        });
    } else {
      this.adminService.addUser(temp)
        .then(data => {
          if (data.success) {
            this.alertService.createAlert('User saved successfully', 1);
            this.dialogRef.close('save');
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        });
    }

  }


}
