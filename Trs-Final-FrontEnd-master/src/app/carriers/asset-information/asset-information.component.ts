import { Component, OnInit } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { AssetDialogComponent } from './asset-dialog/asset-dialog.component';
import { GridColumnsForAssetComponent } from './grid-columns-for-asset/grid-columns-for-asset.component';
import { UploadDocsDialogComponent } from './upload-docs-dialog/upload-docs-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { AssetsCommentsDialogComponent } from './assets-comments-dialog/assets-comments-dialog.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../carriers.service';
import { AddnewassetdocumentComponent } from './addnewassetdocument/addnewassetdocument.component';
import { DownloadExcelService } from '../driver-information/download-excel.service';
import * as XLSX from 'xlsx';
import { ActivatedRoute } from '@angular/router';
import { ExcelServiceService } from './excel-service.service';

@Component({
  selector: 'app-asset-information',
  templateUrl: './asset-information.component.html',
  styleUrls: ['./asset-information.component.scss']
})
export class AssetInformationComponent implements OnInit {
  
  assets: any[] = [];
  pageEvent: PageEvent;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  filterToggle = false;
  fleets: any[] = [];
  getallassets: any[] = [];
  file: File;
  public bulkUploadArray =[];
  public canUpload : boolean = true;
  submittedExcelfile: any[];
  finalSubmittedExcelfile = [];
  errorRecord = [];
  errorRecordTemp = [];
  gridColumns:any;
  compareObject = 0;
  allowedFileExtensions: Array<string> = ['xl', 'xls', 'xlsx', 'csv'];
  assetsType: any[] = [];
  dbassets : any;
  dbmakes : any;
  dbfleets : any;
  carrierAddedDetails : any
  public excelDataDriver = [];
  assetid = new FormControl();
  fleetForm = new FormControl();
  vehicleForm = new FormControl();
  yearForm = new FormControl();
  vin = new FormControl();
  axles = new FormControl();
  weight = new FormControl();
  statu = new FormControl();
  public assetsforexcel = [];
  showEmpty: boolean = false;
  public usingObject : any;
  public totalassets = [];
  isData: boolean = false;
  public excelData = [];
  public status_filter = "";
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  public maxSize : any;
  duplicate: boolean = true;
  assetAssending : boolean = false;
  yearAssending : boolean = false;
  modelAssending : boolean = false;
  plateAssending : boolean = false;
  jurisdictionAssending : boolean = false;
  vinAssending : boolean = false;
  grossAssending : boolean = false;
  assetNumberAssending : boolean = false;
  unitsAssending : boolean = false;
  countryAssending : boolean = false;
  fleetAssending : boolean = false;
  assetTypeAssending : boolean = false;
  makeAssending : boolean = false;
  activeAssending : boolean = false;
  statesForCanadaAndUSa: any;
  constructor(public downloadExcelService:DownloadExcelService,public route:ActivatedRoute,public dialog: MatDialog,public carrierService:CarriersService, public alertService: AlertService) {
    
  }
  
