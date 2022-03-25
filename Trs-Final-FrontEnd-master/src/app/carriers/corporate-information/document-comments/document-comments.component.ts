import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CarriersService } from '../../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-document-comments',
  templateUrl: './document-comments.component.html',
  styleUrls: ['./document-comments.component.scss']
})
export class DocumentCommentsComponent implements OnInit {

  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;

  constructor(public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<DocumentCommentsComponent>,@Inject(MAT_DIALOG_DATA) public driver: any) {
    this.createCommentsForm();
   }

  commentsForm:FormGroup;

  get comment() { return this.commentsForm.get('comment'); }

  createCommentsForm() {
    this.commentsForm = this.fb.group({
      comment : new FormControl('',[Validators.required , Validators.maxLength(300)])
    })
  }

  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[1];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    if(this.driver) {
      this.commentsForm.controls['comment'].setValue(this.driver.comments);
    }
    console.log(this.driver);
  }

  saveComments(){
    let finalObj = {};
    finalObj['document_id'] = this.driver.document_id;
    finalObj['comments'] = this.commentsForm.value.comment;
    finalObj['from'] = 1;
    this.carrierService.deleteCoroperateDoc(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Comment updated successfully",1);
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
