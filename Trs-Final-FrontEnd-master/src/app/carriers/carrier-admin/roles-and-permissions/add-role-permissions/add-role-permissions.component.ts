import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../../../../shared/services/alert.service';
// import { AdminService } from '../../admin.service';
import { CarriersService } from '../../../carriers.service';

@Component({
  selector: 'app-add-role-permissions',
  templateUrl: './add-role-permissions.component.html',
  styleUrls: ['./add-role-permissions.component.scss']
})
export class AddRolePermissionsComponent implements OnInit {

  addPermissionForm:FormGroup;
  lookupOptions: any;

  constructor(public carrierService:CarriersService,public alertService: AlertService,public fb:FormBuilder,public dialogRef: MatDialogRef<AddRolePermissionsComponent>,@Inject(MAT_DIALOG_DATA) public permission: any) {
    this.createPermissionForm();
   }

  ngOnInit() {
    // this.getLookupsDropdown();
  }

  // public getLookupsDropdown() {
  //   this.adminService.getLookupsDropdown().then(data => {
  //     if(data.success) {
  //       this.lookupOptions = data.results;
  //     }
  //   })
  // }

  get permissionLevel() { return this.addPermissionForm.get('permissionLevel'); }

  get status() { return this.addPermissionForm.get('status'); }

  createPermissionForm() {
    this.addPermissionForm = this.fb.group({
      permissionLevel : new FormControl('',[Validators.required,Validators.maxLength(50),this.noWhiteSpaceValidator]),
      status : new FormControl('',[Validators.required, Validators.maxLength(10)]),
    })
  }

  close(): void {
    this.dialogRef.close();
  }

  saveAttorney() {
    let finalObj = {};
    finalObj['role_name'] = this.addPermissionForm.value.permissionLevel;
    finalObj['is_active'] = this.addPermissionForm.value.status;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.addRole(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert('Permision level added successfully', 1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    });
  }

  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }

}
