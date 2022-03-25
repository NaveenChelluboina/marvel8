import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { CarriersService } from '../carriers.service';
import { AlertService } from '../../shared/services/alert.service';
import { MatDialog } from '@angular/material';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { DocumentCommentsComponent } from './document-comments/document-comments.component';

@Component({
  selector: 'app-corporate-information',
  templateUrl: './corporate-information.component.html',
  styleUrls: ['./corporate-information.component.scss']
})
export class CorporateInformationComponent implements OnInit {
  
  carrierType: any;
  jobCodeArryForm: FormArray;
  isUsUsTravel = true;
  isUsInternationalTravel = false;
  iscanCanadaTravel = false;
  iscanInternationalTravel = false;
  allFields = [1];
  states:any;
  filesToUpload = [];
  showEmptyDocs : boolean = true;
  showEmpty : boolean = false;
  public information : any;
  public totalCount:any;
  anyObjToCompare : any;
  public popoverTitle: string = 'Confirm Delete'; 
  public popoverMessage: string = 'Are you sure you want to delete this record?';
  public cancelClicked: boolean = false;
  public is_selected: boolean = false;
  currDate = new Date();
  // minimumDate = new Date();
  public minDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate());
  public maxDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate()+1);
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  referenceAssending:boolean = false;
  issueAssending:boolean = false;
  expAssending:boolean = false;
  appAssending: boolean = false;
  tableList:any;
  
  constructor(public dialog: MatDialog,public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService) {
    this.createCommonDetails();
    this.createCarrierDetails();
  }
  
  commanDetailsForm: FormGroup;
  carrierDetailsForm: FormGroup;
  
  public createCommonDetails() {
    this.commanDetailsForm = this.fb.group({
      companyLegalName : new FormControl('',[Validators.required, Validators.maxLength(50), this.noWhiteSpaceValidator]),
      companyDba : new FormControl('',[Validators.maxLength(50)]),
      country : new FormControl('',[Validators.required]),
      state : new FormControl('',[Validators.required]),
      city : new FormControl('',[Validators.required, Validators.maxLength(20), this.noWhiteSpaceValidator]),
      address1 : new FormControl('',[Validators.required, Validators.maxLength(150), this.noWhiteSpaceValidator]),
      // address2 : new FormControl('',[ Validators.maxLength(300)]),
      zipcode : new FormControl('',[Validators.required, Validators.maxLength(7), this.noWhiteSpaceValidator]),
      telephone : new FormControl('',[Validators.required, Validators.maxLength(12), this.noWhiteSpaceValidator]),
      fax : new FormControl('',[Validators.maxLength(15)]),
    })
  }
  
  pressing(carrierType) {
    
  }
  public createCarrierDetails() {
    this.carrierDetailsForm = this.fb.group({
      // carrierTypeRadio : new FormControl(''),
      nsc : new FormControl(null),
      jobCodeDetails: new FormArray([]),
      fbc : new FormControl(null),
      ifta : new FormControl(null),
      // irpf1 : new FormControl(null),
      // irpf2 : new FormControl(null),
      ic : new FormControl(null),
      ip : new FormControl(null),
      iped : new FormControl(null),
      quebec : new FormControl(null),
      usdot : new FormControl(null),
      usdotpin : new FormControl(null),
      mcn : new FormControl(null),
      mcpu : new FormControl(null),
      mcpin : new FormControl(null),
      ein : new FormControl(null),
      irp : new FormControl(null),
      kyu : new FormControl(null),
      nmwdt : new FormControl(null),
      nyhut : new FormControl(null),
      oregon : new FormControl(null),
      uscbp : new FormControl(null),
      scac : new FormControl(null)
    })
  }
  
  Refclicked(order) {
    console.log(order);
    if(order) {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var titleA = a.reffer.toString().toLowerCase(), titleB = b.reffer.toString().toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var titleA = b.reffer.toString().toLowerCase(), titleB = a.reffer.toString().toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  appAccessAssending(order) {
    if(order) {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var titleA = a.app_access, titleB = b.app_access;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var titleA = b.app_access, titleB = a.app_access;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  issueDateClicked(order) {
    if(order) {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var dateA = new Date(a.issue_date).valueOf(), dateB = new Date(b.issue_date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var dateA = new Date(a.issue_date).valueOf(), dateB = new Date(b.issue_date).valueOf();
        return dateB - dateA;
      });
    }
    
  }
  
  expDateClicked(order) {
    if(order) {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var dateA = new Date(a.exp_date).valueOf(), dateB = new Date(b.exp_date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.information[0].trs_tbl_corporate_info_documents.sort(function(a, b) {
        var dateA = new Date(a.exp_date).valueOf(), dateB = new Date(b.exp_date).valueOf();
        return dateB - dateA;
      });
    }
  }
  
  createItem(docType, docRef, issueDate, expiryDate,appAccess, filesSelect): FormGroup {
    return this.fb.group({
      docType: [docType ,[Validators.required, this.noWhiteSpaceValidator]],
      docRef: [docRef, [Validators.required, Validators.maxLength(50),this.noWhiteSpaceValidator]],
      issueDate: [issueDate, [Validators.required]],
      expiryDate: [expiryDate, [Validators.required]],
      appAccess: [appAccess],
      filesSelect: [filesSelect, [Validators.required]]
    });
  }
  
  changeappAccess(document) {
    let finalObj = {};
    finalObj['from'] = 1;
    finalObj['document_id'] = document.document_id;
    finalObj['app_access'] = !document.app_access;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    finalObj['notification_message'] = "New Document available for Download in Corporate";
    this.carrierService.deleteCoroperateDoc(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document updated for app access successfully",1);
        this.getCorporateInformation({},"");
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  addItem(): void {
    this.jobCodeArryForm = this.carrierDetailsForm.get('jobCodeDetails') as FormArray;
    this.jobCodeArryForm.push(this.createItem("Corporate", null, null, null, null,null));
  }
  removeItem(index) {
    this.jobCodeArryForm.removeAt(index);
  }
  
  get docType() { return this.carrierDetailsForm.get('docType'); }
  
  get docRef() { return this.carrierDetailsForm.get('docRef'); }
  
  get issueDate() { return this.carrierDetailsForm.get('issueDate'); }
  
  get expiryDate() { return this.carrierDetailsForm.get('expiryDate'); }
  
  get appAccess() { return this.carrierDetailsForm.get('appAccess'); }
  
  get filesSelect() { return this.carrierDetailsForm.get('filesSelect'); }
  
  // get carrierTypeRadio() { return this.carrierDetailsForm.get('carrierTypeRadio'); }
  
  get companyLegalName() { return this.commanDetailsForm.get('companyLegalName'); }
  
  get companyDba() { return this.commanDetailsForm.get('companyDba'); }
  
  get country() { return this.commanDetailsForm.get('country'); }
  
  get state() { return this.commanDetailsForm.get('state'); }
  
  get city() { return this.commanDetailsForm.get('city'); }
  
  get address1() { return this.commanDetailsForm.get('address1'); }
  
  // get address2() { return this.commanDetailsForm.get('address2'); }
  
  get zipcode() { return this.commanDetailsForm.get('zipcode'); }
  
  get telephone() { return this.commanDetailsForm.get('telephone'); }
  
  get fax() { return this.commanDetailsForm.get('fax'); }
  
  get nsc() { return this.carrierDetailsForm.get('nsc'); }
  
  get fbc() { return this.carrierDetailsForm.get('fbc'); }
  
  get ifta() { return this.carrierDetailsForm.get('ifta'); }
  
  // get irpf1() { return this.carrierDetailsForm.get('irpf1'); }
  
  // get irpf2() { return this.carrierDetailsForm.get('irpf2'); }
  
  get ic() { return this.carrierDetailsForm.get('ic'); }
  
  get ip() { return this.carrierDetailsForm.get('ip'); }
  
  get iped() { return this.carrierDetailsForm.get('iped'); }
  
  get quebec() { return this.carrierDetailsForm.get('quebec'); }
  
  get usdot() { return this.carrierDetailsForm.get('usdot'); }
  
  get usdotpin() { return this.carrierDetailsForm.get('usdotpin'); }
  
  get mcn() { return this.carrierDetailsForm.get('mcn'); }
  
  get mcpu() { return this.carrierDetailsForm.get('mcpu'); }
  
  get mcpin() { return this.carrierDetailsForm.get('mcpin'); }
  
  get ein() { return this.carrierDetailsForm.get('ein'); }
  
  get irp() { return this.carrierDetailsForm.get('irp'); }
  
  get kyu() { return this.carrierDetailsForm.get('kyu'); }
  
  get nmwdt() { return this.carrierDetailsForm.get('nmwdt'); }
  
  get nyhut() { return this.carrierDetailsForm.get('nyhut'); }
  
  get oregon() { return this.carrierDetailsForm.get('oregon'); }
  
  get uscbp() { return this.carrierDetailsForm.get('uscbp'); }
  
  get scac() { return this.carrierDetailsForm.get('scac'); }
  
  
  ngOnInit() {
    this.carrierType = '1';
    this.addItem();
    this.getCorporateInformation({},"");
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[1];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
  }
  
  getCorporateInformation(filter,from) {
    this.filesToUpload = [];
    filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getCorporateInformation(filter).then(data => {
      if(data.success) {
        this.information = data.results;
        this.tableList = this.information[0].trs_tbl_corporate_info_documents;
        this.totalCount = data.results.length;
        if(from == "forAnyObj")
        this.anyObjToCompare = 0;
        else  
        this.anyObjToCompare = data.results.length;
        if(data.results.length) {
          for(let i = 0 ; i < this.information[0].trs_tbl_corporate_info_documents.length; i++) {
            if(this.information[0].trs_tbl_corporate_info_documents[i].issue_date)
            this.information[0].trs_tbl_corporate_info_documents[i]['new_issue_date'] = this.information[0].trs_tbl_corporate_info_documents[i].issue_date.split('T')[0];
            if(this.information[0].trs_tbl_corporate_info_documents[i].exp_date)
            this.information[0].trs_tbl_corporate_info_documents[i]['new_expiry_date'] = this.information[0].trs_tbl_corporate_info_documents[i].exp_date.split('T')[0];
            if(this.information[0].trs_tbl_corporate_info_documents[i]['document_name'] == null)
            this.information[0].trs_tbl_corporate_info_documents[i]['reffer'] = 0;
            else 
            this.information[0].trs_tbl_corporate_info_documents[i]['reffer'] = this.information[0].trs_tbl_corporate_info_documents[i]['document_name'];
          }
          if(data.results[0].carrier_type == 3) {
            this.iscanCanadaTravel = true;
            this.isUsInternationalTravel = false;
            this.isUsUsTravel = false;
            this.iscanInternationalTravel = false;
          }
          if(data.results[0].carrier_type == 2) {
            this.iscanCanadaTravel = false;
            this.isUsInternationalTravel = true;
            this.isUsUsTravel = false;
            this.iscanInternationalTravel = false;
          }
          if(data.results[0].carrier_type == 1) {
            this.iscanCanadaTravel = false;
            this.isUsInternationalTravel = false;
            this.isUsUsTravel = true;
            this.iscanInternationalTravel = false;
          }
          if(data.results[0].carrier_type == 4) {
            this.iscanCanadaTravel = false;
            this.isUsInternationalTravel = false;
            this.isUsUsTravel = false;
            this.iscanInternationalTravel = true;
          }
          if(this.information[0].trs_tbl_corporate_info_documents.length) {
            this.showEmptyDocs = false;
          }
          this.commanDetailsForm.controls['companyLegalName'].setValue(this.information[0].company_legal_name);
          this.commanDetailsForm.controls['companyDba'].setValue(this.information[0].company_dba);
          this.commanDetailsForm.controls['country'].setValue(this.information[0].country_id);
          this.commanDetailsForm.controls['state'].setValue(this.information[0].state_id);
          this.commanDetailsForm.controls['city'].setValue(this.information[0].city);
          this.commanDetailsForm.controls['address1'].setValue(this.information[0].address_1);
          // this.commanDetailsForm.controls['address2'].setValue(this.information[0].address_2);
          this.commanDetailsForm.controls['zipcode'].setValue(this.information[0].zip_code);
          this.commanDetailsForm.controls['telephone'].setValue(this.information[0].telephone);
          this.commanDetailsForm.controls['fax'].setValue(this.information[0].fax);
          this.carrierDetailsForm.controls['usdot'].setValue(this.information[0].us_dot);
          this.carrierDetailsForm.controls['usdotpin'].setValue(this.information[0].us_dot_pin);
          this.carrierDetailsForm.controls['mcn'].setValue(this.information[0].mc_number);
          this.carrierDetailsForm.controls['mcpu'].setValue(this.information[0].mc_portal_user);
          this.carrierDetailsForm.controls['mcpin'].setValue(this.information[0].mc_pin);
          this.carrierDetailsForm.controls['ein'].setValue(this.information[0].employee_id_number);
          this.carrierDetailsForm.controls['ifta'].setValue(this.information[0].ifta_account);
          this.carrierDetailsForm.controls['irp'].setValue(this.information[0].irp_account);
          // this.carrierDetailsForm.controls['irpf1'].setValue(this.information[0].irp_fleet_1_exp);
          // this.carrierDetailsForm.controls['irpf2'].setValue(this.information[0].irp_fleet_2_exp);
          this.carrierDetailsForm.controls['ic'].setValue(this.information[0].ins_company);
          this.carrierDetailsForm.controls['ip'].setValue(this.information[0].ins_policy);
          this.carrierDetailsForm.controls['iped'].setValue(this.information[0].ins_policy_exp);
          this.carrierDetailsForm.controls['kyu'].setValue(this.information[0].kyu);
          this.carrierDetailsForm.controls['nmwdt'].setValue(this.information[0].nm_wdt);
          this.carrierDetailsForm.controls['nyhut'].setValue(this.information[0].ny_hut);
          this.carrierDetailsForm.controls['oregon'].setValue(this.information[0].oregon_mc_permit);
          this.carrierDetailsForm.controls['scac'].setValue(this.information[0].scac_code);
          this.carrierDetailsForm.controls['nsc'].setValue(this.information[0].national_safety_code);
          this.carrierDetailsForm.controls['fbc'].setValue(this.information[0].federal_business);
          this.carrierDetailsForm.controls['uscbp'].setValue(this.information[0].us_cbp_dtops_acc);
          this.carrierDetailsForm.controls['quebec'].setValue(this.information[0].quebec_neq);
          this.getStatesDropdown(this.information[0].country_id);
        }
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
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
  
  openDeleteDialog(data) {
    // let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
    //   data: data[0],
    //   height: 'auto',
    //   width: 'auto',
    //   autoFocus: false
    // });
    
    // dialogRef.afterClosed().subscribe(data => {
    // if (data != null && data !== undefined) {
    // let finalObj = {};
    // finalObj['us_dot'] = null;
    // finalObj['us_dot_pin'] = null;
    // finalObj['mc_number'] = null;
    // finalObj['mc_pin'] = null;
    // finalObj['employee_id_number'] = null;
    // finalObj['ifta_account'] = null;
    // finalObj['irp_account'] = null;
    // finalObj['irp_fleet_1_exp'] = null;
    // finalObj['irp_fleet_2_exp'] = null;
    // finalObj['ins_policy'] = null;
    // finalObj['ins_policy_exp'] = null;
    // finalObj['kyu'] = null;
    // finalObj['nm_wdt'] = null;
    // finalObj['ny_hut'] = null;
    // finalObj['oregon_mc_permit'] = null;
    // finalObj['scac_code'] = null;
    // finalObj['quebec_neq'] = null;
    // finalObj['ins_company'] = null;
    // finalObj['us_cbp_dtops_acc'] = null;
    // finalObj['national_safety_code'] = null;
    // finalObj['federal_business'] = null;
    // finalObj['corporate_information_id'] = this.information[0].corporate_information_id;
    // this.carrierService.updateCorporateInfo(finalObj).then(data => {
    // if(data.success) {
    // this.deleteVisit("from",this.information[0].corporate_information_id);
    // this.getCorporateInformation({},'forAnyObj');
    this.anyObjToCompare = 0;
    // }
    // else {
    //   this.alertService.createAlert(data.message,0);
    // }
    // })
    // }
    // });
  }
  
  deleteVisit(item,id){
    let finalObj = {};
    if(item == "from" && id != null) {
      finalObj['corporate_information_id'] = id;
    }
    else {
      finalObj['from'] = 1;
      finalObj['document_id'] = item.document_id;
    }
    finalObj['is_deleted'] = 1;
    this.carrierService.deleteCoroperateDoc(finalObj).then(data => {
      if(data.success) {
        if(item == "from") {
          this.getCorporateInformation({},'forAnyObj');
        }
        else {
          this.alertService.createAlert("Document deleted successfully",1);
          this.getCorporateInformation({},"");
        }
        
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  noWhiteSpaceValidator(control: FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid = !isWhiteSpace;
    return isValid ? null : { 'whitespace': true };
  }
  
  onlyNumbers(event) {
    var k;
    k = event.charCode;
    return ((k > 47 && k < 58));
  }
  
  openComments(data) {
    let dialogRef = this.dialog.open(DocumentCommentsComponent, {
      data:data,
      height: 'auto',
      width: '400px',
      autoFocus: false
    });
    
    dialogRef.afterClosed().subscribe(prospects => {
      if(prospects == 'save') {
        this.getCorporateInformation({},"");
      }
    });
  }
  
  carrierTypeChange(event) {
    const selected = event.value;
    if (selected == '1') {
      // this.addItem();
      this.isUsUsTravel = true;
      this.carrierDetailsForm.controls['usdot'].setValidators(null);
      this.carrierDetailsForm.controls['usdotpin'].setValidators(null);
      this.carrierDetailsForm.controls['mcn'].setValidators(null);
      this.carrierDetailsForm.controls['mcpu'].setValidators(null);
      this.carrierDetailsForm.controls['mcpin'].setValidators(null);
      this.carrierDetailsForm.controls['ein'].setValidators(null);
      this.carrierDetailsForm.controls['ifta'].setValidators(null);
      this.carrierDetailsForm.controls['irp'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf1'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf2'].setValidators(null);
      this.carrierDetailsForm.controls['ic'].setValidators(null);
      this.carrierDetailsForm.controls['ip'].setValidators(null);
      this.carrierDetailsForm.controls['iped'].setValidators(null);
      this.carrierDetailsForm.controls['kyu'].setValidators(null);
      this.carrierDetailsForm.controls['nmwdt'].setValidators(null);
      this.carrierDetailsForm.controls['nyhut'].setValidators(null);
      this.carrierDetailsForm.controls['oregon'].setValidators(null);
      this.carrierDetailsForm.controls['scac'].setValidators(null);
      this.carrierDetailsForm.controls['nsc'].setValidators(null);
      this.carrierDetailsForm.controls['fbc'].setValidators(null);
      this.carrierDetailsForm.controls['uscbp'].setValidators(null);
      this.carrierDetailsForm.controls['quebec'].setValidators(null);
      this.isUsInternationalTravel = false;
      this.iscanCanadaTravel = false;
      this.iscanInternationalTravel = false;
    } else if (selected == '2') {
      // this.addItem();
      this.isUsInternationalTravel = true;
      this.carrierDetailsForm.controls['usdot'].setValidators(null);
      this.carrierDetailsForm.controls['usdotpin'].setValidators(null);
      this.carrierDetailsForm.controls['mcn'].setValidators(null);
      this.carrierDetailsForm.controls['mcpu'].setValidators(null);
      this.carrierDetailsForm.controls['mcpin'].setValidators(null);
      this.carrierDetailsForm.controls['ein'].setValidators(null);
      this.carrierDetailsForm.controls['ifta'].setValidators(null);
      this.carrierDetailsForm.controls['irp'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf1'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf2'].setValidators(null);
      this.carrierDetailsForm.controls['ic'].setValidators(null);
      this.carrierDetailsForm.controls['ip'].setValidators(null);
      this.carrierDetailsForm.controls['iped'].setValidators(null);
      this.carrierDetailsForm.controls['kyu'].setValidators(null);
      this.carrierDetailsForm.controls['nmwdt'].setValidators(null);
      this.carrierDetailsForm.controls['nyhut'].setValidators(null);
      this.carrierDetailsForm.controls['oregon'].setValidators(null);
      this.carrierDetailsForm.controls['scac'].setValidators(null);
      this.carrierDetailsForm.controls['nsc'].setValidators(null);
      this.carrierDetailsForm.controls['fbc'].setValidators(null);
      this.carrierDetailsForm.controls['uscbp'].setValidators(null);
      this.carrierDetailsForm.controls['quebec'].setValidators(null);
      this.isUsUsTravel = false;
      this.iscanCanadaTravel = false;
      this.iscanInternationalTravel = false;
    } else if (selected == '3') {
      // this.addItem();
      this.iscanCanadaTravel = true;
      this.carrierDetailsForm.controls['usdot'].setValidators(null);
      this.carrierDetailsForm.controls['usdotpin'].setValidators(null);
      this.carrierDetailsForm.controls['mcn'].setValidators(null);
      this.carrierDetailsForm.controls['mcpu'].setValidators(null);
      this.carrierDetailsForm.controls['mcpin'].setValidators(null);
      this.carrierDetailsForm.controls['ein'].setValidators(null);
      this.carrierDetailsForm.controls['ifta'].setValidators(null);
      this.carrierDetailsForm.controls['irp'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf1'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf2'].setValidators(null);
      this.carrierDetailsForm.controls['ic'].setValidators(null);
      this.carrierDetailsForm.controls['ip'].setValidators(null);
      this.carrierDetailsForm.controls['iped'].setValidators(null);
      this.carrierDetailsForm.controls['kyu'].setValidators(null);
      this.carrierDetailsForm.controls['nmwdt'].setValidators(null);
      this.carrierDetailsForm.controls['nyhut'].setValidators(null);
      this.carrierDetailsForm.controls['oregon'].setValidators(null);
      this.carrierDetailsForm.controls['scac'].setValidators(null);
      this.carrierDetailsForm.controls['nsc'].setValidators(null);
      this.carrierDetailsForm.controls['fbc'].setValidators(null);
      this.carrierDetailsForm.controls['uscbp'].setValidators(null);
      this.carrierDetailsForm.controls['quebec'].setValidators(null);
      this.isUsInternationalTravel = false;
      this.isUsUsTravel = false;
      this.iscanInternationalTravel = false;
    } else if (selected == '4') {
      // this.addItem();
      this.iscanInternationalTravel = true;
      this.carrierDetailsForm.controls['usdot'].setValidators(null);
      this.carrierDetailsForm.controls['usdotpin'].setValidators(null);
      this.carrierDetailsForm.controls['mcn'].setValidators(null);
      this.carrierDetailsForm.controls['mcpu'].setValidators(null);
      this.carrierDetailsForm.controls['mcpin'].setValidators(null);
      this.carrierDetailsForm.controls['ein'].setValidators(null);
      this.carrierDetailsForm.controls['ifta'].setValidators(null);
      this.carrierDetailsForm.controls['irp'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf1'].setValidators(null);
      // this.carrierDetailsForm.controls['irpf2'].setValidators(null);
      this.carrierDetailsForm.controls['ic'].setValidators(null);
      this.carrierDetailsForm.controls['ip'].setValidators(null);
      this.carrierDetailsForm.controls['iped'].setValidators(null);
      this.carrierDetailsForm.controls['kyu'].setValidators(null);
      this.carrierDetailsForm.controls['nmwdt'].setValidators(null);
      this.carrierDetailsForm.controls['nyhut'].setValidators(null);
      this.carrierDetailsForm.controls['oregon'].setValidators(null);
      this.carrierDetailsForm.controls['scac'].setValidators(null);
      this.carrierDetailsForm.controls['nsc'].setValidators(null);
      this.carrierDetailsForm.controls['fbc'].setValidators(null);
      this.carrierDetailsForm.controls['uscbp'].setValidators(null);
      this.carrierDetailsForm.controls['quebec'].setValidators(null);
      this.iscanCanadaTravel = false;
      this.isUsInternationalTravel = false;
      this.isUsUsTravel = false;
    }
  }
  
  handleFileSelect(event) {
    
    this.filesToUpload.push(event.target.files[0])
    // this.filesToUpload = event.target.files[0];
  }
  // removeItem(index){
  //   this.allFields.splice(index, 1);
  // }
  
  saveInformation() {
    let finalObj = {};
    let finalDocData = [];
    const formData: FormData = new FormData();
    finalObj['company_legal_name'] = this.commanDetailsForm.value.companyLegalName;
    finalObj['company_dba'] = this.commanDetailsForm.value.companyDba;
    finalObj['country_id'] = this.commanDetailsForm.value.country;
    finalObj['state_id'] = this.commanDetailsForm.value.state
    finalObj['city'] = this.commanDetailsForm.value.city
    finalObj['address_1'] = this.commanDetailsForm.value.address1;
    // finalObj['address_2'] = this.commanDetailsForm.value.address2;
    finalObj['zip_code'] = this.commanDetailsForm.value.zipcode;
    finalObj['telephone'] = this.commanDetailsForm.value.telephone;
    finalObj['fax'] = this.commanDetailsForm.value.fax;
    finalObj['carrier_type'] = this.carrierType;
    finalObj['us_dot'] = this.carrierDetailsForm.value.usdot;
    finalObj['us_dot_pin'] = this.carrierDetailsForm.value.usdotpin;
    finalObj['mc_number'] = this.carrierDetailsForm.value.mcn;
    finalObj['mc_portal_user'] = this.carrierDetailsForm.value.mcpu;
    finalObj['mc_pin'] = this.carrierDetailsForm.value.mcpin;
    finalObj['employee_id_number'] = this.carrierDetailsForm.value.ein;
    finalObj['ifta_account'] = this.carrierDetailsForm.value.ifta;
    finalObj['irp_account'] = this.carrierDetailsForm.value.irp;
    //finalObj['carrier_id'] = 1;
    // finalObj['carrier_id'] = 1;
    // finalObj['irp_fleet_1_exp'] = this.carrierDetailsForm.value.irpf1;
    // finalObj['irp_fleet_2_exp'] = this.carrierDetailsForm.value.irpf2;
    finalObj['ins_policy'] = this.carrierDetailsForm.value.ip;
    finalObj['ins_policy_exp'] = this.carrierDetailsForm.value.iped;
    finalObj['kyu'] = this.carrierDetailsForm.value.kyu;
    finalObj['nm_wdt'] = this.carrierDetailsForm.value.nmwdt;
    finalObj['ny_hut'] = this.carrierDetailsForm.value.nyhut;
    finalObj['oregon_mc_permit'] = this.carrierDetailsForm.value.oregon;
    finalObj['scac_code'] = this.carrierDetailsForm.value.scac;
    finalObj['quebec_neq'] = this.carrierDetailsForm.value.quebec
    finalObj['ins_company'] = this.carrierDetailsForm.value.ic;
    finalObj['us_cbp_dtops_acc'] = this.carrierDetailsForm.value.uscbp;
    finalObj['national_safety_code'] = this.carrierDetailsForm.value.nsc;
    finalObj['federal_business'] = this.carrierDetailsForm.value.fbc;
    finalObj['docsLength'] = this.filesToUpload.length;
    // if(this.filesToUpload.length){
    //   for(let i in this.filesToUpload){
    //     if((this.carrierDetailsForm.value.jobCodeDetails[i].docType == null) || (this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect == null)){
    //       this.showEmpty = true;
    //       console.log(this.showEmpty)
    //     }
    //     else {
    //       this.showEmpty = false;
    //       console.log('here')
    //     }
    //   }
    //  }
    if(!this.showEmpty){
      finalObj['documents'] = this.carrierDetailsForm.value.jobCodeDetails;
      finalObj['notification_message'] = "New Document available for Download in Corporate";
      finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      console.log(finalObj);
      for(let i = 0 ; i < this.filesToUpload.length ; i++) {
        formData.append('filesnew'+i, this.filesToUpload[i]);
      }
      formData.append('filesnew',JSON.stringify(this.filesToUpload));
      formData.append('corpinfodata',JSON.stringify(finalObj));
      for (let i in this.carrierDetailsForm.value.jobCodeDetails){
        let issDate = null;
        let expDate = null;
        if(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate) {
          issDate = new Date(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate);
        }
        if(this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          expDate = new Date(this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate);
        }
        if(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
            "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
            "appAccess" : this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
        if(!this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && !this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : null,
            "expiryDate" : null,
            "appAccess" : this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
        if(!this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : null,
            "appAccess" : this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
        if(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && !this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
            "expiryDate" : null,
            "appAccess" : this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
      }
      formData.append('documentsData',JSON.stringify(finalDocData));
      console.log(formData);
      this.carrierService.addCorporateInfo(formData).then(data => {
        if(data.success) {
          finalDocData = [];
          for(let i = 0 ; i < this.filesToUpload.length; i++) {
            this.jobCodeArryForm.removeAt(0);
          }
          if(this.filesToUpload.length)
          this.addItem();
          this.alertService.createAlert("Corporate Info Added Successfully",1);
          this.getCorporateInformation({},"");
        }
        else {
          finalDocData = [];
          this.alertService.createAlert(data.message,0);
        }
      });
    } else {
      this.alertService.createAlert("docType / File is missing",0);
    }
    // console.log(this.filesToUpload.length);
  }
  
  // updateInformation() {
  //   let finalObj = {};
  //   finalObj['corporate_information_id'] = this.information[0].corporate_information_id;
  //   finalObj['company_legal_name'] = this.commanDetailsForm.value.companyLegalName;
  //   finalObj['company_dba'] = this.commanDetailsForm.value.companyDba;
  //   if(this.commanDetailsForm.value.country)
  //   finalObj['country_id'] = this.commanDetailsForm.value.country;
  //   else 
  //   finalObj['country_id'] = this.information[0].country_id;
  //   if(this.commanDetailsForm.value.state)
  //   finalObj['state_id'] = this.commanDetailsForm.value.state;
  //   else 
  //   finalObj['state_id'] = this.information[0].state_id;
  //   finalObj['city'] = this.commanDetailsForm.value.city;
  //   finalObj['address_1'] = this.commanDetailsForm.value.address1;
  //   finalObj['address_2'] = this.commanDetailsForm.value.address2;
  //   finalObj['zip_code'] = this.commanDetailsForm.value.zipcode;
  //   finalObj['telephone'] = this.commanDetailsForm.value.telephone;
  //   finalObj['fax'] = this.commanDetailsForm.value.fax;
  //   finalObj['carrier_type'] = this.information[0].carrier_type;
  //   finalObj['us_dot'] = this.carrierDetailsForm.value.usdot;
  //   finalObj['us_dot_pin'] = this.carrierDetailsForm.value.usdotpin;
  //   finalObj['mc_number'] = this.carrierDetailsForm.value.mcn;
  //   finalObj['mc_pin'] = this.carrierDetailsForm.value.mcpin;
  //   finalObj['employee_id_number'] = this.carrierDetailsForm.value.ein;
  //   finalObj['ifta_account'] = this.carrierDetailsForm.value.ifta;
  //   finalObj['irp_account'] = this.carrierDetailsForm.value.irp;
  //   finalObj['carrier_id'] = 1;
  //   finalObj['irp_fleet_1_exp'] = this.carrierDetailsForm.value.irpf1;
  //   finalObj['irp_fleet_2_exp'] = this.carrierDetailsForm.value.irpf2;
  //   finalObj['ins_policy'] = this.carrierDetailsForm.value.ip;
  //   finalObj['ins_policy_exp'] = this.carrierDetailsForm.value.iped;
  //   finalObj['kyu'] = this.carrierDetailsForm.value.kyu;
  //   finalObj['nm_wdt'] = this.carrierDetailsForm.value.nmwdt;
  //   finalObj['ny_hut'] = this.carrierDetailsForm.value.nyhut;
  //   finalObj['oregon_mc_permit'] = this.carrierDetailsForm.value.oregon;
  //   finalObj['scac_code'] = this.carrierDetailsForm.value.scac;
  //   finalObj['quebec_neq'] = this.carrierDetailsForm.value.quebec
  //   finalObj['ins_company'] = this.carrierDetailsForm.value.ic;
  //   finalObj['us_cbp_dtops_acc'] = this.carrierDetailsForm.value.uscbp;
  //   finalObj['national_safety_code'] = this.carrierDetailsForm.value.nsc;
  //   finalObj['federal_business'] = this.carrierDetailsForm.value.fbc;
  //   this.carrierService.updateCorporateInfo(finalObj).then(data => {
  //     if(data.success) {
  //       this.alertService.createAlert("Data updated successfully",1);
  //       this.getCorporateInformation({});
  //     }
  //     else {
  //       this.alertService.createAlert(data.message,0);
  //     }
  //   })
  // }
  
  
  updateInformation() {
    let finalObj = {};
    let finalDocData = [];
    const formData: FormData = new FormData();
    finalObj['corporate_information_id'] = this.information[0].corporate_information_id;
    finalObj['company_legal_name'] = this.commanDetailsForm.value.companyLegalName;
    finalObj['company_dba'] = this.commanDetailsForm.value.companyDba;
    if(this.commanDetailsForm.value.country)
    finalObj['country_id'] = this.commanDetailsForm.value.country;
    else 
    finalObj['country_id'] = this.information[0].country_id;
    if(this.commanDetailsForm.value.state)
    finalObj['state_id'] = this.commanDetailsForm.value.state;
    else 
    finalObj['state_id'] = this.information[0].state_id;
    finalObj['city'] = this.commanDetailsForm.value.city;
    finalObj['address_1'] = this.commanDetailsForm.value.address1;
    // finalObj['address_2'] = this.commanDetailsForm.value.address2;
    finalObj['zip_code'] = this.commanDetailsForm.value.zipcode;
    finalObj['telephone'] = this.commanDetailsForm.value.telephone;
    finalObj['fax'] = this.commanDetailsForm.value.fax;
    if(!this.anyObjToCompare)
    finalObj['carrier_type'] = this.carrierType;
    else
    finalObj['carrier_type'] = this.information[0].carrier_type;
    finalObj['us_dot'] = this.carrierDetailsForm.value.usdot;
    finalObj['us_dot_pin'] = this.carrierDetailsForm.value.usdotpin;
    finalObj['mc_number'] = this.carrierDetailsForm.value.mcn;
    finalObj['mc_portal_user'] = this.carrierDetailsForm.value.mcpu;
    finalObj['mc_pin'] = this.carrierDetailsForm.value.mcpin;
    finalObj['employee_id_number'] = this.carrierDetailsForm.value.ein;
    finalObj['ifta_account'] = this.carrierDetailsForm.value.ifta;
    finalObj['irp_account'] = this.carrierDetailsForm.value.irp;
    // finalObj['carrier_id'] = 1;
    // finalObj['irp_fleet_1_exp'] = this.carrierDetailsForm.value.irpf1;
    // finalObj['irp_fleet_2_exp'] = this.carrierDetailsForm.value.irpf2;
    finalObj['ins_policy'] = this.carrierDetailsForm.value.ip;
    finalObj['ins_policy_exp'] = this.carrierDetailsForm.value.iped;
    finalObj['kyu'] = this.carrierDetailsForm.value.kyu;
    finalObj['nm_wdt'] = this.carrierDetailsForm.value.nmwdt;
    finalObj['ny_hut'] = this.carrierDetailsForm.value.nyhut;
    finalObj['oregon_mc_permit'] = this.carrierDetailsForm.value.oregon;
    finalObj['scac_code'] = this.carrierDetailsForm.value.scac;
    finalObj['quebec_neq'] = this.carrierDetailsForm.value.quebec
    finalObj['ins_company'] = this.carrierDetailsForm.value.ic;
    finalObj['us_cbp_dtops_acc'] = this.carrierDetailsForm.value.uscbp;
    finalObj['national_safety_code'] = this.carrierDetailsForm.value.nsc;
    finalObj['federal_business'] = this.carrierDetailsForm.value.fbc;
    finalObj['docsLength'] = this.filesToUpload.length;
    // if(this.carrierDetailsForm.value.jobCodeDetails){
    //   for (let i in this.carrierDetailsForm.value.jobCodeDetails){
    //     if((this.carrierDetailsForm.value.jobCodeDetails[i].docType == null) || (this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect == null)){
    //          this.showEmpty = true;
    //           }
    //           else {
    //            this.showEmpty = false; 
    //           }
    //      }
    // }
    if(!this.showEmpty){
      finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      finalObj['notification_message'] = "New Document available for Download in Corporate";
      finalObj['documents'] = this.carrierDetailsForm.value.jobCodeDetails;
      for(let i = 0 ; i < this.filesToUpload.length ; i++) {
        formData.append('filesnew'+i, this.filesToUpload[i]);
      }
      formData.append('corpinfodata',JSON.stringify(finalObj));
      for (let i in this.carrierDetailsForm.value.jobCodeDetails){
        let issDate = null;
        let expDate = null;
        if(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate) {
          issDate = new Date(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate);
        }
        if(this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          expDate = new Date(this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate);
        }
        if(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
            "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
            "appAccess": this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
        if(!this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && !this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : null,
            "expiryDate" : null,
            "appAccess": this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
        if(!this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : null,
            "appAccess": this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
        if(this.carrierDetailsForm.value.jobCodeDetails[i].issueDate && !this.carrierDetailsForm.value.jobCodeDetails[i].expiryDate) {
          finalDocData.push({
            "docType" : this.carrierDetailsForm.value.jobCodeDetails[i].docType,
            "docRef" : this.carrierDetailsForm.value.jobCodeDetails[i].docRef,
            "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
            "expiryDate" : null,
            "appAccess": this.carrierDetailsForm.value.jobCodeDetails[i].appAccess,
            "filesSelect" : this.carrierDetailsForm.value.jobCodeDetails[i].filesSelect
          })
        }
      }
      formData.append('documentsData',JSON.stringify(finalDocData));
      this.carrierService.updateCorporateDocumentInfo(formData).then(data => {
        if(data.success) {
          finalDocData = []
          for(let i = 0 ; i < this.filesToUpload.length; i++) {
            this.jobCodeArryForm.removeAt(0);
          }
          if(this.filesToUpload.length) {
            this.addItem();
          }
          this.getCorporateInformation({},"");
          this.alertService.createAlert("Corporate Info Updated Successfully",1);
          this.anyObjToCompare = 1;
        }
        else {
          finalDocData = []
          this.alertService.createAlert(data.message,0);
        }
      });
    } else {
      finalDocData = []
      this.alertService.createAlert("docType / File is missing",0);
    }
    
  }
}
