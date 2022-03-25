import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';

@Component({
  selector: 'app-adduser-dialog',
  templateUrl: './adduser-dialog.component.html',
  styleUrls: ['./adduser-dialog.component.scss']
})

export class AdduserDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public lead: any ,public dialogRef: MatDialogRef<AdduserDialogComponent>) { }
  addUserForm: FormGroup;

  ngOnInit() {
  }
  close(): void {
    this.dialogRef.close();
  }
}
