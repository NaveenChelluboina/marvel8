import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-upload-docs-dialog',
  templateUrl: './upload-docs-dialog.component.html',
  styleUrls: ['./upload-docs-dialog.component.scss']
})
export class UploadDocsDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<UploadDocsDialogComponent>) { }

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }
}
