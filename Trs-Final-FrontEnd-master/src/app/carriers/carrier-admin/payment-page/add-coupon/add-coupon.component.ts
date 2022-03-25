import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-add-coupon',
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.scss']
})
export class AddCouponComponent implements OnInit {

  issue : boolean = false;

  close(): void {
    this.dialogRef.close('save');
  }

  constructor(public dialogRef: MatDialogRef<AddCouponComponent>,@Inject(MAT_DIALOG_DATA) public permission: any) { }

  ngOnInit() {
    console.log(this.permission);
    if(this.permission == 123456) {
      this.issue = true;
    }

  }

}
