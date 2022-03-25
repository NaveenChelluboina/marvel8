import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../../../../shared/services/alert.service';
// import { AdminService } from '../../admin.service';
import { CarriersService } from '../../../carriers.service';

@Component({
  selector: 'app-add-asset-make',
  templateUrl: './add-asset-make.component.html',
  styleUrls: ['./add-asset-make.component.scss']
})
export class AddAssetMakeComponent implements OnInit {
  
  addPermissionForm:FormGroup;
  lookupOptions: any;
  
  constructor(public carrierService:CarriersService,public alertService: AlertService,public fb:FormBuilder,public dialogRef: MatDialogRef<AddAssetMakeComponent>,@Inject(MAT_DIALOG_DATA) public permission: any) {
    this.createPermissionForm();
  }
  
  ngOnInit() {
    if(this.permission){
      this.addPermissionForm.controls['permissionLevel'].setValue(this.permission.asset_make_name);
      this.addPermissionForm.controls['status'].setValue(this.permission.is_active);
      this.addPermissionForm.controls['asset_type'].setValue(this.permission.asset_type);
    }
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
  
  get asset_type() { return this.addPermissionForm.get('asset_type'); }
  
  createPermissionForm() {
    this.addPermissionForm = this.fb.group({
      permissionLevel : new FormControl('',[Validators.required,Validators.maxLength(50),this.noWhiteSpaceValidator]),
      status : new FormControl('',[Validators.required, Validators.maxLength(10)]),
      asset_type : new FormControl('',[Validators.required, Validators.maxLength(10)]),
    })
  }
  
  close(): void {
    this.dialogRef.close();
  }
  
  saveAttorney() {
    let finalObj = {}; 
    finalObj['asset_make_name'] = this.addPermissionForm.value.permissionLevel;
    finalObj['asset_type'] = this.addPermissionForm.value.asset_type;
    finalObj['is_active'] = this.addPermissionForm.value.status;
    if(this.permission) {
      finalObj['asset_make_id'] = this.permission.asset_make_id;
      this.carrierService.updateAssetMake(finalObj).then(data => {
        if(data.success) {
          this.alertService.createAlert('Asset Make updated successfully',1);
          this.dialogRef.close('save');
        }
        else {
          this.alertService.createAlert(data.message,0);
        }
      })
    }
  
   else {
    this.carrierService.addAssetMake(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert('Asset Make added successfully', 1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    });
   }
  }
  
  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }
  
}
