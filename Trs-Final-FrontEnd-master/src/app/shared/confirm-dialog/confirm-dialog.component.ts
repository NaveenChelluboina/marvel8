import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  providers: [AlertService]
})
export class ConfirmDialogComponent implements OnInit {
  
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }
  
  ngOnInit() {
    
  }

  close() {
    this.dialogRef.close();
  }
  
  saveInfo() {
    this.dialogRef.close(this.data);
  }
}
