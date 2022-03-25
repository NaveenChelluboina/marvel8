import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material';
import { AddPackageComponent } from '../../package/add-package/add-package.component';
import { CarriersService } from '../../../carriers/carriers.service';
import { CarrierService } from '../../carrier.service';

@Component({
  selector: 'app-update-package-dialog',
  templateUrl: './update-package-dialog.component.html',
  styleUrls: ['./update-package-dialog.component.scss']
})
export class UpdatePackageDialogComponent implements OnInit {

  public packages:any;
  public addPackageForm: FormGroup;

  constructor(public carrService:CarrierService,public carriersService:CarriersService,@Inject(MAT_DIALOG_DATA) public lead: any ,public alertService: AlertService, private _fb: FormBuilder,public dialogRef: MatDialogRef<UpdatePackageDialogComponent>,public fb: FormBuilder) {
    this.createForm();
   }

  ngOnInit() { 
    this.getPackagesDropdown({});
  }

  get packageLevel() { return this.addPackageForm.get('packageLevel'); }

  createForm() {
    this.addPackageForm = this.fb.group({
      packageLevel : new FormControl('' , [Validators.required]),
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  getPackagesDropdown(finalObj) {
    finalObj['packageId'] = this.lead.package_id;
    this.carriersService.getUpgradingPackages(finalObj).then(data => {
      if(data.success) {
        this.packages = data.results;
        console.log(this.packages);
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
  }

  saveCarrier() {
    let finalObj = {};
    finalObj['carrier_id'] = this.lead.carrier_id;
    finalObj['package_id'] = this.addPackageForm.value.packageLevel;
    this.carrService.updateClientInAdmin(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Package level updated successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }

}
