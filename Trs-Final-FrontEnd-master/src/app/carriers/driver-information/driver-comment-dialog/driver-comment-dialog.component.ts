import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef ,MAT_DIALOG_DATA} from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CarriersService } from '../../carriers.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-driver-comment-dialog',
  templateUrl: './driver-comment-dialog.component.html',
  styleUrls: ['./driver-comment-dialog.component.scss']
})
export class DriverCommentDialogComponent implements OnInit {

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

  constructor(public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<DriverCommentDialogComponent>,@Inject(MAT_DIALOG_DATA) public driver: any) {
    this.createCommentsForm();
   }

  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[2];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    if(this.driver) {
      this.commentsForm.controls['comment'].setValue(this.driver.comments);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  saveComment() { 
    let finalObj = {};
    finalObj['driver_id'] = this.driver.driver_id;
    finalObj['comments'] = this.commentsForm.value.comment;
    this.carrierService.updateDriverComments(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Driver comments updated successfully",1);
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
