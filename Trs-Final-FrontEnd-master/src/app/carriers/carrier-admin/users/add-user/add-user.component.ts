import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../../../../shared/services/alert.service';
import { FormControl,FormBuilder,FormGroup,Validators, Form } from '@angular/forms';
import { CarriersService } from '../../../carriers.service';
// import { AdminService } from '../../admin.service';
import { fbind } from 'q';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  carrierData : any;

  constructor(public dialogRef: MatDialogRef<AddUserComponent>,@Inject(MAT_DIALOG_DATA) public user: any, private alertService: AlertService, private fb:FormBuilder, private adminService:CarriersService) {
    this.createUserForm();
  }

  ngOnInit() {
    this.carrierData = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.usernameCtrl = this.fb.control('',[Validators.maxLength(30),Validators.required,this.noWhiteSpaceValidator]),
    this.getUserTypes();
    if(this.user) {
      this.addUserForm.controls['addUserName'].setValue(this.user.user_name);
      this.addUserForm.controls['addUserEmail'].setValue(this.user.user_email);
      this.addUserForm.controls['addUserEmail'].disable();
      this.addUserForm.controls['addUserNumber'].setValue(this.user.phone);
      /* this.addUserForm.controls['status'].setValue(this.user.is_active ? 'true': 'false'); */
      this.addUserForm.controls['userType'].setValue(this.user.trs_tbl_role.role_id);
    }
  }

  get addUserName() { return this.addUserForm.get('addUserName'); }

  get addUserEmail() { return this.addUserForm.get('addUserEmail'); }

  get userType() { return this.addUserForm.get('userType'); }

  get addUserNumber() { return this.addUserForm.get('addUserNumber'); }


  addUserForm:FormGroup;
  usernameCtrl: FormControl;
  /* status=[{"id":'true',"title":"Active"}, {"id":'false',"title":"Inactive"}]; */
  usertypes=[];

  close(): void {
    this.dialogRef.close();
  }

  createUserForm() {
    this.addUserForm=this.fb.group({
      addUserName: new FormControl('',[Validators.maxLength(30),Validators.required,this.noWhiteSpaceValidator]),
      addUserEmail:new FormControl('',[Validators.maxLength(100),Validators.required,Validators.email,this.noWhiteSpaceValidator]),
      addUserNumber:new FormControl('',[Validators.minLength(10),Validators.maxLength(12),Validators.required,this.noWhiteSpaceValidator]),
      /* status:new FormControl('', [Validators.required]), */
      userType:new FormControl('', [ Validators.required]),
      // addUserImage:new FormControl()
    });
  }

  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }

  omit_special_char(event) {
    var k;
    k=event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k > 47 && k < 58))
  }

  omit_special_number_char(event) {
    var k;
    k=event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || k ==46)
  }

  omit_non_number_char(event) {
    var k;
    k=event.charCode;
    return (k == 8 || k == 32 || (k > 47 && k < 58) || k == 101 || k == 116 || k == 120 || (k > 39 && k < 44) || k == 45 || k == 46);
  }

  getUserTypes() {
    let finalObj = {};
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id
    this.adminService.getRolesDropdown(finalObj)
    .then(data => {
      if(data.success) {
        this.usertypes = data.results;
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }    
    });
  }
  
  saveUser() {
    let temp = {};
    temp["user_name"] =  this.addUserForm.value.addUserName;
    temp["user_email"] = this.addUserForm.value.addUserEmail;
    temp["phone"] = this.addUserForm.value.addUserNumber;
    /* temp["is_active"] = this.addUserForm.value.status === "true" ? 1 : 0; */
    temp["role_id"] = this.addUserForm.value.userType;
    temp['user_type'] = sessionStorage.getItem('userType')=="carrier"?2:1;
    if(this.user) {
      temp['user_id'] = this.user.user_id;
      this.adminService.updateUser(temp).then(data => {
        if(data.success) {
          this.alertService.createAlert('User updated successfully',1);
          this.dialogRef.close('save');
        }
        else {
          this.alertService.createAlert(data.message,0);
        }
      })
    }
    // if(this.user) {
    //   let detail = {"userId": this.user.user_id, "updateFields" : temp }
    //   this.adminService.updateUser(detail)
    //   .then(data => {
    //     if(data.success) {
    //       this.alertService.createAlert("User updated successfully" , 1);
    //       this.dialogRef.close('save');
    //     }
    //     else {
    //       this.alertService.createAlert(data.message , 0);
    //     }
    //   });
    // } 
    // else {
     else {
       temp['carrier_id'] = this.carrierData;
      this.adminService.addUser(temp).then(data => {
        if(data.success) {
          this.alertService.createAlert('User saved successfully and Account activation link has been sent to the Email ID ' , 1);
          this.dialogRef.close('save');
        }
        else {
          this.alertService.createAlert(data.message , 0);
        }
      });
     }
    // }

  }

  allow_only_chars(event) {
    var k;
    k=event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 32 || k == 8);
  }

  allow_only_numbers(event) {
    var k;
    k=event.charCode;
    return ((k > 47 && k < 58) || k == 43 || k == 32 || k == 8);
  }
}