  public getAllAssetTypes(filter) {
    this.carrierService.getAllAssetTypes(filter).then(data => {
      if(data.success) {
        this.dbassets = data.results;
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  public getAllAssetMakes(filter) {
    this.carrierService.getAllAssetMakes(filter).then(data => {
      if(data.success) {
        this.dbmakes = data.results;
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  public getAllFleets(filter) {
    filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getAllFleet(filter).then(data => {
      if(data.success) {
        this.dbfleets = data.results;
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  handleFileSelect(event) {
    var target: HTMLInputElement = event.target as HTMLInputElement;
    for (var i = 0; i < target.files.length; i++) {
      this.file = target.files[i];
    }
    let fileExtension: string = this.file.name.substr(this.file.name.lastIndexOf('.') + 1)
    if (this.allowedFileExtensions.some(x => x.toLowerCase() === fileExtension.toLowerCase())) {
      this.Upload();
    }
    else {
      this.alertService.createAlert("Invalid file format",0);
    }
    event.target.value = '';
  }
  
  arrayBuffer: any;
  
  Upload() {
    this.errorRecord = [];
    this.submittedExcelfile = [];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      this.submittedExcelfile = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      this.finalSubmittedExcelfile = [];
      if(this.canUpload) {
        let size = this.maxSize - this.getallassets.length;
        if(this.submittedExcelfile.length <= size){
          for(let i = 0 ; i < this.submittedExcelfile.length ; i++) {
            this.duplicate = false;
            let innerObject = {};
            let aa = this.submittedExcelfile[i]['Active Date(YYYY,MM,DD)'].toString();
            console.log(this.submittedExcelfile[i]['Active Date(YYYY,MM,DD)']);
            // console.log(aa[0],aa[1])
            let year = aa[0]+aa[1]+aa[2]+aa[3];
            let month = aa[5]+aa[6];
            let day = aa[8]+aa[9];
            // console.log(year);
            let add1 = new Date(year,month-1,day);
            console.log(add1,"vijatkumar")
            let add = add1.setTime(add1.getTime() + (330 * 60 * 1000));
            this.submittedExcelfile[i]['Start Date'] = add
            console.log(this.submittedExcelfile[i]['Start Date']);
            let newCase = this.submittedExcelfile[i]['Country (Canada or USA)'].toLowerCase();
            let newFleet = this.submittedExcelfile[i]['Fleet Name (As added in Fleet area in portal)'].toLowerCase();
            for(let j = 0 ; j < this.dbfleets.length ; j++) {
              if(newFleet.trim() == this.dbfleets[j].fleet_name.toLowerCase().trim()) {
                this.submittedExcelfile[i]['Fleet'] = this.dbfleets[j].fleet_id;
                break;
              }
              else {
                console.log(newFleet,"here",i);
              }
            }
            let newAssetType = this.submittedExcelfile[i]['Asset Type (per portal)'].toLowerCase(); 
            let newAssetMAke = this.submittedExcelfile[i]['Asset Make (no abbreviations, per portal options)'].toLowerCase();
            let newPlateJurisdiction = this.submittedExcelfile[i]['Plate Jurisdiction (do not use abbreviations)'].toLowerCase();
            for(let k = 0 ; k < this.dbassets.length ; k++) {
              if(newAssetType.trim() == this.dbassets[k].asset_name.toLowerCase().trim()) {
                this.submittedExcelfile[i]['Asset Type'] = this.dbassets[k].asset_type_id;
              }
            }
            for(let l = 0 ; l < this.dbmakes.length ; l++) {
              if(newAssetMAke.trim() == this.dbmakes[l].asset_make_name.toLowerCase().trim()) {
                this.submittedExcelfile[i]['Asset Make'] = this.dbmakes[l].asset_make_id;
              }
            }
            for(let m = 0 ; m < this.years.length ; m++) {
              if(this.submittedExcelfile[i]['Year'].toString() == this.years[m]['year_name'])
              this.submittedExcelfile[i]['Year'] = this.years[m]['year_id'];
            }
            for(let r = 0 ; r <this.statesForCanadaAndUSa.length ; r++) {
              if(newPlateJurisdiction.trim() == this.statesForCanadaAndUSa[r].state_name.toLowerCase().trim()) {
                this.submittedExcelfile[i]['Plate Jurisdiction'] = this.statesForCanadaAndUSa[r].state_id;
              }
            }
            if(newCase.startsWith("ca"))
            this.submittedExcelfile[i]['Country'] = 38;
            else 
            this.submittedExcelfile[i]['Country'] = 231;
            let newUnits = this.submittedExcelfile[i]['Units (Kgs or Lbs)'].toLowerCase().trim();
            if(newUnits.startsWith("k"))
            this.submittedExcelfile[i]['Units'] = 1;
            else 
            this.submittedExcelfile[i]['Units'] = 2;
            if(this.getallassets.length) {
              for(let c in this.getallassets){
                if(this.submittedExcelfile[i]['Asset ID'].toString().toLowerCase().trim() == this.getallassets[c].asset_number_id.toLowerCase().trim()){
                  this.alertService.createAlert("Asset ID is already existed",0);
                  this.duplicate = false;
                } else {
                  this.duplicate = true;
                }
              }
            }
            else {
              this.duplicate = true;
            }
            if(this.duplicate == true){
              innerObject = {"year":this.submittedExcelfile[i]['Year'],"state_id":this.submittedExcelfile[i]['Plate Jurisdiction'],"asset_number_id":this.submittedExcelfile[i]['Asset ID'],"units":this.submittedExcelfile[i]['Units'],"model":this.submittedExcelfile[i]['Model'],"plate":this.submittedExcelfile[i]['Plate #'],"vin_number":this.submittedExcelfile[i]['VIN # (17 digits)'],"registered_weight":this.submittedExcelfile[i]['Registered Gross Vehicle Weight'],"number_of_axels":this.submittedExcelfile[i]['# of axles'],"country_id":this.submittedExcelfile[i]['Country'],"start_date":this.submittedExcelfile[i]['Start Date'],"comments":this.submittedExcelfile[i]['Comments'],"fleet_id":this.submittedExcelfile[i]['Fleet'],"asset_type_id":this.submittedExcelfile[i]['Asset Type'],"asset_make_id":this.submittedExcelfile[i]['Asset Make'],"created_by":1,"modified_by":1,"carrier_id":JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id};
              this.bulkUploadArray.push(innerObject);
            }
          }
          if(this.duplicate == true){
            this.carrierService.addBulkAssets(this.bulkUploadArray).then(data => {
              if(data.success) {
                this.alertService.createAlert("Assets uploaded successfully",1);
                this.getAssets({});
                this.allAssets({});
              }
              else {
                this.alertService.createAlert(data.message,0);
              }
              this.bulkUploadArray = [];
            });
          }
        }
        else {
          if(this.carrierAddedDetails == 1)
          this.alertService.createAlert("Please contact PermiShare to add more assets",0);
          else
          this.alertService.createAlert("The number of assets in your file exceeds the permitted asset size of your package. To add more assets, update your plan in the Subscriptions screen",0)
        }
        
      }
      else {
        this.alertService.createAlert("Asset with details already exists",0);
      }
      this.errorRecordTemp = this.errorRecord.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
      this.totalSize = this.errorRecord.length;
      this.isData = true;
      
    }
    fileReader.readAsArrayBuffer(this.file);
  }
  
  years = [{'year_id':1,'year_name':'2022'},
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
  {'year_id':43,'year_name':'1980'},
  
]

status = [{'status_id':'1','status_name':'Active'},
{'status_id':'2','status_name':'Inactive'}
]
ngOnInit() {
  this.carrierAddedDetails = sessionStorage.getItem('checkForAdminCreation');
  this.excelDataDriver = [];
  this.getGridColumns({});
  this.getStatesForCanadaAndUsa({});
  this.getAssets({});
  this.getassets({'is_active' : 0});
  this.allAssets({});
  this.getFleet({});
  this.getAllAssetTypes({});
  this.getAllAssetMakes({});
  this.getAllFleets({});
  this.getMaxAssets();
  let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[4];
  this.canCreate = parseInt(userdata.permission_type.split('')[0]);
  this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
  this.canDelete = parseInt(userdata.permission_type.split('')[3]);
}

getStatesForCanadaAndUsa(filter) {
  this.carrierService.getStatedForCanadaAndUsa(filter).then(data => {
    if(data.success) {
      this.statesForCanadaAndUSa = data.results;
    }
    else {
      this.alertService.createAlert(data.message,0);
    }
  })
}

dowloadBulkUploadAssetTemplateHeaders() {
 
}

dowloadBulkUploadAssetTemplate(item) {
  if(item == 'data') {
    this.assetsforexcel.forEach(element => {
      this.excelDataDriver.push({ 
        'Asset ID': element.asset_number_id,
        'Fleet': element.trs_tbl_fleet.fleet_name,
        'Asset Type': element.trs_tbl_asset_type.asset_name,
        'Year': element.year_name,
        'Asset Make': element.trs_tbl_asset_make.asset_make_name,
        'Model': element.model,
        'Plate #': element.plate,
        'Plate Jurisdiction': element.trs_tbl_state.state_name,
        'VIN #': element.vin_number,
        'Country': element.country,
        'Start Date':element.start_date,
        'Registered Gross Vehicle Weight': element.registered_weight,
        'Units': element.units,
        '# of Axles':element.number_of_axels,
        'Comments': element.comments
      });
    });
    this.downloadExcelService.exportAsExcelFile(this.excelDataDriver, 'Assets');
    this.excelDataDriver = [];
    //this._downloadExcelService.exportAsExcelFileForAssetTemplate(this.excelData, fileName,'Enter Details')
  }
  else {
    this.excelData.push({ 'Asset ID': "" });
    this.excelData.push({ 'Fleet': "" });
    this.excelData.push({ 'Asset Type': "" });
    this.excelData.push({ 'Year': "" });
    this.excelData.push({ 'Asset Make': "" });
    this.excelData.push({ 'Model': "" });
    this.excelData.push({ 'Plate #': "" });
    this.excelData.push({ 'Plate Jurisdiction': "" });
    this.excelData.push({ 'VIN #': "" });
    this.excelData.push({ 'Country': "" });
    this.excelData.push({ 'Registered Gross Vehicle Weight': "" });
    this.excelData.push({ 'Units': "" });
    this.excelData.push({ '# of axles': "" });
    this.excelData.push({ 'Start Date(YYYY,MM,DD)': "" });
    // this.excelData.push({ 'Inactive Date': "" })
    this.excelData.push({ 'Comments': "" });
    let currentDate = (new Date).toISOString().slice(0, 10);
    let fileName = 'Asset_Sample_File_' + currentDate;
    this.downloadExcelService.exportAsExcelFile(this.excelData, fileName)
    //this._downloadExcelService.exportAsExcelFileForAssetTemplate(this.excelData, fileName,'Enter Details')
  }
}

public allAssets(finalObj) {
  finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  this.carrierService.getAllAssets(finalObj).then(data => {
    if(data.success) {
      this.getallassets = data.results;
      for(let i =0; i < data.results.length; i++){
        if(data.results[i].country_id == 38){
          data.results[i]['country'] = "Canada";
          data.results[i]['units'] = "Kgs";
        } else {
          data.results[i]['country'] = "USA";
          data.results[i]['units'] = "Lbs";
        }
        for (let j = 0; j < this.years.length ; j ++) {
          if(data.results[i].year === this.years[j].year_id){
            data.results[i]['year_name'] = this.years[j].year_name;
            data.results[i]['year_id'] = this.years[j].year_id;
          }
        }
      }
      this.assetsforexcel = data.results;
    }
    else {
      this.alertService.createAlert(data.message,0);
    }
  });
}

public getMaxAssets() {
  let finalObj = {};
  finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  this.carrierService.getMaxAssetSize(finalObj).then(data => {
    if(data.success) {
      this.maxSize = data.results.max_asset_size;
    }
    else {
      this.alertService.createAlert(data.message,0);
    }
  });
}

public getAssets(filter) {
  filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  filter['per_page'] = this.pageSize;
  filter['page'] = this.currentPage;
  this.carrierService.getAssets(filter).then(data => {
    if(data.success) {
      for(let i =0; i < data.results.length; i++){
        if(data.results[i].country_id == 38){
          data.results[i]['country'] = "Canada";
          data.results[i]['units'] = "Kgs";
        } else {
          data.results[i]['country'] = "USA";
          data.results[i]['units'] = "Lbs";
        }
        for (let j = 0; j < this.years.length ; j ++) {
          if(data.results[i].year === this.years[j].year_id){
            data.results[i]['year_name'] = this.years[j].year_name;
            data.results[i]['year_id'] = this.years[j].year_id;
          }
        }
        data.results[i]['sortedFleet'] = data.results[i].trs_tbl_fleet.fleet_name;
        data.results[i]['sortedMake'] = data.results[i].trs_tbl_asset_make.asset_make_name;
        data.results[i]['sortedType'] = data.results[i].trs_tbl_asset_type.asset_name;
        data.results[i]['sortedplate'] = data.results[i].trs_tbl_state.state_name;
      }
      this.assets = data.results;
      if(data.results) {
        console.log(data);
        if(!data.results.length) {
          this.showEmpty = true;
          this.totalSize = 0;
        }
        else {
          this.totalSize = data.count;
          this.showEmpty = false;
        }
      }
      else {
        this.totalSize = 0;
        this.showEmpty = true;
      }
    }
  });
}

public handlePage(e: any) {
  this.currentPage = e.pageIndex;
  this.pageSize = e.pageSize;
  if(this.usingObject) {
    this.getAssets(this.usingObject);
    this.allAssets(this.usingObject);
  }
  else {
    this.getAssets({});
    this.allAssets({});
  }
}

AssetIdClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.asset_number_id, titleB = b.asset_number_id;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.asset_number_id, titleB = a.asset_number_id;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

ModelClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.model, titleB = b.model;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.model, titleB = a.model;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

PlateClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.plate, titleB = b.plate;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.plate, titleB = a.plate;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

VinClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.vin_number, titleB = b.vin_number;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.vin_number, titleB = a.vin_number;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

YearClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.year_name, titleB = b.year_name;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.year_name, titleB = a.year_name;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

grossWeightClicket(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.registered_weight, titleB = b.registered_weight;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.registered_weight, titleB = a.registered_weight;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

NumberClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.number_of_axels, titleB = b.number_of_axels;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.number_of_axels, titleB = a.number_of_axels;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

UnitsClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.units, titleB = b.units;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.units, titleB = a.units;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

CountryClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.country, titleB = b.country;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.country, titleB = a.country;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

FleetClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.sortedFleet, titleB = b.sortedFleet;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.sortedFleet, titleB = a.sortedFleet;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

AssetTypeClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.sortedType, titleB = b.sortedType;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.sortedType, titleB = a.sortedType;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

JurisdictionClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.sortedplate, titleB = b.sortedplate;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.sortedplate, titleB = a.sortedplate;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

MakeClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      var titleA = a.sortedMake, titleB = b.sortedMake;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      var titleA = b.sortedMake, titleB = a.sortedMake;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

ActiveClicked(order) {
  if(order) {
    this.assets.sort(function(a, b) {
      return a.is_active - b.is_active;
    });
  }
  else {
    this.assets.sort(function(a, b) {
      return b.is_active - a.is_active;
    });
  }
  
}

openDocumentsDialog(asset) {
  let dialogRef = this.dialog.open(AddnewassetdocumentComponent, {
    data: asset,
    height: 'auto',
    width: '900px',
    autoFocus: false,
  });
  
  dialogRef.afterClosed().subscribe(prospects => {
    if(prospects == 'save') {
      if(this.usingObject) {
        this.getAssets(this.usingObject);
        this.allAssets(this.usingObject);
      }
      else {
        this.getAssets({});
        this.allAssets({});
      }
    }
  });
}

openAssetDialog(status) {
  if(status == null) {
    if(this.getallassets.length < this.maxSize) {
      let dialogRef = this.dialog.open(AssetDialogComponent, {
        data: status,
        height: 'auto',
        width: '900px',
        autoFocus: false,
      });
      
      dialogRef.afterClosed().subscribe(data => {
        if(data == 'save') {
          if(this.usingObject) {
            this.getAssets(this.usingObject);
            this.allAssets(this.usingObject);
          }
          else {
            this.getAssets({});
            this.allAssets({});
          }
        }
      });
    }
    else {
      if(this.carrierAddedDetails == 1)
      this.alertService.createAlert("Please contact PermiShare to add more assets",0);
      else
      this.alertService.createAlert("The number of assets exceeds the permitted asset size of your package. To add more assets, update your plan in the Subscriptions screen",0);
    }
  }
  else {
    let dialogRef = this.dialog.open(AssetDialogComponent, {
      data: status,
      height: 'auto',
      width: '900px',
      autoFocus: false,
    });
    
    dialogRef.afterClosed().subscribe(data => {
      if(data == 'save') {
        if(this.usingObject) {
          this.getAssets(this.usingObject);
          this.allAssets(this.usingObject);
        }
        else {
          this.getAssets({});
          this.allAssets({});
        }
      }
    });
  }
}


openDeleteDialog(assets) {
  let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
    data: assets,
    height: 'auto',
    width: 'auto',
    autoFocus: false
  });
  
  dialogRef.afterClosed().subscribe(data => {
    if (data != null && data !== undefined) {
      const formData: FormData = new FormData();
      let finalObj = {};
      finalObj['asset_id'] = data.asset_id;
      finalObj['is_deleted'] = 1;
      // formData.append('data',JSON.stringify(finalObj));
      this.carrierService.deleteAssetInAssets(finalObj).then(data => {
        if (data.success) {
          this.alertService.createAlert("Asset deleted successfully", 1);
          this.getAssets({});
          this.allAssets({});
        }
        else {
          this.alertService.createAlert(data.message, 0);
        }
      })  
    }
    
  });
}

openGridColumnsDialog(stat){
  let dialogRef = this.dialog.open(GridColumnsForAssetComponent, {
    data: stat,
    height: 'auto',
    width: '800px',
    autoFocus: false,
  });
  
  dialogRef.afterClosed().subscribe(prospects => {
    if(prospects == 'save') {
      if(this.usingObject) {
        this.getAssets(this.usingObject);
        this.allAssets(this.usingObject);
        this.getGridColumns({});
      }
      
      else {
        this.getAssets({});
        this.allAssets({});
        this.getGridColumns({});
      }
    }
  });
}

public getGridColumns(filter) {
  if(this.compareObject == 0) {
    let data= this.route.snapshot.data['carriesresolver']['gridColumnsInAssetsFromResolver'];
    this.gridColumns = data.results;
    this.compareObject++;
  }
  else {
    filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getGridColumnsForAssets(filter).then(data => {
      if(data.success) {
        this.gridColumns = data.results;
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  // this.EveryClients = data['Data'];
  // this.EveryClients.forEach(x=>{
  //   x.cEncryptedId = x['clientID'].toString(),
  //   x.cEncryptedName = x['clientName'].toString()
  // })
  // this.totalSize = this.EveryClients.length 
  // this.allClients = this.EveryClients.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
  
  // console.log(this.totalSize, 'total size in getclients')
  // console.log(this.allClients)
  
}

getFleet(filters) {
  filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  this.carrierService.getFleetDropDown(filters).then(data => {
    if (data.success) {
      this.fleets = data.results;
    }
  })
}

// openDeleteDialog(assets) {
//   let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
//     data: assets,
//     height: 'auto',
//     width: 'auto',
//     autoFocus: false
//   });

//   dialogRef.afterClosed().subscribe(data => {
//     if (data != null && data !== undefined) {
//       let finalObj = {};
//       finalObj['asset_id'] = data.asset_id;
//       finalObj['is_deleted'] = 1;
//       this.carrierService.updateAssets(finalObj).then(data => {
//         if (data.success) {
//           this.alertService.createAlert("Asset deleted successfully", 1);
//           this.getAssets({});
//           this.allAssets({});
//         }
//         else {
//           this.alertService.createAlert(data.message, 0);
//         }
//       })  
//     }
//   });
// }

openNote(asset) {
  let dialogRef = this.dialog.open(AssetsCommentsDialogComponent, {
    data: asset,
    height: 'auto',
    width: '400px',
    autoFocus: false
  });
  
  dialogRef.afterClosed().subscribe(data => {
    if(data == 'save') {
      if(this.usingObject) {
        this.getAssets(this.usingObject);
        this.allAssets(this.usingObject);
      }
      else { 
        this.getAssets({});
        this.allAssets({});
      }
    }
  });
}

getAllAssetsSorted(data) {
  let obj = {};
  if(data == "a-z") {
    obj['a-z'] = 1;
  }
  if(data == 'z-a') {
    obj['z-a'] = 1;
  }
  this.getAssets(obj);
  this.allAssets(obj);
}

public getassets(filter) {
  this.carrierService.getAssetTypesdropdown(filter).then(data => {
    if(data.success) {
      this.assetsType = data.results;
    }
  });
}

selectAll(ev, type) {
  if (ev._selected) {
    if (type == 'fleet') {
      let temp = [];
      for (let i = 0; i < this.fleets.length; i++) {
        temp.push(this.fleets[i]['fleet_id']);
      }
      this.fleetForm.setValue(temp);
    }
    if (type == 'year') {
      let temp = [];
      for (let i = 0; i < this.years.length; i++) {
        temp.push(this.years[i]['year_id']);
      }
      this.yearForm.setValue(temp);
    }
    if (type == 'vehicle') {
      let temp = [];
      for (let i = 0; i < this.assetsType.length; i++) {
        temp.push(this.assetsType[i]['asset_type_id']);
      }
      this.vehicleForm.setValue(temp);
    }
    if (type == 'status') {
      let temp = [];
      for (let i = 0; i < this.status.length; i++) {
        temp.push(this.status[i]['status_id']);
      }
      this.statu.setValue(temp);
    }
    ev._selected = true;
  }
  if (ev._selected == false) {
    if (type == 'fleet')
    this.fleetForm.setValue([]);
    if (type == 'year')
    this.yearForm.setValue([]);
    if (type == 'vehicle')
    this.vehicleForm.setValue([]);
    if (type == 'status')
    this.statu.setValue([]);
  }
}

selectOne(ev, type) {
  if (type == 'fleet') {
    ((this.fleets.length <= this.fleetForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  }
  if (type == 'year') {
    ((this.years.length <= this.yearForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  }
  if (type == 'vehicle') {
    ((this.assetsType.length <= this.vehicleForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  }
  if (type == 'status') {
    ((this.status.length <= this.statu.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  }
}

fliterSearch() {
  let filters = {};
  if (this.assetid.value && this.assetid.value.length)
  filters['asset_number_id'] = this.assetid.value.trim();
  if (this.fleetForm.value && this.fleetForm.value.length)
  filters['fleet_id'] = this.fleetForm.value;
  if (this.vehicleForm.value && this.vehicleForm.value.length)
  filters['asset_type_id'] = this.vehicleForm.value;
  if (this.yearForm.value && this.yearForm.value.length)
  filters['year'] = this.yearForm.value;   
  if (this.vin.value && this.vin.value.length)
  filters['vin_number'] = this.vin.value.trim(); 
  if (this.axles.value && this.axles.value.length)
  filters['number_of_axels'] = this.axles.value.trim();  
  if (this.weight.value && this.weight.value.length)
  filters['registered_weight'] = this.weight.value.trim();
  if (this.status_filter)
  if(this.status_filter == '2')
  filters['is_active'] = 0;
  else
  filters['is_active'] = 1;
  this.getAssets(filters);
  this.allAssets(filters);
}

clearFilters() {
  this.assetid.setValue([]);
  this.fleetForm.setValue([]);
  this.vehicleForm.setValue([]);
  this.yearForm.setValue([]);
  this.vin.setValue([]);
  this.axles.setValue([]);
  this.weight.setValue([]);
  this.status_filter = '';
  this.getAssets({});
  this.allAssets({});
}
}
