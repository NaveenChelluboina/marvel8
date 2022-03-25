import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CarriersService } from '../../carriers.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-add-new-driverdocument',
  templateUrl: './add-new-driverdocument.component.html',
  styleUrls: ['./add-new-driverdocument.component.scss']
})
export class AddNewDriverdocumentComponent implements OnInit {
  
  docxForm:FormGroup;
  jobCodeArryForm: FormArray;
  filesToUpload = [];
  tableList:any;
  referenceAssending:boolean = false;
  issueAssending:boolean = false;
  expAssending:boolean = false;
  appAssending: boolean = false;
  fileToUpload:any;
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this?';
  public cancelClicked: boolean = false;
  showEmpty : boolean = true;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  public is_selected: boolean = false;
  
  constructor(public alertService:AlertService,public carrierService:CarriersService,public fb:FormBuilder,public dialogRef: MatDialogRef<AddNewDriverdocumentComponent>,@Inject(MAT_DIALOG_DATA) public attorney: any) { 
    this.createDocxForm();
  }
  
  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[2];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    this.addItem();
    if(this.attorney.trs_tbl_driver_documents.length) {
      this.showEmpty = false;
    }
    else {
      this.showEmpty = true;
    }
    for(let i = 0; i < this.attorney.trs_tbl_driver_documents.length; i++) {
      if(this.attorney.trs_tbl_driver_documents[i].issue_date)
      this.attorney.trs_tbl_driver_documents[i]['new_issue_date'] = this.attorney.trs_tbl_driver_documents[i].issue_date.split('T')[0];
      else 
      this.attorney.trs_tbl_driver_documents[i]['new_issue_date'] = "-";
      if(this.attorney.trs_tbl_driver_documents[i].exp_date)
      this.attorney.trs_tbl_driver_documents[i]['new_expiry_date'] = this.attorney.trs_tbl_driver_documents[i].exp_date.split('T')[0];
      else 
      this.attorney.trs_tbl_driver_documents[i]['new_expiry_date'] = "-";
      if(this.attorney.trs_tbl_driver_documents[i]['document_name'] == null)
      this.attorney.trs_tbl_driver_documents[i]['reffer'] = 0;
      else 
      this.attorney.trs_tbl_driver_documents[i]['reffer'] = this.attorney.trs_tbl_driver_documents[i]['document_name'];
    }
    this.tableList = this.attorney.trs_tbl_driver_documents;
    // this.tableList = [
    //   {docuName:"fabrice_oral_gluso_tolerance.pdf" , docuType:"Oral glucose"},
    //   {docuName:"fabrice_mri_report.pdf" , docuType:"MRI report"},
    //   {docuName:"fabrice_xray.docx" , docuType:"Xray"}
    // ]
  }
  
  Refclicked(order) {
    if(order) {
      this.tableList.sort(function(a, b) {
        var titleA = a.reffer.toString().toLowerCase(), titleB = b.reffer.toString().toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.tableList.sort(function(a, b) {
        var titleA = b.reffer.toString().toLowerCase(), titleB = a.reffer.toString().toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  appAccessAssending(order) {
    if(order) {
      this.tableList.sort(function(a, b) {
        var titleA = a.app_access, titleB = b.app_access;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.tableList.sort(function(a, b) {
        var titleA = b.app_access, titleB = a.app_access;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  issueDateClicked(order) {
    if(order) {
      this.tableList.sort(function(a, b) {
        var dateA = new Date(a.issue_date).valueOf(), dateB = new Date(b.issue_date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.tableList.sort(function(a, b) {
        var dateA = new Date(a.issue_date).valueOf(), dateB = new Date(b.issue_date).valueOf();
        return dateB - dateA;
      });
    }
    
  }
  
  expDateClicked(order) {
    if(order) {
      this.tableList.sort(function(a, b) {
        var dateA = new Date(a.exp_date).valueOf(), dateB = new Date(b.exp_date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.tableList.sort(function(a, b) {
        var dateA = new Date(a.exp_date).valueOf(), dateB = new Date(b.exp_date).valueOf();
        return dateB - dateA;
      });
    }
  }
  
  // handleFileSelect(event) {
  //   this.fileToUpload = event.target.files[0];
  //   // this.filesToUpload = event.target.files[0];
  // }
  
  createDocxForm() {
    this.docxForm = this.fb.group({
      jobCodeDetails : new FormArray([]),
    })
  }
  
  createItem(docType, docRef, issueDate, expiryDate,appAccess, filesSelect): FormGroup {
    return this.fb.group({
      docType: [docType],
      docRef: [docRef,[Validators.maxLength(50)]],
      issueDate: [issueDate],
      expiryDate: [expiryDate],
      appAccess: [appAccess],
      filesSelect: [filesSelect, [Validators.required]],
    });
  }
  
  addItem(): void {
    this.jobCodeArryForm = this.docxForm.get('jobCodeDetails') as FormArray;
    this.jobCodeArryForm.push(this.createItem("Driver", null, null, null, null,null));
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
  
  handleFileSelect(event) {
    this.filesToUpload.push(event.target.files[0])
    // this.filesToUpload = event.target.files[0];
  }
  
  // get docType() { return this.docxForm.get('docType'); }
  
  // get refNumber() { return this.docxForm.get('refNumber'); }
  
  // get addReceivedDate() { return this.docxForm.get('addReceivedDate'); }
  
  // get addExpDate() { return this.docxForm.get('addExpDate'); }
  
  // get filesSelect() { return this.docxForm.get('filesSelect'); }
  
  // createFormBuild() {
  //   this.docxForm = this.fb.group({
  //     docType : new FormControl('',[Validators.required]),
  //     refNumber : new FormControl('',[Validators.required]),
  //     addReceivedDate : new FormControl('',[Validators.required]),
  //     addExpDate : new FormControl('',[Validators.required]),
  //     filesSelect : new FormControl('',[Validators.required])
  //   })
  // }
  
  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }
  
  close(): void {
    this.dialogRef.close('save');
  }
  
  closeDocument() {
    //this.alertService.createAlert('Successfully Saved.', 1);
    this.dialogRef.close();
  }
  
  // deleteDocument(id,action) {
  //   let finalObj = {};
  //   finalObj['document_id'] = id;
  //   finalObj['is_deleted'] = 1;
  //   this.carrierService.updateDriverDocument(finalObj).then(data => {
  //     if(data.success) {
  //       this.alertService.createAlert("Document deleted successfully",1);
  //       this.dialogRef.close('save');
  //     }
  //     else {
  //       this.alertService.createAlert(data.message,0);
  //     }
  //   });
  // }
  
  saveAttorney() {
    
  }
  
  uploadDocx(){
    let finalObj = {};
    let finalDocData = [];
    const formData: FormData = new FormData();
    finalObj['docsLength'] = this.filesToUpload.length;
    finalObj['driver_id'] = this.attorney.driver_id;
    finalObj['notification_message'] = "New Document available for Download in My Docs";
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    for(let i = 0 ; i < this.filesToUpload.length ; i++) {
      formData.append('filesnew'+i, this.filesToUpload[i]);
    }
    // for changing the date to correct date
    for (let j in this.docxForm.value.jobCodeDetails){
      let issDate = null;
      let expDate = null;
      if(this.docxForm.value.jobCodeDetails[j].issueDate) {
        issDate = new Date(this.docxForm.value.jobCodeDetails[j].issueDate);
      }
      if(this.docxForm.value.jobCodeDetails[j].expiryDate) {
        expDate = new Date(this.docxForm.value.jobCodeDetails[j].expiryDate);
      }
      if(this.docxForm.value.jobCodeDetails[j].issueDate && this.docxForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[j].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[j].docRef,
          "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
          "appAccess" : this.docxForm.value.jobCodeDetails[j].appAccess,
          "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
          "filesSelect" : this.docxForm.value.jobCodeDetails[j].filesSelect
        })
      }
      if(!this.docxForm.value.jobCodeDetails[j].issueDate && !this.docxForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[j].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[j].docRef,
          "issueDate" : null,
          "appAccess" : this.docxForm.value.jobCodeDetails[j].appAccess,
          "expiryDate" : null,
          "filesSelect" : this.docxForm.value.jobCodeDetails[j].filesSelect
        })
      }
      if(!this.docxForm.value.jobCodeDetails[j].issueDate && this.docxForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[j].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[j].docRef,
          "issueDate" : null,
          "appAccess" : this.docxForm.value.jobCodeDetails[j].appAccess,
          "expiryDate" : expDate.setTime(expDate.getTime() + (330 * 60 * 1000)),
          "filesSelect" : this.docxForm.value.jobCodeDetails[j].filesSelect
        })
      }
      if(this.docxForm.value.jobCodeDetails[j].issueDate && !this.docxForm.value.jobCodeDetails[j].expiryDate) {
        finalDocData.push({
          "docType" : this.docxForm.value.jobCodeDetails[j].docType,
          "docRef" : this.docxForm.value.jobCodeDetails[j].docRef,
          "issueDate" : issDate.setTime(issDate.getTime() + (330 * 60 * 1000)),
          "expiryDate" : null,
          "appAccess" : this.docxForm.value.jobCodeDetails[j].appAccess,
          "filesSelect" : this.docxForm.value.jobCodeDetails[j].filesSelect
        })
      }
      
      
      
    }
    formData.append('documentsData',JSON.stringify(finalDocData));
    formData.append('driverInfo',JSON.stringify(finalObj));
    this.carrierService.addNewDriverDocuments(formData).then(data => {
      if(data.success) {
        finalDocData = [];
        this.alertService.createAlert("Document added successfully",1);
        this.dialogRef.close('save');
      }
      else {
        finalDocData = [];
        this.alertService.createAlert(data.message,0);
      }
    });
  }
  
  // uploadDocx() {
  //   let finalObj = {};
  //   const formData: FormData = new FormData();
  //   finalObj['driver_id'] = this.attorney.driver_id;
  //   finalObj['document_type'] = this.docxForm.value.docType;
  //   finalObj['ref_number'] = this.docxForm.value.refNumber;
  //   finalObj['issue_date'] = this.docxForm.value.addReceivedDate;
  //   finalObj['exp_date'] = this.docxForm.value.addExpDate;
  //   formData.append('documentData',JSON.stringify(finalObj));
  //   formData.append('fileKey',this.fileToUpload);
  //   this.carrierService.addNewDriverDocx(formData).then(data => {
  //     if(data.success) {
  //       this.alertService.createAlert("Document added successfully",1);
  //       this.dialogRef.close('save');
  //     }
  //     else {
  //       this.alertService.createAlert(data.message,0);
  //     }
  //   })
  // }
  
  omit_special_char(event) {
    var k;
    k=event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k > 47 && k < 58))
  }
  
  // omit_special_char(event) {
  //   var k;
  //   k=event.charCode;
  //   return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k > 47 && k < 58))
  // }
  
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

  changeappAccess(document) {
    let finalObj = {};
    finalObj['document_id'] = document.document_id;
    finalObj['app_access'] = !document.app_access;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    finalObj['notification_message'] = "New Document available for Download in My Docs";
    finalObj['driver_id'] = this.attorney.driver_id;
    this.carrierService.updateDriverDocuments(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document updated for app access successfully",1);
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }

}
