import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material';
import { CarriersService } from '../../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-ifta-dialog',
  templateUrl: './ifta-dialog.component.html',
  styleUrls: ['./ifta-dialog.component.scss']
})
export class IftaDialogComponent implements OnInit {
  fleets: any[] = [];
  assetsdrop: any[] = [];
  iftayears: any[] = [];
  addAssetForm: FormGroup;
  startyears = [
    {'year_id':0,'year_name':'2030'},
    {'year_id':1,'year_name':'2029'},
    {'year_id':2,'year_name':'2028'},
    {'year_id':3,'year_name':'2027'},
    {'year_id':4,'year_name':'2026'},
    {'year_id':5,'year_name':'2025'},
    {'year_id':6,'year_name':'2024'},
    {'year_id':0,'year_name':'2023'},
    {'year_id':0,'year_name':'2023'},
    {'year_id':1,'year_name':'2022'},
    {'year_id':2,'year_name':'2021'},
    {'year_id':3,'year_name':'2020'},
    {'year_id':4,'year_name':'2019'},
    {'year_id':5,'year_name':'2018'},
    {'year_id':6,'year_name':'2017'},
    {'year_id':7,'year_name':'2016'},
    {'year_id':8,'year_name':'2015'},
    {'year_id':9,'year_name':'2014'},
    {'year_id':10,'year_name':'2013'},
    {'year_id':11,'year_name':'2012'},
    {'year_id':12,'year_name':'2011'},
    {'year_id':13,'year_name':'2010'},
    {'year_id':14,'year_name':'2009'},
    {'year_id':15,'year_name':'2008'},
    {'year_id':16,'year_name':'2007'},
    {'year_id':17,'year_name':'2006'},
    {'year_id':18,'year_name':'2005'},
    {'year_id':19,'year_name':'2004'},
    {'year_id':20,'year_name':'2003'},
    {'year_id':21,'year_name':'2002'},
    {'year_id':22,'year_name':'2001'},
    {'year_id':23,'year_name':'2000'},
    {'year_id':24,'year_name':'1999'},
    {'year_id':25,'year_name':'1998'},
    {'year_id':26,'year_name':'1997'},
    {'year_id':27,'year_name':'1996'},
    {'year_id':28,'year_name':'1995'},
    {'year_id':29,'year_name':'1994'},
    {'year_id':30,'year_name':'1993'},
    {'year_id':31,'year_name':'1992'},
    {'year_id':32,'year_name':'1991'},
    {'year_id':33,'year_name':'1990'},
    {'year_id':34,'year_name':'1989'},
    {'year_id':35,'year_name':'1988'},
    {'year_id':36,'year_name':'1987'},
    {'year_id':37,'year_name':'1986'},
    {'year_id':38,'year_name':'1985'},
    {'year_id':39,'year_name':'1984'},
    {'year_id':40,'year_name':'1983'},
    {'year_id':41,'year_name':'1982'},
    {'year_id':42,'year_name':'1981'},
    {'year_id':43,'year_name':'1980'}
    
  ]
  constructor(public fb:FormBuilder,@Inject(MAT_DIALOG_DATA) public asset: any,public dialogRef: MatDialogRef<IftaDialogComponent>,public carrierService:CarriersService, public alertService: AlertService) {
   this.createAddAssetForm();
   }

  ngOnInit() {
    this.getFleetDropDown({});
    this.getAssetsDropDown({});
    this.getIftaYear({});
    if(this.asset){
      this.addAssetForm.controls['fleetName'].setValue(this.asset.fleet_id);
      this.addAssetForm.controls['assetName'].setValue(this.asset.asset_id);
      this.addAssetForm.controls['year'].setValue(this.asset.ifta_year_id);
      this.addAssetForm.controls['fleetName'].disable();
      this.addAssetForm.controls['assetName'].disable();
      this.addAssetForm.controls['year'].disable();
      this.addAssetForm.controls['decalName1'].setValue(this.asset.decal_first);
      this.addAssetForm.controls['decalName2'].setValue(this.asset.decal_second);
    }
  }

  get fleetName() { return this.addAssetForm.get('fleetName'); }
  get assetName() { return this.addAssetForm.get('assetName'); }
  get year() { return this.addAssetForm.get('year'); }
  get decalName1() { return this.addAssetForm.get('decalName1'); }
  get decalName2() { return this.addAssetForm.get('decalName2'); }

  createAddAssetForm(){
    this.addAssetForm = this.fb.group({
      fleetName : new FormControl('' , [Validators.required]),
      assetName : new FormControl('',[Validators.required]),
      year : new FormControl('',[Validators.required]),
      decalName1 : new FormControl('',[Validators.maxLength(15),Validators.required]),
      decalName2 : new FormControl('',[Validators.maxLength(15),Validators.required]),
    })
  }

  close(): void {
    this.dialogRef.close();
  }

  getFleetDropDown(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getFleetDropDown(filters).then(data => {
      if (data.success) {
        this.fleets = data.results;
      }
    })
  }
  fleetChanged(value){
    if (value){
      this.addAssetForm.controls["assetName"].setValue(null);
    }
    let finalobj = {};
    finalobj['fleet_id'] = value;
    finalobj['isIfta'] = true;
    this.getAssetsDropDown(finalobj);
  }
  getAssetsDropDown(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getAssetsDropDown(filters).then(data => {
      if (data.success) {
        this.assetsdrop = data.results;
      }
    })
  }

  getIftaYear(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getIftaYear(filters).then(data => {
      if (data.success) {
        this.iftayears = data.results;
      }
    })
  }

  addAsset(){
  let finalobj = {};
   finalobj['fleet_id'] = this.addAssetForm.value.fleetName;
   finalobj['asset_id'] = this.addAssetForm.value.assetName;
   finalobj['ifta_year_id'] = this.addAssetForm.value.year;
   finalobj['decal_first'] = this.addAssetForm.value.decalName1;
   finalobj['decal_second'] = this.addAssetForm.value.decalName2;
   finalobj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
   if(this.addAssetForm.value.decalName1.trim() != this.addAssetForm.value.decalName2.trim()){
       if(this.asset){
     finalobj['ifta_asset_id'] = this.asset.ifta_asset_id;
    this.carrierService.updateIftaAssets(finalobj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Asset updated successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
   }
   else {
    this.carrierService.addIftaAssets(finalobj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Asset added successfully",1);
        this.dialogRef.close('save');
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
   }
     }
     else {
      this.alertService.createAlert("Decal #1  &  Decal #2 should not be same.",0);
     }
  
  }
}
