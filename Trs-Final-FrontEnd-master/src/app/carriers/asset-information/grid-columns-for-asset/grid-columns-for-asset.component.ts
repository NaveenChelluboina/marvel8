import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CarriersService } from '../../carriers.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-grid-columns-for-asset',
  templateUrl: './grid-columns-for-asset.component.html',
  styleUrls: ['./grid-columns-for-asset.component.scss']
})
export class GridColumnsForAssetComponent implements OnInit {

  constructor(public alertService:AlertService,@Inject(MAT_DIALOG_DATA) public grids: any,public carrierService:CarriersService,public fb:FormBuilder,public dialogRef: MatDialogRef<GridColumnsForAssetComponent>) {
    this.createGridColumnGroup();
   }

  gridColumnForm: FormGroup;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;

  createGridColumnGroup() {
    this.gridColumnForm = this.fb.group({
      assetId : new FormControl(null),
      fleet : new FormControl(null),
      assetType : new FormControl(null),
      year : new FormControl(null),
      make : new FormControl(null),
      model : new FormControl(null),
      plate : new FormControl(null),
      plateJurisdiction : new FormControl(null),
      vin : new FormControl(null),
      country : new FormControl(null),
      registeredGross : new FormControl(null),
      units : new FormControl(null),
      axels : new FormControl(null),
      documents : new FormControl(null),
    })
  }

  // get driverLastName() { return this.gridColumnForm.get('driverLastName'); }

  // get driverFirstName() { return this.gridColumnForm.get('driverFirstName'); }

  // get cellPhone() { return this.gridColumnForm.get('cellPhone'); }

  // get emailId() { return this.gridColumnForm.get('emailId'); }

  // get dlNumber() { return this.gridColumnForm.get('dlNumber'); }

  // get dlClass() { return this.gridColumnForm.get('dlClass'); }

  // get address() { return this.gridColumnForm.get('address'); }

  // get city() { return this.gridColumnForm.get('city'); }

  // get state() { return this.gridColumnForm.get('state'); }

  // get country() { return this.gridColumnForm.get('country'); }

  // get documents() { return this.gridColumnForm.get('documents'); }

  ngOnInit() {
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[4];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    this.gridColumnForm.controls['assetId'].setValue(parseInt(this.grids[0].grid_columns.split('')[0]));
    this.gridColumnForm.controls['fleet'].setValue(parseInt(this.grids[0].grid_columns.split('')[1]));
    this.gridColumnForm.controls['assetType'].setValue(parseInt(this.grids[0].grid_columns.split('')[2]));
    this.gridColumnForm.controls['year'].setValue(parseInt(this.grids[0].grid_columns.split('')[3]));
    this.gridColumnForm.controls['make'].setValue(parseInt(this.grids[0].grid_columns.split('')[4]));
    this.gridColumnForm.controls['model'].setValue(parseInt(this.grids[0].grid_columns.split('')[5]));
    this.gridColumnForm.controls['plate'].setValue(parseInt(this.grids[0].grid_columns.split('')[6]));
    this.gridColumnForm.controls['plateJurisdiction'].setValue(parseInt(this.grids[0].grid_columns.split('')[7]));
    this.gridColumnForm.controls['vin'].setValue(parseInt(this.grids[0].grid_columns.split('')[8]));
    this.gridColumnForm.controls['country'].setValue(parseInt(this.grids[0].grid_columns.split('')[9]));
    this.gridColumnForm.controls['registeredGross'].setValue(parseInt(this.grids[0].grid_columns.split('')[10]));
    this.gridColumnForm.controls['units'].setValue(parseInt(this.grids[0].grid_columns.split('')[11]));
    this.gridColumnForm.controls['axels'].setValue(parseInt(this.grids[0].grid_columns.split('')[12]));
    this.gridColumnForm.controls['documents'].setValue(parseInt(this.grids[0].grid_columns.split('')[13]));
  }

  close(): void {
    this.dialogRef.close();
  }

  saveGridColumns() {
    let finalObj = {};
    let sendObj = {};
    finalObj['assetId'] = this.gridColumnForm.value.assetId? '1' :'0';
    finalObj['fleet'] = this.gridColumnForm.value.fleet? '1' :'0';
    finalObj['assetType'] = this.gridColumnForm.value.assetType? '1' :'0';
    finalObj['year'] = this.gridColumnForm.value.year? '1' :'0';
    finalObj['make'] = this.gridColumnForm.value.make? '1' :'0';
    finalObj['model'] = this.gridColumnForm.value.model? '1' :'0';
    finalObj['plate'] = this.gridColumnForm.value.plate? '1' :'0';
    finalObj['plateJurisdiction'] = this.gridColumnForm.value.plateJurisdiction? '1' :'0';
    finalObj['vin'] = this.gridColumnForm.value.vin? '1' :'0';
    finalObj['country'] = this.gridColumnForm.value.country? '1' :'0';
    finalObj['registeredGross'] = this.gridColumnForm.value.registeredGross? '1' :'0';
    finalObj['units'] = this.gridColumnForm.value.units? '1' :'0';
    finalObj['axels'] = this.gridColumnForm.value.axels? '1' :'0';
    finalObj['documents'] = this.gridColumnForm.value.documents? '1' :'0';
    sendObj['grid_columns'] = finalObj['assetId'] + finalObj['fleet'] + finalObj['assetType'] + finalObj['year'] + finalObj['make'] + finalObj['model'] + finalObj['plate'] + finalObj['plateJurisdiction'] + finalObj['vin'] + finalObj['country'] + finalObj['registeredGross'] + finalObj['units'] + finalObj['axels'] + finalObj['documents'];
    sendObj['carrier_id'] = this.grids[0].carrier_id;
    this.carrierService.updateGridColumnsInAssets(sendObj).then(data => {
      if(data.success) { 
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0)
      } 
    })
  }

}
