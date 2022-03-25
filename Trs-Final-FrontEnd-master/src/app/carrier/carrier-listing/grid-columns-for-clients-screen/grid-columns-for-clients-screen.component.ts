import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CarrierService } from '../../carrier.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-grid-columns-for-clients-screen',
  templateUrl: './grid-columns-for-clients-screen.component.html',
  styleUrls: ['./grid-columns-for-clients-screen.component.scss']
})
export class GridColumnsForClientsScreenComponent implements OnInit {

  constructor(public alertService:AlertService,@Inject(MAT_DIALOG_DATA) public grids: any,public carrierService:CarrierService,public fb:FormBuilder,public dialogRef: MatDialogRef<GridColumnsForClientsScreenComponent>) {
    this.createGridColumnGroup();
   }

  gridColumnForm: FormGroup

  createGridColumnGroup() {
    this.gridColumnForm = this.fb.group({
      companyLegalName : new FormControl(null),
      clientName : new FormControl(null),
      emailId : new FormControl(null),
      phone : new FormControl(null),
      address : new FormControl(null),
      city : new FormControl(null),
      state : new FormControl(null),
      country : new FormControl(null),
      package : new FormControl(null),
      terms : new FormControl(null),
    })
  }

  ngOnInit() {
    console.log(this.grids);
    this.gridColumnForm.controls['companyLegalName'].setValue(parseInt(this.grids[0].grid_columns.split('')[0]));
    this.gridColumnForm.controls['clientName'].setValue(parseInt(this.grids[0].grid_columns.split('')[1]));
    this.gridColumnForm.controls['emailId'].setValue(parseInt(this.grids[0].grid_columns.split('')[2]));
    this.gridColumnForm.controls['phone'].setValue(parseInt(this.grids[0].grid_columns.split('')[3]));
    this.gridColumnForm.controls['address'].setValue(parseInt(this.grids[0].grid_columns.split('')[4]));
    this.gridColumnForm.controls['city'].setValue(parseInt(this.grids[0].grid_columns.split('')[5]));
    this.gridColumnForm.controls['state'].setValue(parseInt(this.grids[0].grid_columns.split('')[6]));
    this.gridColumnForm.controls['country'].setValue(parseInt(this.grids[0].grid_columns.split('')[7]));
    this.gridColumnForm.controls['package'].setValue(parseInt(this.grids[0].grid_columns.split('')[8]));
    this.gridColumnForm.controls['terms'].setValue(parseInt(this.grids[0].grid_columns.split('')[9]));
  }

  close(): void {
    this.dialogRef.close();
  }

  saveGridColumns() {
    let finalObj = {};
    let sendObj = {};
    finalObj['companyLegalName'] = this.gridColumnForm.value.companyLegalName? '1' :'0';
    finalObj['clientName'] = this.gridColumnForm.value.clientName? '1' :'0';
    finalObj['emailId'] = this.gridColumnForm.value.emailId? '1' :'0';
    finalObj['phone'] = this.gridColumnForm.value.phone? '1' :'0';
    finalObj['address'] = this.gridColumnForm.value.address? '1' :'0';
    finalObj['city'] = this.gridColumnForm.value.city? '1' :'0';
    finalObj['state'] = this.gridColumnForm.value.state? '1' :'0';
    finalObj['country'] = this.gridColumnForm.value.country? '1' :'0';
    finalObj['package'] = this.gridColumnForm.value.package? '1' :'0';
    finalObj['terms'] = this.gridColumnForm.value.terms? '1' :'0';
    sendObj['grid_columns'] = finalObj['companyLegalName'] + finalObj['clientName'] + finalObj['emailId'] + finalObj['phone'] + finalObj['address'] + finalObj['city'] + finalObj['state'] + finalObj['country'] + finalObj['package'] + finalObj['terms'];
    console.log(sendObj);
    this.carrierService.updateGridColumnsForClientsScreen(sendObj).then(data => {
      if(data.success) {
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0)
      } 
    })
  }

}
