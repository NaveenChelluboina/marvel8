import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef ,MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CarriersService } from '../../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';
@Component({
  selector: 'app-ifta-comments-dialog',
  templateUrl: './ifta-comments-dialog.component.html',
  styleUrls: ['./ifta-comments-dialog.component.scss']
})
export class IftaCommentsDialogComponent implements OnInit {

  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;

  constructor(public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<IftaCommentsDialogComponent>,@Inject(MAT_DIALOG_DATA) public comments: any) {
    this.createCommentsForm();
   }

  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[6];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    if(this.comments) {
      console.log(this.comments);
      this.commentsForm.controls['comment'].setValue(this.comments.comments);
    }
  }
  commentsForm:FormGroup;

  get comment() { return this.commentsForm.get('comment'); }

  createCommentsForm() {
    this.commentsForm = this.fb.group({
      comment : new FormControl('',[Validators.required , Validators.maxLength(200)])
    })
  }

  saveComment() {
    this.comments['comments'] = this.commentsForm.value.comment;
    this.carrierService.updateIftaYear(this.comments).then(data => {
      if(data.success) {
        this.alertService.createAlert("Comment added successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }

  close(): void {
    this.dialogRef.close();
  }
}
