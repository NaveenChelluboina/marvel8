import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit {

  public dateTime1: Date;
  updateProfileForm: FormGroup;
  userId: String;

  constructor(public dialogRef: MatDialogRef<ProfileDialogComponent>) { }

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }
  selectOption(id: string) {
    sessionStorage.setItem('country',id);
  }
}
