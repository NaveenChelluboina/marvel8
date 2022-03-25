import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-addnewassetdocument',
  templateUrl: './addnewassetdocument.component.html',
  styleUrls: ['./addnewassetdocument.component.scss']
})
export class AddnewassetdocumentComponent implements OnInit {
  
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  tableList:any;
  filesToUpload = [];
  docxForm: FormGroup;
  showEmpty: boolean = false;
  jobCodeArryForm: FormArray;
  referenceAssending:boolean = false;
  issueAssending:boolean = false;
  expAssending:boolean = false;
  appAssending: boolean = false;
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this record ?';
  public cancelClicked: boolean = false;
  public is_selected: boolean = false;
  
  constructor(public alertService:AlertService,public carrierService:CarriersService,public fb:FormBuilder,public dialogRef: MatDialogRef<AddnewassetdocumentComponent>,@Inject(MAT_DIALOG_DATA) public attorney: any) { 
    this.createFormBuild();
  }
  
  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[4];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    this.addItem();
    for(let i = 0; i < this.attorney.trs_tbl_asset_documents.length; i++) { 
      if(this.attorney.trs_tbl_asset_documents[i].issue_date)
      this.attorney.trs_tbl_asset_documents[i]['new_issue_date'] = this.attorney.trs_tbl_asset_documents[i].issue_date.split('T')[0];
      else 
      this.attorney.trs_tbl_asset_documents[i]['new_issue_date'] = "-";
      if(this.attorney.trs_tbl_asset_documents[i].exp_date)
      this.attorney.trs_tbl_asset_documents[i]['new_expiry_date'] = this.attorney.trs_tbl_asset_documents[i].exp_date.split('T')[0];
      else 
      this.attorney.trs_tbl_asset_documents[i]['new_expiry_date'] = "-";
      if(this.attorney.trs_tbl_asset_documents[i]['document_name'] == null)
      this.attorney.trs_tbl_asset_documents[i]['reffer'] = 0;
      else 
      this.attorney.trs_tbl_asset_documents[i]['reffer'] = this.attorney.trs_tbl_asset_documents[i]['document_name'];
    }
    this.tableList = this.attorney.trs_tbl_asset_documents;
    if(!this.tableList.length) {
      this.showEmpty = true;
    } else {
      this.showEmpty = false; 
    }
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
  
  handleFileSelect(event) {
    this.filesToUpload.push(event.target.files[0])
  }
  
  get docType() { return this.docxForm.get('docType'); }
  
  get docRef() { return this.docxForm.get('docRef'); }
  
  get issueDate() { return this.docxForm.get('issueDate'); }
  
  get expiryDate() { return this.docxForm.get('expiryDate'); }

  get appAccess() { return this.docxForm.get('appAccess'); }
  
  get filesSelect() { return this.docxForm.get('filesSelect'); }
  
  createFormBuild() {
    this.docxForm = this.fb.group({
      jobCodeDetails : new FormArray([]),
    })
  }
  
  createItem(docType, docRef, issueDate, expiryDate, appAccess, filesSelect): FormGroup {
    return this.fb.group({
      docType: [docType],
      docRef: [docRef,[Validators.maxLength(50)]],
      issueDate: [issueDate],
      expiryDate: [expiryDate],
      appAccess: [appAccess],
      filesSelect: [filesSelect, [Validators.required]],
    });
  }

  changeappAccess(document) {
    let finalObj = {};
    finalObj['asset_document_id'] = document.asset_document_id;
    finalObj['app_access'] = !document.app_access;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    finalObj['notification_message'] = "New Document available for Download in My Active Asset";
    this.carrierService.updateDocuments(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document updated for app access successfully",1);
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  addItem(): void {
    this.jobCodeArryForm = this.docxForm.get('jobCodeDetails') as FormArray;
    this.jobCodeArryForm.push(this.createItem("Assets", null, null, null, null,null));
  }
  
  removeItem(index) {
    this.jobCodeArryForm.removeAt(index);
  }
  
  close(): void {
    this.dialogRef.close('save');
  }
  
  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }
  
  closeDocument() {
    this.dialogRef.close();
  }
  
  uploadDocx() {
    let finalObj = {};
    let finalDocData = [];
    const formData: FormData = new FormData();
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
          "expiryDate" : null,
          "appAccess" : this.docxForm.value.jobCodeDetails[j].appAccess,
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
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    finalObj['notification_message'] = "New Document available for Download in My Active Asset";
    finalObj['docsLength'] = this.filesToUpload.length;
    finalObj['asset_id'] = this.attorney.asset_id;
    for(let i = 0 ; i < this.filesToUpload.length ; i++) {
      formData.append('filesnew'+i, this.filesToUpload[i]);
    }
    formData.append('documentsData',JSON.stringify(finalDocData));
    formData.append('assetsInfo',JSON.stringify(finalObj));
    this.carrierService.addNewAssetsDocx(formData).then(data => {
      if(data.success) {
        finalDocData = []
        this.alertService.createAlert("Document added successfully",1);
        this.dialogRef.close('save');
      }
      else {
        finalDocData = []
        this.alertService.createAlert(data.message,0);
      }
    });
  }
  
  deleteVisit(item){
    let finalObj = {};
    finalObj['asset_document_id'] = item.asset_document_id;
    finalObj['is_deleted'] = 1;
    this.carrierService.updateDocuments(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document deleted successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
}
