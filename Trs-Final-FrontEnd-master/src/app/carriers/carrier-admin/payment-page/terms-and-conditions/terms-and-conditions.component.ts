import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {

  constructor(public dialogRef:MatDialogRef<TermsAndConditionsComponent>) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  download() {
    window.open("https://permishare.s3.us-east-2.amazonaws.com/pdf-image/PermiShare+Terms+of+Use.pdf");
  }

}
