import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CarriersService } from '../../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-document-dialog',
  templateUrl: './document-dialog.component.html',
  styleUrls: ['./document-dialog.component.scss']
})
export class DocumentDialogComponent implements OnInit {
  fleets: any[] = [];
  years: any[] = [];
  filesToUpload = [];
  addDocumentForm: FormGroup;
  assetsArray: any[] = [];

  constructor(public carrierService:CarriersService, public alertService: AlertService,public dialogRef: MatDialogRef<DocumentDialogComponent>,public fb:FormBuilder,@Inject(MAT_DIALOG_DATA) public doc: any) {
     this.createAddDocumentForm()
  }

  ngOnInit() {
  //  this.getAllAssetsDropDown({});
    this.getFleetDropDown();
   if(this.doc){
    this.addDocumentForm.controls['fleetName'].setValue(this.doc.fleet_id);
    this.addDocumentForm.controls['documentName'].setValue(this.doc.doc_name);
    //this.addDocumentForm.controls['assetName'].setValue(this.doc.asset_id);
    this.addDocumentForm.controls['effectiveDate'].setValue(this.doc.start_date.split('T')[0]);
   }
  }

  get fleetName() { return this.addDocumentForm.get('fleetName'); }
  get documentName() { return this.addDocumentForm.get('documentName'); }
 // get assetName() { return this.addDocumentForm.get('assetName'); }
  get effectiveDate() { return this.addDocumentForm.get('effectiveDate'); }
  

  createAddDocumentForm(){
    this.addDocumentForm = this.fb.group({
      documentName : new FormControl('' , [Validators.maxLength(30) , Validators.required]),
      fleetName : new FormControl('',[Validators.required]),
     // assetName : new FormControl('',[Validators.required]),
      effectiveDate : new FormControl('',[Validators.required]),
      filesSelect: new FormControl(''),
    })
  }

  handleFileSelect(event) {
    this.filesToUpload.push(event.target.files[0])
  }

  close(): void {
    this.dialogRef.close();
  }

   getAllAssetsDropDown(filters){
    this.carrierService.getAssetsDropDown(filters).then(data => {
      if (data.success) {
        this.assetsArray = data.results;
      }
    })
   }

   fleetChanged(value){
     let finalobj = {};
     finalobj['fleet_id'] = value
     this.getIrpYearDropDown(finalobj);
   }

  selectAll(ev){
    if(ev._selected){
      let temp = [];
      for(let i = 0; i < this.assetsArray.length; i++) {
           temp.push(this.assetsArray[i]['asset_id']);
        }
      this.addDocumentForm.controls.assetName.setValue(temp);
      ev._selected=true;
    }
    if(ev._selected==false){
      this.addDocumentForm.controls.assetName.setValue([]);
    }
  }

   selectOne(ev) {
    ((this.assetsArray.length <= this.addDocumentForm.controls.assetName.value.length) && !ev._selected) ? ev.select() : ev.deselect();
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

  getIrpYearDropDown(filters) {
    this.carrierService.getIrpYearDropDown(filters).then(data => {
      if (data.success) {
        this.years = data.results;
      }
    })
  }
  
  saveDocument(){
   let finalObj = {};
   const formData: FormData = new FormData();
   finalObj['document_name'] = this.addDocumentForm.value.documentName;
   finalObj['fleet_id'] = this.addDocumentForm.value.fleetName;
   finalObj['effective_Date'] = this.addDocumentForm.value.effectiveDate;
   finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
   finalObj['docsLength'] = this.filesToUpload.length;
   formData.append('data',JSON.stringify(finalObj));
   for(let i = 0; i < this.filesToUpload.length ; i++) {
      formData.append('filesnew'+i,this.filesToUpload[i]);
    }
    this.carrierService.addIrpDocument(formData).then(data => {
      if(data.success) {
        this.alertService.createAlert("IRP Document added successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
}
