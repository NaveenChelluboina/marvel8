import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CarriersService } from '../../carriers.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-grid-columns-for-driver',
  templateUrl: './grid-columns-for-driver.component.html',
  styleUrls: ['./grid-columns-for-driver.component.scss']
})
export class GridColumnsForDriverComponent implements OnInit {

  constructor(public alertService:AlertService,@Inject(MAT_DIALOG_DATA) public grids: any,public carrierService:CarriersService,public fb:FormBuilder,public dialogRef: MatDialogRef<GridColumnsForDriverComponent>) {
    this.createGridColumnGroup();
   }

  gridColumnForm: FormGroup

  createGridColumnGroup() {
    this.gridColumnForm = this.fb.group({
      driverLastName : new FormControl(null),
      driverFirstName : new FormControl(null),
      cellPhone : new FormControl(null),
      emailId : new FormControl(null),
      dlNumber : new FormControl(null),
      dlClass : new FormControl(null),
      address : new FormControl(null),
      city : new FormControl(null),
      state : new FormControl(null),
      country : new FormControl(null),
      documents : new FormControl(null),
      zip : new FormControl(null)
    })
  }

  // get driverLastName() { return this.gridColumnForm.get('driverLastName'); }

  // get driverFirstName() { return this.gridColumnForm.get('driverFirstName'); }

  // get cellPhone() { return this.gridColumnForm.get('cellPhone'); }

  // get emailId() { return this.gridColumnForm.get('emailId'); }

  // get dlNumber() { return this.gridColumnForm.get('dlNumber'); }

  // get dlClass() { return this.gridColumnForm.get('dlClass'); }

  // get address() { return this.gridColumnForm.get('address'); }

  // get city() { return this.gridColumnForm.get('city'); }

  // get state() { return this.gridColumnForm.get('state'); }

  // get country() { return this.gridColumnForm.get('country'); }

  // get documents() { return this.gridColumnForm.get('documents'); }

  ngOnInit() {
    console.log(this.grids);
    this.gridColumnForm.controls['driverLastName'].setValue(parseInt(this.grids[0].grid_columns.split('')[0]));
    this.gridColumnForm.controls['driverFirstName'].setValue(parseInt(this.grids[0].grid_columns.split('')[1]));
    this.gridColumnForm.controls['cellPhone'].setValue(parseInt(this.grids[0].grid_columns.split('')[2]));
    this.gridColumnForm.controls['emailId'].setValue(parseInt(this.grids[0].grid_columns.split('')[3]));
    this.gridColumnForm.controls['dlNumber'].setValue(parseInt(this.grids[0].grid_columns.split('')[4]));
    this.gridColumnForm.controls['dlClass'].setValue(parseInt(this.grids[0].grid_columns.split('')[5]));
    this.gridColumnForm.controls['address'].setValue(parseInt(this.grids[0].grid_columns.split('')[6]));
    this.gridColumnForm.controls['city'].setValue(parseInt(this.grids[0].grid_columns.split('')[7]));
    this.gridColumnForm.controls['state'].setValue(parseInt(this.grids[0].grid_columns.split('')[8]));
    this.gridColumnForm.controls['country'].setValue(parseInt(this.grids[0].grid_columns.split('')[9]));
    this.gridColumnForm.controls['documents'].setValue(parseInt(this.grids[0].grid_columns.split('')[10]));
    this.gridColumnForm.controls['zip'].setValue(parseInt(this.grids[0].grid_columns.split('')[11]));
  }

  close(): void {
    this.dialogRef.close();
  }

  saveGridColumns() {
    let finalObj = {};
    let sendObj = {};
    finalObj['driverLastName'] = this.gridColumnForm.value.driverLastName? '1' :'0';
    finalObj['driverFirstName'] = this.gridColumnForm.value.driverFirstName? '1' :'0';
    finalObj['cellPhone'] = this.gridColumnForm.value.cellPhone? '1' :'0';
    finalObj['emailId'] = this.gridColumnForm.value.emailId? '1' :'0';
    finalObj['dlNumber'] = this.gridColumnForm.value.dlNumber? '1' :'0';
    finalObj['dlClass'] = this.gridColumnForm.value.dlClass? '1' :'0';
    finalObj['address'] = this.gridColumnForm.value.address? '1' :'0';
    finalObj['zip'] = this.gridColumnForm.value.zip? '1' :'0';
    finalObj['city'] = this.gridColumnForm.value.city? '1' :'0';
    finalObj['state'] = this.gridColumnForm.value.state? '1' :'0';
    finalObj['country'] = this.gridColumnForm.value.country? '1' :'0';
    finalObj['documents'] = this.gridColumnForm.value.documents? '1' :'0';
    sendObj['grid_columns'] = finalObj['driverLastName'] + finalObj['driverFirstName'] + finalObj['cellPhone'] + finalObj['emailId'] + finalObj['dlNumber'] + finalObj['dlClass'] + finalObj['address'] + finalObj['city'] + finalObj['state'] + finalObj['country'] + finalObj['documents'] + finalObj['zip'];
    console.log(sendObj);
    sendObj['carrier_id'] = this.grids[0].carrier_id;
    this.carrierService.updateGridColumnsInDrivers(sendObj).then(data => {
      if(data.success) {
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0)
      } 
    })
  }

}
