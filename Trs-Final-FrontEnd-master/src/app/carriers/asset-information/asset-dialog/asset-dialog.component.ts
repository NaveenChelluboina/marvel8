import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../../carriers.service';

@Component({
  selector: 'app-asset-dialog',
  templateUrl: './asset-dialog.component.html',
  styleUrls: ['./asset-dialog.component.scss']
})
export class AssetDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  assetsDetailsForm: FormGroup;
  assetDetailsContactForm: FormGroup;
  addDocumentsForm: FormGroup;
  jobCodeArryForm: FormArray;
  allFields = [1];
  filesToUpload = [];
  weight = '1'
  asset_type = 0;
  showEmpty: boolean = false;
  makeVar = []
  assets: any[] = [];
  fleets: any[] = [];
  tableList: any;
  statesForCanadaAndUSa: any;
  public status_filter = "";
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this record?';
  public cancelClicked: boolean = false;
  currDate = new Date();
  // minimumDate = new Date();
  public minDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate());
  public maxDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate() + 1);
  plates = [{ 'jus_id': 1, 'jus_name': 'Albama' },
  { 'jus_id': 2, 'jus_name': 'Alaska' },
  { 'jus_id': 3, 'jus_name': 'Alberta' },
  { 'jus_id': 4, 'jus_name': 'Arizona' },
  { 'jus_id': 5, 'jus_name': 'British' },
  { 'jus_id': 6, 'jus_name': 'Columbia' }]

  years = [{ 'year_id': 1, 'year_name': '2022' },
  { 'year_id': 2, 'year_name': '2021' },
  { 'year_id': 3, 'year_name': '2020' },
  { 'year_id': 4, 'year_name': '2019' },
  { 'year_id': 5, 'year_name': '2018' },
  { 'year_id': 6, 'year_name': '2017' },
  { 'year_id': 7, 'year_name': '2016' },
  { 'year_id': 8, 'year_name': '2015' },
  { 'year_id': 9, 'year_name': '2014' },
  { 'year_id': 10, 'year_name': '2013' },
  { 'year_id': 11, 'year_name': '2012' },
  { 'year_id': 12, 'year_name': '2011' },
  { 'year_id': 13, 'year_name': '2010' },
  { 'year_id': 14, 'year_name': '2009' },
  { 'year_id': 15, 'year_name': '2008' },
  { 'year_id': 16, 'year_name': '2007' },
  { 'year_id': 17, 'year_name': '2006' },
  { 'year_id': 18, 'year_name': '2005' },
  { 'year_id': 19, 'year_name': '2004' },
  { 'year_id': 20, 'year_name': '2003' },
  { 'year_id': 21, 'year_name': '2002' },
  { 'year_id': 22, 'year_name': '2001' },
  { 'year_id': 23, 'year_name': '2000' },
  { 'year_id': 24, 'year_name': '1999' },
  { 'year_id': 25, 'year_name': '1998' },
  { 'year_id': 26, 'year_name': '1997' },
  { 'year_id': 27, 'year_name': '1996' },
  { 'year_id': 28, 'year_name': '1995' },
  { 'year_id': 29, 'year_name': '1994' },
  { 'year_id': 30, 'year_name': '1993' },
  { 'year_id': 31, 'year_name': '1992' },
  { 'year_id': 32, 'year_name': '1991' },
  { 'year_id': 33, 'year_name': '1990' },
  { 'year_id': 34, 'year_name': '1989' },
  { 'year_id': 35, 'year_name': '1988' },
  { 'year_id': 36, 'year_name': '1987' },
  { 'year_id': 37, 'year_name': '1986' },
  { 'year_id': 38, 'year_name': '1985' },
  { 'year_id': 39, 'year_name': '1984' },
  { 'year_id': 40, 'year_name': '1983' },
  { 'year_id': 41, 'year_name': '1982' },
  { 'year_id': 42, 'year_name': '1981' },
  { 'year_id': 43, 'year_name': '1980' },

  ]
  constructor(public carrierService: CarriersService, public alertService: AlertService, public fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public asset: any, public dialogRef: MatDialogRef<AssetDialogComponent>, @Inject(MAT_DIALOG_DATA) public type: any) {
    this.createAssetsDetails();
    this.createAssetDetailsContactForm();
    this.createDocxForm();
  }

  ngOnInit() {
    this.getassets({ 'is_active': 0 });
    this.getFleet({});
    this.getStatesForCanadaAndUsa({});
    if (this.asset) {
      for (let i = 0; i < this.asset.trs_tbl_asset_documents.length; i++) {
        if (this.asset.trs_tbl_asset_documents[i].issue_date) {
          this.asset.trs_tbl_asset_documents[i]['new_issue_date'] = this.asset.trs_tbl_asset_documents[i].issue_date.split('T')[0];
        }
        if (this.asset.trs_tbl_asset_documents[i].exp_date) {
          this.asset.trs_tbl_asset_documents[i]['new_expiry_date'] = this.asset.trs_tbl_asset_documents[i].exp_date.split('T')[0];
        }
      }
      this.tableList = this.asset.trs_tbl_asset_documents;
      if (!this.tableList.length) {
        this.showEmpty = true;
      } else {
        this.showEmpty = false;
      }
      this.assetsDetailsForm.controls['fleetName'].setValue(this.asset.fleet_id);
      this.assetsDetailsForm.controls['assetId'].setValue(this.asset.asset_number_id);
      this.assetsDetailsForm.controls['assestType'].setValue(this.asset.asset_type_id);
      this.assetsDetailsForm.controls['year'].setValue(this.asset.year_id);
      this.getMakeDropDown({});
      this.getStatesForCanadaAndUsa({});
      this.assetsDetailsForm.controls['make'].setValue(this.asset.asset_make_id);
      this.assetsDetailsForm.controls['model'].setValue(this.asset.model);
      this.assetsDetailsForm.controls['Plate'].setValue(this.asset.plate);
      this.assetsDetailsForm.controls['jurisdiction'].setValue(this.asset.state_id);

      this.assetDetailsContactForm.controls['vin'].setValue(this.asset.vin_number);
      this.assetDetailsContactForm.controls['Country'].setValue(this.asset.country_id);
      this.assetDetailsContactForm.controls['Weight'].setValue(this.asset.registered_weight);

      this.assetDetailsContactForm.controls['Axles'].setValue(this.asset.number_of_axels);
      var date = new Date(this.asset.start_date)
      date.setDate(date.getDate() + 1)
      this.assetDetailsContactForm.controls['startDate'].setValue(this.asset.start_date);
      if (this.asset.inactive_date) {
        this.assetDetailsContactForm.controls['inactiveDate'].setValue(this.asset.inactive_date);
      }
      this.assetDetailsContactForm.controls['comments'].setValue(this.asset.comments);
    } else {
      this.assetDetailsContactForm.controls['Country'].setValue(38);
    }
    this.addItem();
  }

  changeappAccess(document) {
    let finalObj = {};
    finalObj['asset_document_id'] = document.asset_document_id;
    finalObj['app_access'] = !document.app_access;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    finalObj['notification_message'] = "New Document available for Download in My Active Asset";
    this.carrierService.updateDocuments(finalObj).then(data => {
      if (data.success) {
        this.alertService.createAlert("Document updated for app access successfully", 1);
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }

  get fleetName() { return this.assetsDetailsForm.get('fleetName'); }
  get assetId() { return this.assetsDetailsForm.get('assetId'); }
  get assestType() { return this.assetsDetailsForm.get('assestType'); }
  get year() { return this.assetsDetailsForm.get('year'); }
  get make() { return this.assetsDetailsForm.get('make'); }
  get model() { return this.assetsDetailsForm.get('model'); }
  get Plate() { return this.assetsDetailsForm.get('Plate'); }
  get jurisdiction() { return this.assetsDetailsForm.get('jurisdiction'); }

  get vin() { return this.assetDetailsContactForm.get('vin'); }
  get Country() { return this.assetDetailsContactForm.get('Country'); }
  get Weight() { return this.assetDetailsContactForm.get('Weight'); }
  get Axles() { return this.assetDetailsContactForm.get('Axles'); }
  get startDate() { return this.assetDetailsContactForm.get('startDate'); }
  get inactiveDate() { return this.assetDetailsContactForm.get('inactiveDate'); }
  get comments() { return this.assetDetailsContactForm.get('comments'); }

  get filesSelect() { return this.addDocumentsForm.get('filesSelect'); }
  get docType() { return this.addDocumentsForm.get('docType'); }
  get docRef() { return this.addDocumentsForm.get('docRef'); }
  get issueDate() { return this.addDocumentsForm.get('issueDate'); }
  get expiryDate() { return this.addDocumentsForm.get('expiryDate'); }
  get appAccess() { return this.addDocumentsForm.get('appAccess'); }


  close(): void {
    this.dialogRef.close('save');
  }

  createAssetsDetails() {
    this.assetsDetailsForm = this.fb.group({
      fleetName: new FormControl('', [Validators.required]),
      assetId: new FormControl('', [Validators.maxLength(25), Validators.required, this.noWhiteSpaceValidator]),
      assestType: new FormControl('', [Validators.required]),
      year: new FormControl('', [Validators.required]),
      make: new FormControl('', [Validators.required]),
      model: new FormControl('', [Validators.maxLength(15), Validators.required]),
      Plate: new FormControl('', [Validators.maxLength(10), Validators.required, this.noWhiteSpaceValidator]),
      jurisdiction: new FormControl('', [Validators.required]),
    })
  }

  createAssetDetailsContactForm() {
    this.assetDetailsContactForm = this.fb.group({
      vin: new FormControl('', [Validators.maxLength(17), Validators.required]),
      Country: new FormControl('', [Validators.required]),
      Weight: new FormControl('', [Validators.maxLength(12), Validators.required]),
      Axles: new FormControl('', [Validators.maxLength(2), Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      inactiveDate: new FormControl(null),
      comments: new FormControl('')
    })
  }

  createDocxForm() {
    this.addDocumentsForm = this.fb.group({
      jobCodeDetails: new FormArray([]),
    })
  }

  addItem(): void {
    this.jobCodeArryForm = this.addDocumentsForm.get('jobCodeDetails') as FormArray;
    this.jobCodeArryForm.push(this.createItem("Assets", null, null, null, null, null));
  }

  removeItem(index) {
    this.jobCodeArryForm.removeAt(index);
  }

  createItem(docType, docRef, issueDate, expiryDate, appAccess, filesSelect): FormGroup {
    return this.fb.group({
      docType: [docType],
      docRef: [docRef, [Validators.maxLength(50)]],
      issueDate: [issueDate],
      expiryDate: [expiryDate],
      appAccess: [appAccess],
      filesSelect: [filesSelect, [Validators.required]],
    });
  }

  handleFileSelect(event) {
    this.filesToUpload.push(event.target.files[0])
    // this.filesToUpload = event.target.files[0];
  }


  noWhiteSpaceValidator(control: FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid = !isWhiteSpace;
    return isValid ? null : { 'whitespace': true };
  }

  getMakeDropDown(filters) {
    this.carrierService.getAssetMakesdropdown(filters).then(data => {
      if (data.success) {
        this.makeVar = data.results;
      }
    });
  }

  firstDropDownChanged(event) {
    if (event) {
      this.assetsDetailsForm.controls["make"].setValue(null);
    }
    for (let i = 0; i < this.assets.length; i++) {
      if (this.assets[i].asset_type_id == event) {
        this.asset_type = this.assets[i].asset_type;
      }
    } if (this.asset_type != 0) {
      let filters = {};
      filters['asset_type'] = this.asset_type;
      this.carrierService.getAssetMakesdropdown(filters).then(data => {
        if (data.success) {
          this.makeVar = data.results;
        }
      });
    }
  }

  onlyNumbers(event) {
    var k;
    k = event.charCode;
    return ((k > 47 && k < 58));
  }

  getStatesForCanadaAndUsa(filter) {
    this.carrierService.getStatedForCanadaAndUsa(filter).then(data => {
      if (data.success) {
        this.statesForCanadaAndUSa = data.results;
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }

  onlyNumbersWithDecimal(event) {
    const txt = event.target.value;
    const dotcontainer = txt.split('.');
    const decimals = txt.split('.')[1];
    const charCode = event.charCode;
    if ((charCode > 47 && charCode < 58) || charCode == 46) {
      if (decimals !== null && decimals !== undefined) {
        if (!(dotcontainer.length === 1 && charCode === 46) && (charCode < 48 || charCode > 57)
          || decimals.length >= 2) {
          return false;
        }
      } else {
        if (txt.length >= 3 && charCode !== 46) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
  getFleet(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getFleetDropDown(filters).then(data => {
      if (data.success) {
        this.fleets = data.results;
      }
    })
  }

  public getassets(filter) {
    this.carrierService.getAssetTypesdropdown(filter).then(data => {
      if (data.success) {
        this.assets = data.results;
      }
    });
  }

  deleteVisit(item) {
    let finalObj = {};
    finalObj['asset_document_id'] = item.asset_document_id;
    finalObj['is_deleted'] = 1;
    this.carrierService.updateDocuments(finalObj).then(data => {
      if (data.success) {
        this.alertService.createAlert("Document deleted successfully", 1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }

  checkDates() {
    if (this.assetDetailsContactForm.value.inactiveDate) {
      let ad1 = new Date(this.assetDetailsContactForm.value.startDate);
      let ind1 = new Date(this.assetDetailsContactForm.value.inactiveDate);
      if (ad1.getTime() < ind1.getTime()) {
        this.stepper.next();
      } else {
        this.alertService.createAlert("Inactive date should be greater than Active date", 0);
      }
    } else {
      this.stepper.next();
    }
  }

  public saveAssets() {
    let finalObj = {};
    let finalDocData = [];
    const formData: FormData = new FormData();
    // for changing the date to correct date
    for (let j in this.addDocumentsForm.value.jobCodeDetails) {
      let issDate = null;
      let expDate = null;
      if (this.addDocumentsForm.value.jobCodeDetails[j].issueDate) {
        issDate = new Date(this.addDocumentsForm.value.jobCodeDetails[j].issueDate);
      }
      if (this.addDocumentsForm.value.jobCodeDetails[j].expiryDate) {
        expDate = new Date(this.addDocumentsForm.value.jobCodeDetails[j].expiryDate);
      }
      if (this.addDocumentsForm.value.jobCodeDetails[j].issueDate && this.addDocumentsForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType": this.addDocumentsForm.value.jobCodeDetails[j].docType,
          "docRef": this.addDocumentsForm.value.jobCodeDetails[j].docRef,
          "appAccess": this.addDocumentsForm.value.jobCodeDetails[j].appAccess,
          "issueDate": issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
          "expiryDate": expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
          "filesSelect": this.addDocumentsForm.value.jobCodeDetails[j].filesSelect
        })
      }
      if (!this.addDocumentsForm.value.jobCodeDetails[j].issueDate && !this.addDocumentsForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType": this.addDocumentsForm.value.jobCodeDetails[j].docType,
          "docRef": this.addDocumentsForm.value.jobCodeDetails[j].docRef,
          "issueDate": null,
          "expiryDate": null,
          "appAccess": this.addDocumentsForm.value.jobCodeDetails[j].appAccess,
          "filesSelect": this.addDocumentsForm.value.jobCodeDetails[j].filesSelect
        })
      }
      if (!this.addDocumentsForm.value.jobCodeDetails[j].issueDate && this.addDocumentsForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType": this.addDocumentsForm.value.jobCodeDetails[j].docType,
          "docRef": this.addDocumentsForm.value.jobCodeDetails[j].docRef,
          "issueDate": null,
          "appAccess": this.addDocumentsForm.value.jobCodeDetails[j].appAccess,
          "expiryDate": expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
          "filesSelect": this.addDocumentsForm.value.jobCodeDetails[j].filesSelect
        })
      }
      if (this.addDocumentsForm.value.jobCodeDetails[j].issueDate && !this.addDocumentsForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType": this.addDocumentsForm.value.jobCodeDetails[j].docType,
          "docRef": this.addDocumentsForm.value.jobCodeDetails[j].docRef,
          "issueDate": issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
          "expiryDate": null,
          "appAccess": this.addDocumentsForm.value.jobCodeDetails[j].appAccess,
          "filesSelect": this.addDocumentsForm.value.jobCodeDetails[j].filesSelect
        })
      }
    }
    finalObj['fleet_id'] = this.assetsDetailsForm.value.fleetName;
    finalObj['asset_number_id'] = this.assetsDetailsForm.value.assetId;
    finalObj['asset_type_id'] = this.assetsDetailsForm.value.assestType;
    finalObj['plate'] = this.assetsDetailsForm.value.Plate;
    finalObj['state_id'] = this.assetsDetailsForm.value.jurisdiction;
    finalObj['year'] = this.assetsDetailsForm.value.year;
    finalObj['asset_make_id'] = this.assetsDetailsForm.value.make;
    finalObj['model'] = this.assetsDetailsForm.value.model;
    finalObj['vin_number'] = this.assetDetailsContactForm.value.vin;
    finalObj['country_id'] = this.assetDetailsContactForm.value.Country;
    finalObj['registered_weight'] = this.assetDetailsContactForm.value.Weight;
    if (this.assetDetailsContactForm.value.Country == 38) {
      finalObj['units'] = 1;
    } else {
      finalObj['units'] = 2;
    }
    finalObj['number_of_axels'] = this.assetDetailsContactForm.value.Axles;
    let ad = new Date(this.assetDetailsContactForm.value.startDate);
    finalObj['start_date'] = ad.setTime(ad.getTime() + (330 * 60 * 1000));
    if (this.assetDetailsContactForm.value.inactiveDate) {
      if (new Date(this.assetDetailsContactForm.value.inactiveDate).getTime() > new Date().getTime()) {
        finalObj['is_active'] = 1;
      }
      let ind = new Date(this.assetDetailsContactForm.value.inactiveDate);
      finalObj['inactive_date'] = ind.setTime(ind.getTime() + (330 * 60 * 1000));
    }
    else {
      finalObj['inactive_date'] = null;
      finalObj['is_active'] = 1;
    }
    finalObj['comments'] = this.assetDetailsContactForm.value.comments;
    finalObj['docsLength'] = this.filesToUpload.length;
    finalObj['notification_message'] = "New Document available for Download in My Active Asset";
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    for (let i = 0; i < this.filesToUpload.length; i++) {
      formData.append('filesnew' + i, this.filesToUpload[i]);
    }
    formData.append('documentsData', JSON.stringify(finalDocData));
    if (this.asset) {
      finalObj['asset_id'] = this.asset.asset_id;
      formData.append('data', JSON.stringify(finalObj));
      this.carrierService.updateAssets(formData).then(data => {
        if (data.success) {
          finalDocData = [];
          this.alertService.createAlert("Asset updated successfully", 1);
          this.dialogRef.close('save');
        }
        else {
          finalDocData = [];
          this.alertService.createAlert(data.message, 0);
        }
      })
    } else {
      finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      formData.append('data', JSON.stringify(finalObj));
      this.carrierService.addAssets(formData).then(data => {
        if (data.success) {
          finalDocData = [];
          this.alertService.createAlert("Asset added successfully", 1);
          this.dialogRef.close('save');
        }
        else {
          finalDocData = [];
          this.alertService.createAlert(data.message, 0);
        }
      })
    }
  }
}
