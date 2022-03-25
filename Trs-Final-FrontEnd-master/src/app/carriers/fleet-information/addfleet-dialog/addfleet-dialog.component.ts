import { Component, OnInit,Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, Validators, Form } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../../carriers.service';

@Component({
  selector: 'app-addfleet-dialog',
  templateUrl: './addfleet-dialog.component.html',
  styleUrls: ['./addfleet-dialog.component.scss']
})
export class AddfleetDialogComponent implements OnInit {

  constructor( public carrierService:CarriersService, public alertService: AlertService,public fb:FormBuilder,@Inject(MAT_DIALOG_DATA) public fleetData: any ,public dialogRef: MatDialogRef<AddfleetDialogComponent>) {
    this.createAddFleet();
   }

  addFleetForm: FormGroup;
  radioDisable:boolean = false;

  ngOnInit() {
    if(this.fleetData){
      this.addFleetForm.controls['fleetName'].setValue(this.fleetData.fleet_name);
      this.addFleetForm.controls['comments'].setValue(this.fleetData.comments);
      this.addFleetForm.controls['isIrp'].setValue(this.fleetData.is_irp ? 'true' : 'false');
      this.addFleetForm.controls['isActive'].setValue(this.fleetData.is_active ? 'true' : 'false');
      if(this.fleetData.is_delete == true){
         this.radioDisable = true;
      } else {
        this.radioDisable = false;
      }
    }
    console.log(this.radioDisable)
  }

  get fleetName() { return this.addFleetForm.get('fleetName'); }
  get comments() { return this.addFleetForm.get('comments'); }
  get isIrp() { return this.addFleetForm.get('isIrp'); }
  get isActive() { return this.addFleetForm.get('isActive'); }

  createAddFleet() {
    this.addFleetForm = this.fb.group({
      fleetName : new FormControl('' , [Validators.maxLength(25) , Validators.required ]),
      comments : new FormControl('' , [Validators.maxLength(300)]),
      isIrp: new FormControl('',[Validators.required ]),
      isActive: new FormControl('',[Validators.required ])
    });
  }

  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }

  saveFleet(){
   let temp = {};
    temp['fleet_name'] = this.addFleetForm.value.fleetName;
    temp['comments'] = this.addFleetForm.value.comments;
    temp["is_irp"] = this.addFleetForm.value.isIrp == 'true' ? 1 : 0;
    temp["is_active"] = this.addFleetForm.value.isActive == 'true' ? 1 : 0;
    temp['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    if(this.fleetData){
      temp['fleet_id'] = this.fleetData.fleet_id;
      this.carrierService.updateFleet(temp).then(data => {
        if (data.success) {
          this.alertService.createAlert("Fleet updated successfully", 1);
          this.dialogRef.close('save');
        }
        else {
          this.alertService.createAlert(data.message, 0);
        }
      })
    }
    else {
      
      this.carrierService.addFleet(temp).then(data => {
        if (data.success) {
          this.alertService.createAlert("Fleet added successfully", 1);
          this.dialogRef.close('save');
        }
        else {
          this.alertService.createAlert(data.message, 0);
        }
      })
    }
  }
  close(): void {
    this.dialogRef.close();
  }

}
