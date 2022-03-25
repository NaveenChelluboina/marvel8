import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CarriersService } from '../../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-fleet-comments',
  templateUrl: './fleet-comments.component.html',
  styleUrls: ['./fleet-comments.component.scss']
})
export class FleetCommentsComponent implements OnInit {

  commentsForm:FormGroup;

  get comment() { return this.commentsForm.get('comment'); }

  createCommentsForm() {
    this.commentsForm = this.fb.group({
      comment : new FormControl('',[Validators.required , Validators.maxLength(500) , this.noWhiteSpaceValidator])
    })
  }
  constructor(public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<FleetCommentsComponent>,@Inject(MAT_DIALOG_DATA) public fleet: any) { 
    this.createCommentsForm();
  }

  ngOnInit() {
    if(this.fleet) {
      this.commentsForm.controls['comment'].setValue(this.fleet.comments);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  saveComment() {
    let finalObj = {};
    finalObj['fleet_id'] = this.fleet.fleet_id;
    finalObj['comments'] = this.commentsForm.value.comment;
    this.carrierService.updateFleet(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Fleet comments updated successfully",1);
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
