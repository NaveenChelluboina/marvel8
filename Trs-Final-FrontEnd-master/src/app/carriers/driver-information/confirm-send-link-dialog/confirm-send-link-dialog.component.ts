import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from '../../../shared/services/alert.service';


@Component({
  selector: 'app-confirm-send-link-dialog',
  templateUrl: './confirm-send-link-dialog.component.html',
  styleUrls: ['./confirm-send-link-dialog.component.scss']
})
export class ConfirmSendLinkDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmSendLinkDialogComponent>,
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
