import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../../carriers.service';

@Component({
  selector: 'app-ifta-document',
  templateUrl: './ifta-document.component.html',
  styleUrls: ['./ifta-document.component.scss']
})
export class IftaDocumentComponent implements OnInit {

  docxForm: FormGroup;
  fileToUpload:any;

  constructor(public alertService:AlertService,public carrierService:CarriersService,public fb:FormBuilder,public dialogRef: MatDialogRef<IftaDocumentComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {
    this.createFormBuild();
   }

  ngOnInit() {
    console.log(this.data);
  }

  handleFileSelect(event) {
    this.fileToUpload = event.target.files[0];
  }

  get filesSelect() { return this.docxForm.get('filesSelect'); }

  createFormBuild() {
    this.docxForm = this.fb.group({
      filesSelect : new FormControl('',[Validators.required])
    })
  }

  saveYear(){
    let finalObj = {};
     const formData: FormData = new FormData();
      finalObj['ifta_year_id'] = this.data;
      formData.append('data',JSON.stringify(finalObj));
      formData.append('fileKey',this.fileToUpload);
     this.carrierService.updateIftaYearDoc(formData).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document added successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
}

  close(): void {
    this.dialogRef.close();
  }
}
