import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-upload-assets',
  templateUrl: './upload-assets.component.html',
  styleUrls: ['./upload-assets.component.scss'],
  providers: [AlertService]
})
export class UploadAssetsComponent implements OnInit {

  public IRSId : any;
  public Currentyear : any;
  assetsToAdd = [];
  documentsForm : FormGroup;
  new_added_documentation : any;
  fileToUpload: any;
  document : any;
  allAssets : any;
  is_year:any;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  constructor(public fb:FormBuilder,public route : ActivatedRoute ,public carrierService:CarriersService,private location:Location, private alertService: AlertService) {
    this.createDocxForm();
   }
  public screens = [
    {"name":"AK2569","name1":"BD2549","name2":"BE2549","name3":"DD2539","value1":"true","value2":"false","value3":"true","value4":"true"},
    {"name":"CH5628","name1":"BC2449","name2":"BD3529","name3":"DD2539","value1":true,"value2":true,"value3":true,"value4":true},
    {"name":"KL7854","name1":"BD2549","name2":"BE2549","name3":"DD2539","value1":true,"value2":true,"value3":true,"value4":true},
    {"name":"MN5823","name1":"BD2549","name2":"BE2549","name3":"DD2539","value1":true,"value2":true,"value3":true,"value4":true},
    {"name":"JH5522","name1":"BD2549","name2":"BE2549","name3":"DD2539","value1":true,"value2":true,"value3":true,"value4":true},
    {"name":"JH5523","name1":"BD2549","name2":"BE2949","name3":"DD2539","value1":true,"value2":true,"value3":true,"value4":true},
    {"name":"JH5232","name1":"BD3249","name2":"BE2349","name3":"DD2539","value1":true,"value2":true,"value3":true,"value4":true}
  ]

  createDocxForm() {
    this.documentsForm = this.fb.group({
      documentName : new FormControl('',[Validators.required , Validators.maxLength(50) , this.noWhiteSpaceValidator]),
      document : new FormControl('',[Validators.required])
    });
  }

  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }

  handleFileSelect(event) {
    this.fileToUpload = event.target.files[0];
    console.log(this.fileToUpload);
  }
  
  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[7];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    this.is_year = this.route.snapshot.paramMap.get('isYear');
    this.IRSId = this.route.snapshot.paramMap.get('irsId');
    if(this.is_year == 1)
      this.getAllAssets({}); 
    else {
      // this.getDocuments({});
      this.getAssetDocuments({});
    }
    if(sessionStorage.getItem('CurrentYear'))
      this.Currentyear = sessionStorage.getItem('CurrentYear');
      console.log("here");
  }

  // public getIRSYears(filter) {
  //   this.carrierService.getAllIRS(filter).then(data => {
  //     if(data.success) {
  //       console.log(data.results);
  //     }
  //     else {
  //       this.alertService.createAlert(data.message,0);
  //     }
  //   })
  // }

  public getDocuments(filter) {
    filter['document_id'] = this.IRSId;
    this.carrierService.getDocumentsForUpdatePage(filter).then(data => {
      if(data.success) {
        console.log(data.results);
        this.document = data.results[0];
        // this.new_added_documentation = data.results;
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
  }

  public getAssetDocuments(filter) {
    filter['document_id'] = this.IRSId;
    this.getDocuments({});
    this.carrierService.getAssetsWithDocuments(filter).then(data => {
      if(data.success) {
        console.log(data.results);
        this.new_added_documentation = data.results;
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
  }

  onPermissionChange(permission) {
    for(let i = 0; i< this.allAssets.length; i++){
      if(this.allAssets[i]['asset_id'] === permission.asset_id) {
        console.log(permission);
        this.allAssets[i]['status'] = permission.status ? 1:0;
      }
    }
  }

  onPermissionsChange(permission) {
    for(let i = 0; i< this.new_added_documentation.length; i++){
      if(this.new_added_documentation[i]['asset_document_id'] === permission.asset_document_id) {
        console.log(this.new_added_documentation);
        console.log(permission);
        this.new_added_documentation[i]['status'] = permission.status ? 1:0;
      }
    }
  }

  public getAllAssets(filter) {
    filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getAllAssets(filter).then(data => {
      if(data.success) {
        this.allAssets = data.results;
        console.log(this.allAssets);
        for(let i = 0; i < this.allAssets.length ; i++) {
          let obj = {}
          obj['status'] = 0;
          obj['asset_id'] = this.allAssets[i]['asset_id'];
          obj['asset_name'] = this.allAssets[i]['asset_number_id'];
          this.assetsToAdd.push(obj);
        }
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
  }



  goBack() {
    this.location.back();
  }

  addNewDocument() {
    let finalObj = {};
    let documentAssetsObj = {"items":[]};
    finalObj['irs_id'] = this.IRSId;
    finalObj['document_name'] = this.documentsForm.value.documentName;
    for(let i = 0 ; i < this.assetsToAdd.length ; i++) {
      let obj = {};
      obj['asset_id'] = this.assetsToAdd[i]['asset_id'];
      obj['status'] = this.assetsToAdd[i]['status'];
      documentAssetsObj.items.push(obj);
    }
    console.log(documentAssetsObj);
    documentAssetsObj['TotalLength'] = this.assetsToAdd.length;
    let formdata : FormData = new FormData();
    formdata.append('documentsData',JSON.stringify(finalObj));
    formdata.append('assetsDocumentsdata',JSON.stringify(documentAssetsObj));
    formdata.append('filess',this.fileToUpload);
    this.carrierService.addDocumentsInIrsForAssets(formdata).then(data => {
      if(data.success) {
        this.alertService.createAlert("Document added successfully",1);
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
  }

  updateAssets() {
    let finalObj = {"items":[]};
    // finalObj['irs_id'] = this.IRSId;
    // finalObj['document_name'] = this.documentsForm.value.documentName;
    
    for(let i = 0 ; i < this.new_added_documentation.length ; i++) {
      let obj = {};
      obj['asset_document_id'] = this.new_added_documentation[i]['asset_document_id'];
      obj['status'] = this.new_added_documentation[i]['status'];
      finalObj.items.push(obj);
    }
    console.log(finalObj);
    this.carrierService.updateAssetDocumentStatus(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Assets added successfully",1);
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
    // finalObj['TotalLength'] = this.assetsToAdd.length;

  }
  
  savePermissions() {
    this.location.back();
  }

}
