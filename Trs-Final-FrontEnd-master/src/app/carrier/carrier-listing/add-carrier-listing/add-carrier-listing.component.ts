import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material';
import { AddPackageComponent } from '../../package/add-package/add-package.component';
import { CarriersService } from '../../../carriers/carriers.service';
import { CarrierService } from '../../carrier.service';

@Component({
  selector: 'app-add-carrier-listing',
  templateUrl: './add-carrier-listing.component.html',
  styleUrls: ['./add-carrier-listing.component.scss']
})
export class AddCarrierListingComponent implements OnInit {
  
  id: any;
  action: any;
  item: any;
  states:any;
  public packages:any;
  public addPackageForm: FormGroup;
  public gridObject: any = {};
  public formValue: any = {};
  public formData: any = {};
  constructor(public carrService:CarrierService,public carriersService:CarriersService,@Inject(MAT_DIALOG_DATA) public lead: any ,public alertService: AlertService, private _fb: FormBuilder,public dialogRef: MatDialogRef<AddCarrierListingComponent>,public fb: FormBuilder) { 
    this.createForm();
  }
  
  ngOnInit() {
    this.getPackagesDropdown({});
  }


  
  createForm() {
    this.addPackageForm = this.fb.group({
      companylegalname : new FormControl('',[Validators.maxLength(200),Validators.required,this.noWhiteSpaceValidator]),
      clientName : new FormControl('',[Validators.maxLength(50),Validators.required,this.noWhiteSpaceValidator]),
      emailID : new FormControl('',[Validators.maxLength(100),Validators.required,this.noWhiteSpaceValidator]),
      phone : new FormControl('',[Validators.maxLength(15),Validators.required,this.noWhiteSpaceValidator]),
      address : new FormControl('',[Validators.required,this.noWhiteSpaceValidator]),
      country : new FormControl('' , [Validators.required]),
      state : new FormControl('' , [Validators.required]),
      city : new FormControl('' , [Validators.maxLength(50) , Validators.required , this.noWhiteSpaceValidator]),
      zip : new FormControl('' , [Validators.maxLength(10) , Validators.required , this.noWhiteSpaceValidator]),
      packageLevel : new FormControl('' , [Validators.required]),
    });
  }

  get clientName() { return this.addPackageForm.get('clientName'); }

  get companylegalname() { return this.addPackageForm.get('companylegalname'); }
  
  get emailID() { return this.addPackageForm.get('emailID'); }
  
  get phone() { return this.addPackageForm.get('phone'); }
  
  get address() { return this.addPackageForm.get('address'); }
  
  get country() { return this.addPackageForm.get('country'); }
  
  get state() { return this.addPackageForm.get('state'); }
  
  get city() { return this.addPackageForm.get('city'); }

  get zip() { return this.addPackageForm.get('zip'); }

  get packageLevel() { return this.addPackageForm.get('packageLevel'); }
  
  close(): void {
    this.dialogRef.close();
  }

  saveCarrier() {
    let tempObj = {};
    tempObj['company_name'] = this.addPackageForm.value.companylegalname;
    tempObj['carrier_name'] = this.addPackageForm.value.clientName;
    tempObj['carrier_email'] = this.addPackageForm.value.emailID;
    tempObj['carrier_phone'] = this.addPackageForm.value.phone;
    tempObj['carrier_address'] = this.addPackageForm.value.address;
    tempObj['country_id'] = this.addPackageForm.value.country;
    tempObj['state_id'] = this.addPackageForm.value.state;
    tempObj['city'] = this.addPackageForm.value.city;
    tempObj['zip'] = this.addPackageForm.value.zip;
    tempObj['package_id'] = this.addPackageForm.value.packageLevel;
    tempObj['request_from'] = 1;
    tempObj['invoice_number'] = "Default";
    tempObj['stripe_subscription_id'] = "Default";
    console.log(tempObj);
    this.carrService.addNewCarrierFromAdmin(tempObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Client added successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }

  getStatesDropdown(country_id) {
    let obj = {'country_id':country_id};
    this.carriersService.getStatedDropdown(obj).then(data => {
      if(data.success) {
        console.log(data.results);
        this.states = data.results;
      }
      else { 
        this.alertService.createAlert(data.message,0);
      }
    })
  }

  getPackagesDropdown(finalObj) {
    finalObj['from'] = 1;
    this.carriersService.getUpgradingPackages(finalObj).then(data => {
      if(data.success) {
        this.packages = data.results;
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
  }

  noWhiteSpaceValidator(control: FormControl) {
    const isWhiteSpace = (control.value || '').trim().length === 0;
    const isValid = !isWhiteSpace;
    return isValid ? null : { 'whitespace': true };
  }
}
