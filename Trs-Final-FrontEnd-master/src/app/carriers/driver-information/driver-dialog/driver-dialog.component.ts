import { Component, OnInit,Inject, ViewChild } from '@angular/core';
import { MatDialogRef ,MAT_DIALOG_DATA,MatStepper} from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CarriersService } from '../../carriers.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-driver-dialog',
  templateUrl: './driver-dialog.component.html',
  styleUrls: ['./driver-dialog.component.scss']
})
export class DriverDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  value: Date;
  driverBasicDetailsForm: FormGroup;
  driverAddressDetailsForm:FormGroup;
  allFields = [1];
  states:any;
  docxForm:FormGroup;
  jobCodeArryForm: FormArray;
  showEmpty: boolean = false;
  filesToUpload = [];
  finalDocData = [];
  tableList:any;
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this record ?';
  public cancelClicked: boolean = false;
  currDate = new Date();
  // minimumDate = new Date();
  public minDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate());
  public maxDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate()+1);
  
  constructor(public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService,@Inject(MAT_DIALOG_DATA) public driver: any ,public dialogRef: MatDialogRef<DriverDialogComponent>) {
    this.createDriverBasicDetails();
    this.createDriverAddressDetails();
    this.createDocxForm();
  }
  
  ngOnInit() {
    if(this.driver) {
      this.getStatesDropdown(this.driver.country_id);
      for(let i = 0; i < this.driver.trs_tbl_driver_documents.length; i++) {
        
        if(this.driver.trs_tbl_driver_documents[i].issue_date)
        this.driver.trs_tbl_driver_documents[i]['new_issue_date'] = this.driver.trs_tbl_driver_documents[i].issue_date.split('T')[0];
        else 
        this.driver.trs_tbl_driver_documents[i]['new_issue_date'] = "-";
        if(this.driver.trs_tbl_driver_documents[i].exp_date)
        this.driver.trs_tbl_driver_documents[i]['new_expiry_date'] = this.driver.trs_tbl_driver_documents[i].exp_date.split('T')[0];
        else 
        this.driver.trs_tbl_driver_documents[i]['new_expiry_date'] = "-";
      }
      this.tableList = this.driver.trs_tbl_driver_documents;
      if(!this.tableList.length){
        this.showEmpty = true;
      } else {
        this.showEmpty = false;
      }
      this.driverBasicDetailsForm.controls['lastName'].setValue(this.driver.driver_last_name);
      this.driverBasicDetailsForm.controls['firstName'].setValue(this.driver.driver_first_name);
      this.driverBasicDetailsForm.controls['cellPhone'].setValue(this.driver.cell_phone);
      this.driverBasicDetailsForm.controls['email'].setValue(this.driver.email_address);
      this.driverBasicDetailsForm.controls['email'].disable();
      this.driverBasicDetailsForm.controls['dlNumber'].setValue(this.driver.dl_number);
      this.driverBasicDetailsForm.controls['dlClass'].setValue(this.driver.dl_class);
      this.driverBasicDetailsForm.controls['startDate'].setValue(this.driver.start_date);
      if(this.driver.inactive_date)
      this.driverBasicDetailsForm.controls['inactiveDate'].setValue(this.driver.inactive_date);
      this.driverBasicDetailsForm.controls['comments'].setValue(this.driver.comments);
      this.driverAddressDetailsForm.controls['address1'].setValue(this.driver.address1);
      // this.driverAddressDetailsForm.controls['address2'].setValue(this.driver.address1);
      this.driverAddressDetailsForm.controls['city'].setValue(this.driver.city);
      this.driverAddressDetailsForm.controls['zip'].setValue(this.driver.zip);
      this.driverAddressDetailsForm.controls['country'].setValue(this.driver.country_id);
      this.driverAddressDetailsForm.controls['state'].setValue(this.driver.state_id);
      
    }
    this.addItem();
  }
  
  get lastName() { return this.driverBasicDetailsForm.get('lastName'); }
  
  get firstName() { return this.driverBasicDetailsForm.get('firstName'); }
  
  // get home() { return this.driverBasicDetailsForm.get('home'); }
  
  get cellPhone() { return this.driverBasicDetailsForm.get('cellPhone'); }
  
  get email() { return this.driverBasicDetailsForm.get('email'); }
  
  get dlNumber() { return this.driverBasicDetailsForm.get('dlNumber'); }
  
  get dlClass() { return this.driverBasicDetailsForm.get('dlClass'); }
  
  get startDate() { return this.driverBasicDetailsForm.get('startDate'); }
  
  get inactiveDate() { return this.driverBasicDetailsForm.get('inactiveDate'); }
  
  get comments() { return this.driverBasicDetailsForm.get('comments'); }
  
  get address1() { return this.driverAddressDetailsForm.get('address1'); }
  
  // get address2() { return this.driverAddressDetailsForm.get('address2'); }
  
  get country() { return this.driverAddressDetailsForm.get('country'); }
  
  get state() { return this.driverAddressDetailsForm.get('state'); }
  
  get city() { return this.driverAddressDetailsForm.get('city'); }
  
  get zip() { return this.driverAddressDetailsForm.get('zip'); }
  
  createDriverBasicDetails() {
    this.driverBasicDetailsForm = this.fb.group({
      lastName : new FormControl('' , [Validators.maxLength(15) , Validators.required , this.noWhiteSpaceValidator]),
      firstName : new FormControl('' , [Validators.maxLength(15) , Validators.required , this.noWhiteSpaceValidator]),
      cellPhone : new FormControl('' , [Validators.maxLength(12) , Validators.required , this.noWhiteSpaceValidator]),
      email : new FormControl('' , [Validators.maxLength(50) , Validators.required , this.noWhiteSpaceValidator]),
      dlNumber : new FormControl('' , [Validators.maxLength(25) , Validators.required , this.noWhiteSpaceValidator]),
      dlClass : new FormControl('' , [Validators.maxLength(5) , Validators.required , this.noWhiteSpaceValidator]),
      startDate : new FormControl('' , [Validators.required]),
      inactiveDate : new FormControl(null),
      comments : new FormControl('' , [Validators.maxLength(100)])
      
    });
  }
  
  createDriverAddressDetails() {
    this.driverAddressDetailsForm = this.fb.group({
      address1 : new FormControl(''),
      // address2 : new FormControl(''),
      country : new FormControl('' , [Validators.required]),
      state : new FormControl('' , [Validators.required]),
      city : new FormControl('' , [Validators.maxLength(25) , Validators.required , this.noWhiteSpaceValidator]),
      zip : new FormControl('' , [Validators.maxLength(15) , Validators.required , this.noWhiteSpaceValidator])
    });
  }
  
  createDocxForm() {
    this.docxForm = this.fb.group({
      jobCodeDetails : new FormArray([]),
    })
  }
  
  createItem(docType, docRef, issueDate, expiryDate,appAccess, filesSelect): FormGroup {
    return this.fb.group({
      docType: [docType],
      docRef: [docRef,Validators.maxLength(50)],
      issueDate: [issueDate],
      expiryDate: [expiryDate],
      appAccess: [appAccess],
      filesSelect: [filesSelect, [Validators.required]],
    });
  }
  
  omit_special_char(event) {
    var k;
    k=event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32)
  }
  
  omit_letters(event) {
    var k;
    k=event.charCode;
    return ( k == 8 || k == 32 || (k > 47 && k < 58) || k ==43)
  }
  
  
  // omit_special_char(event) {
  //   var k;
  //   k=event.charCode;
  //   return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k > 47 && k < 58))
  // }
  
  addItem(): void {
    this.jobCodeArryForm = this.docxForm.get('jobCodeDetails') as FormArray;
    this.jobCodeArryForm.push(this.createItem("Driver", null, null, null, null, null));
  }
  
  removeItem(index) {
    this.jobCodeArryForm.removeAt(index);
  }
  
  get docType() { return this.docxForm.get('docType'); }
  
  get docRef() { return this.docxForm.get('docRef'); }
  
  get issueDate() { return this.docxForm.get('issueDate'); }
  
  get expiryDate() { return this.docxForm.get('expiryDate'); }

  get appAccess() { return this.docxForm.get('appAccess'); }
  
  get filesSelect() { return this.docxForm.get('filesSelect'); }
  
  getStatesDropdown(country_id) {
    let obj = {'country_id':country_id};
    this.carrierService.getStatedDropdown(obj).then(data => {
      if(data.success) {
        this.states = data.results;
      }
      else { 
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  handleFileSelect(event) {
    this.filesToUpload.push(event.target.files[0])
    // this.filesToUpload = event.target.files[0];
  }
  
  deleteVisit(item){
    let finalObj = {};
    finalObj['document_id'] = item.document_id;
    finalObj['is_deleted'] = 1;
    this.carrierService.updateDriverDocuments(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document deleted successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  close(): void {
    this.dialogRef.close('save');
  }

  changeappAccess(document) {
    let finalObj = {};
    finalObj['document_id'] = document.document_id;
    finalObj['app_access'] = !document.app_access;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    finalObj['notification_message'] = "New Document available for Download in My Docs";
    finalObj['driver_id'] = this.driver.driver_id;
    this.carrierService.updateDriverDocuments(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document updated for app access successfully",1);
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  saveDriver() {
    let finalObj = {};
    const formData: FormData = new FormData();
    // for changing the date to correct date
    for (let i in this.docxForm.value.jobCodeDetails){
      let issDate = null;
      let expDate = null;
      if(this.docxForm.value.jobCodeDetails[i].issueDate) {
        issDate = new Date(this.docxForm.value.jobCodeDetails[i].issueDate);
      }
      if(this.docxForm.value.jobCodeDetails[i].expiryDate) {
        expDate = new Date(this.docxForm.value.jobCodeDetails[i].expiryDate);
      }
      if(this.docxForm.value.jobCodeDetails[i].issueDate && this.docxForm.value.jobCodeDetails[i].expiryDate) {
        this.finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[i].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[i].docRef,
          "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
          "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
          "appAccess" : this.docxForm.value.jobCodeDetails[i].appAccess,
          "filesSelect" : this.docxForm.value.jobCodeDetails[i].filesSelect
        })
      }
      if(!this.docxForm.value.jobCodeDetails[i].issueDate && !this.docxForm.value.jobCodeDetails[i].expiryDate) {
        this.finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[i].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[i].docRef,
          "appAccess" : this.docxForm.value.jobCodeDetails[i].appAccess,
          "issueDate" : null,
          "expiryDate" : null,
          "filesSelect" : this.docxForm.value.jobCodeDetails[i].filesSelect
        })
      }
      if(!this.docxForm.value.jobCodeDetails[i].issueDate && this.docxForm.value.jobCodeDetails[i].expiryDate) {
        this.finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[i].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[i].docRef,
          "appAccess" : this.docxForm.value.jobCodeDetails[i].appAccess,
          "issueDate" : null,
          "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
          "filesSelect" : this.docxForm.value.jobCodeDetails[i].filesSelect
        })
      }
      if(this.docxForm.value.jobCodeDetails[i].issueDate && !this.docxForm.value.jobCodeDetails[i].expiryDate) {
        this.finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[i].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[i].docRef,
          "appAccess" : this.docxForm.value.jobCodeDetails[i].appAccess,
          "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
          "expiryDate" : null,
          "filesSelect" : this.docxForm.value.jobCodeDetails[i].filesSelect
        })
      }
    }
    finalObj['driver_first_name'] = this.driverBasicDetailsForm.value.firstName;
    finalObj['driver_last_name'] = this.driverBasicDetailsForm.value.lastName;
    finalObj['cell_phone'] = this.driverBasicDetailsForm.value.cellPhone;
    finalObj['email_address'] = this.driverBasicDetailsForm.value.email;
    finalObj['dl_number'] = this.driverBasicDetailsForm.value.dlNumber;
    finalObj['dl_class'] = this.driverBasicDetailsForm.value.dlClass;
    finalObj['address1'] = this.driverAddressDetailsForm.value.address1;
    finalObj['city'] = this.driverAddressDetailsForm.value.city;
    finalObj['country_id'] = this.driverAddressDetailsForm.value.country;
    finalObj['state_id'] = this.driverAddressDetailsForm.value.state;
    finalObj['zip'] = this.driverAddressDetailsForm.value.zip;
    // finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    let ad = new Date(this.driverBasicDetailsForm.value.startDate);
    finalObj['start_date'] = ad.setTime(ad.getTime() + (330 * 60 * 1000));
    if(this.driverBasicDetailsForm.value.inactiveDate){
      if(new Date(this.driverBasicDetailsForm.value.inactiveDate).getTime() > new Date().getTime()) {
        finalObj['is_active'] = 1;
      }
      let ind = new Date(this.driverBasicDetailsForm.value.inactiveDate);
      finalObj['inactive_date'] = ind.setTime(ind.getTime() + (330 * 60 * 1000));
    }
    else {
      finalObj['inactive_date'] = null;
      finalObj['is_active'] = 1;
    }
    
    finalObj['comments'] = this.driverBasicDetailsForm.value.comments;
    finalObj['docsLength'] = this.filesToUpload.length;
    finalObj['notification_message'] = "New Document available for Download in My Docs";
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    console.log(finalObj);
    for(let i = 0 ; i < this.filesToUpload.length ; i++) {
      formData.append('filesnew'+i, this.filesToUpload[i]);
    }
    formData.append('documentsData',JSON.stringify(this.finalDocData));
    if(this.driver) {
      finalObj['email_address'] = this.driver.email_address;
      finalObj['driver_id'] = this.driver.driver_id;
      formData.append('driverInfo',JSON.stringify(finalObj));
      this.carrierService.updateDriver(formData).then(data => {
        if(data.success) {
          this.finalDocData = [];
          this.alertService.createAlert("Driver updated successfully",1);
          this.dialogRef.close('save');
        }
        else {
          this.finalDocData = [];
          this.alertService.createAlert(data.message,0);
        }
      });
    }
    else {
      formData.append('driverInfo',JSON.stringify(finalObj));
      this.carrierService.addDriver(formData).then(data => {
        if(data.success) {
          this.finalDocData = [];
          this.alertService.createAlert("Driver added successfully",1);
          this.dialogRef.close('save');
        }
        else {
          this.finalDocData = [];
          this.alertService.createAlert(data.message,0);
        }
      })
    }
  }
  
  checkDates(){
    if(this.driverBasicDetailsForm.value.inactiveDate){
      let ad1 = new Date(this.driverBasicDetailsForm.value.startDate);
      let ind1 = new Date(this.driverBasicDetailsForm.value.inactiveDate);
      if(ad1.getTime() < ind1.getTime()){
        this.stepper.next();
      } else {
        this.alertService.createAlert("Inactive date should be greater than Active date",0);
      }
    } else{
      this.stepper.next();
    }
  }
  
  updateDriver() {
    let finalObj = {};
    finalObj['driver_id'] = this.driver.driver_id;
    finalObj['driver_first_name'] = this.driverBasicDetailsForm.value.firstName;
    finalObj['driver_last_name'] = this.driverBasicDetailsForm.value.lastName;
    finalObj['cell_phone'] = this.driverBasicDetailsForm.value.cellPhone;
    finalObj['email_address'] = this.driverBasicDetailsForm.value.email;
    finalObj['dl_number'] = this.driverBasicDetailsForm.value.dlNumber;
    finalObj['dl_class'] = this.driverBasicDetailsForm.value.dlClass;
    finalObj['address1'] = this.driverAddressDetailsForm.value.address1;
    finalObj['city'] = this.driverAddressDetailsForm.value.city;
    finalObj['country_id'] = this.driverAddressDetailsForm.value.country;
    finalObj['state_id'] = this.driverAddressDetailsForm.value.state;
    finalObj['zip'] = this.driverAddressDetailsForm.value.zip;
    finalObj['comments'] = this.driverBasicDetailsForm.value.comments;
    let ad = new Date(this.driverBasicDetailsForm.value.startDate);
    finalObj['start_date'] = ad.setTime(ad.getTime() + (330 * 60 * 1000));
    
    if(this.driverBasicDetailsForm.value.inactiveDate) {
      let ind = new Date(this.driverBasicDetailsForm.value.inactiveDate);
      finalObj['inactive_date'] = ind.setTime(ind.getTime() + (330 * 60 * 1000));
      if(this.driverBasicDetailsForm.value.inactiveDate.getTime() > new Date().getTime()) {
        finalObj['is_active'] = 1;
      }
    }
    else {
      finalObj['inactive_date'] = null;
      finalObj['is_active'] = 1;
    }
    console.log(finalObj);
    this.carrierService.updateDriver(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Driver updated successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    });
  }
  
  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }
  
  // removeItem(index){
  //   this.allFields.splice(index, 1);
  // }
  
}
