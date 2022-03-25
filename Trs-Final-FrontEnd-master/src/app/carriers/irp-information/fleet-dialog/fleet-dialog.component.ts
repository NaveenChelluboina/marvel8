import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CarriersService } from '../../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-fleet-dialog',
  templateUrl: './fleet-dialog.component.html',
  styleUrls: ['./fleet-dialog.component.scss']
})

export class FleetDialogComponent implements OnInit {

  addWeightGroupForm: FormGroup;
  weightGroupArray: FormArray;
  fleets: any[] = [];

  constructor(public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<FleetDialogComponent>,public fb:FormBuilder,@Inject(MAT_DIALOG_DATA) public fleet: any) {
    this.createaddWeightGroupForm()
   }

  ngOnInit() {
    this.addItem();
    this.getFleetDropDown();
   if(this.fleet){
    this.addWeightGroupForm.controls['fleetName'].setValue(this.fleet.fleet_id);
   }
  }

  get fleetName() { return this.addWeightGroupForm.get('fleetName'); }
  get weight() { return this.addWeightGroupForm.get('weight'); }
  get axles() { return this.addWeightGroupForm.get('axles'); }

  createaddWeightGroupForm() {
    this.addWeightGroupForm = this.fb.group({
      fleetName : new FormControl('' , [Validators.required]),
      weightGroupArray : new FormArray([]),
    })
  }

  createItem(weight, axles): FormGroup {
    return this.fb.group({
      weight: [weight ,[Validators.required,Validators.maxLength(30), this.noWhiteSpaceValidator]],
      axles: [axles, [Validators.required,Validators.maxLength(30),this.noWhiteSpaceValidator]],
    });
  }

  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }

  addItem(): void {
    this.weightGroupArray = this.addWeightGroupForm.get('weightGroupArray') as FormArray;
    this.weightGroupArray.push(this.createItem(null, null));
  }
  
  removeItem(index) {
    this.weightGroupArray.removeAt(index);
  }

  getFleetDropDown() {
    let filters = {};
    filters['is_irp'] = 1;
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getFleetDropDown(filters).then(data => {
      if (data.success) {
        this.fleets = data.results;
      }
    })
  }

  onlyNumbers(event) {
    var k;
    k = event.charCode;
    return ((k > 47 && k < 58));
  }

  saveFleet(){
    let finalObj = {};
    finalObj['fleet_id'] = this.addWeightGroupForm.value.fleetName,
    finalObj['weight_group'] = this.addWeightGroupForm.value.weightGroupArray;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.addIrpWeightGroup(finalObj).then(data => {
      if (data.success) {
        this.alertService.createAlert("Weight group added successfully", 1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }


  close(): void {
    this.dialogRef.close();
  }
}
