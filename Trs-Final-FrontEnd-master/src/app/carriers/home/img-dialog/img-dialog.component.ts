import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-img-dialog',
  templateUrl: './img-dialog.component.html',
  styleUrls: ['./img-dialog.component.scss']
})
export class ImgDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<ImgDialogComponent>) {

  }

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }

}
