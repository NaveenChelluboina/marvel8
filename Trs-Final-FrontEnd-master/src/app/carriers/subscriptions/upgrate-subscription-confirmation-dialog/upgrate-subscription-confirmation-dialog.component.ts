import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-upgrate-subscription-confirmation-dialog',
  templateUrl: './upgrate-subscription-confirmation-dialog.component.html',
  styleUrls: ['./upgrate-subscription-confirmation-dialog.component.scss']
})
export class UpgrateSubscriptionConfirmationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UpgrateSubscriptionConfirmationDialogComponent>,
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
