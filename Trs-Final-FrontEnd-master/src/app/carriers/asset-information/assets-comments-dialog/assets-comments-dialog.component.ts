import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef ,MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CarriersService } from '../../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-assets-comments-dialog',
  templateUrl: './assets-comments-dialog.component.html',
  styleUrls: ['./assets-comments-dialog.component.scss']
})
export class AssetsCommentsDialogComponent implements OnInit {
  
  commentsForm:FormGroup;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  
  get comment() { return this.commentsForm.get('comment'); }
  
  createCommentsForm() {
    this.commentsForm = this.fb.group({
      comment : new FormControl('',[Validators.required , Validators.maxLength(500) , this.noWhiteSpaceValidator])
    })
  }
  constructor(public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<AssetsCommentsDialogComponent>,@Inject(MAT_DIALOG_DATA) public asset: any) {
    this.createCommentsForm();
  }
  
  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[4];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    if(this.asset) {
      this.commentsForm.controls['comment'].setValue(this.asset.comments);
    }
  }
  
  saveComment() {
    let finalObj = {};
    finalObj['asset_id'] = this.asset.asset_id;
    finalObj['comments'] = this.commentsForm.value.comment;
    
    this.carrierService.updateAssetComments(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Assets comments updated successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    });
  }
  
  close(): void {
    this.dialogRef.close();
  }
  
  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }
}
