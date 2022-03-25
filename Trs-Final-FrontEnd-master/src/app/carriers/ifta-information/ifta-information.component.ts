import { Component, OnInit } from '@angular/core';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { IftaDialogComponent } from './ifta-dialog/ifta-dialog.component';
import { MatDialog } from '@angular/material';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IftaCommentsDialogComponent } from './ifta-comments-dialog/ifta-comments-dialog.component';
import { CarriersService } from '../carriers.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DownloadExcelService } from '../driver-information/download-excel.service';
import { IftaDocumentComponent } from './ifta-document/ifta-document.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-ifta-information',
  templateUrl: './ifta-information.component.html',
  styleUrls: ['./ifta-information.component.scss']
})

export class IftaInformationComponent implements OnInit {
  
  value: any;
  iftas: any[];
  isyearadd = false;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  filterToggle = false;
  selectedId = 0;
  selectedListItem:any;
  selectedYear:any;
  isSelected : any;
  isUploaded: boolean;
  addYearForm : FormGroup;
  assetID = new FormControl();
  public fleet_filter = "";
  public asset_filter = "";
  fleets: any[] = [];
  years: any[] = [];
  public iftaassetsforexcel = [];
  public excelDataIfta = [];
  public excelData = [];
  file: File;
  filesToUpload = [];
  fileName:any;
  filePath:any;
  public iftaAssets = [];
  public alliftaAssets = [];
  showEmpty: boolean = true;
  duplicate: boolean = true;
  errorRecord = [];
  errorRecordTemp = [];
  submittedExcelfile: any[];
  finalSubmittedExcelfile = [];
  public canUpload : boolean = true;
  assetsdrop: any[] = [];
  iftayears: any[] = [];
  public bulkUploadArray =[];
  public display : any = [];
  fleetForm = new FormControl();
  allowedFileExtensions: Array<string> = ['xl', 'xls', 'xlsx', 'csv'];
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  fleetAssending : boolean = false;
  assetAssending : boolean = false;
  decal1Assending : boolean = false;
  decal2Assending : boolean = false;
  
  startyears = [
    {'year_id':1,'year_name':'2030'},
    {'year_id':2,'year_name':'2029'},
    {'year_id':3,'year_name':'2028'},
    {'year_id':4,'year_name':'2027'},
    {'year_id':5,'year_name':'2026'},
    {'year_id':6,'year_name':'2025'},
    {'year_id':7,'year_name':'2024'},
    {'year_id':8,'year_name':'2023'},
    {'year_id':9,'year_name':'2023'},
    {'year_id':10,'year_name':'2022'},
    {'year_id':11,'year_name':'2021'},
    {'year_id':12,'year_name':'2020'},
    {'year_id':13,'year_name':'2019'},
    {'year_id':14,'year_name':'2018'},
    {'year_id':15,'year_name':'2017'},
    {'year_id':16,'year_name':'2016'},
    {'year_id':17,'year_name':'2015'},
    {'year_id':18,'year_name':'2014'},
    {'year_id':19,'year_name':'2013'},
    {'year_id':20,'year_name':'2012'},
    {'year_id':21,'year_name':'2011'},
    {'year_id':22,'year_name':'2010'},
    {'year_id':23,'year_name':'2009'},
    {'year_id':24,'year_name':'2008'},
    {'year_id':25,'year_name':'2007'},
    {'year_id':26,'year_name':'2006'},
    {'year_id':27,'year_name':'2005'},
    {'year_id':28,'year_name':'2004'},
    {'year_id':29,'year_name':'2003'},
    {'year_id':30,'year_name':'2002'},
    {'year_id':31,'year_name':'2001'},
    {'year_id':32,'year_name':'2000'},
    {'year_id':33,'year_name':'1999'},
    {'year_id':34,'year_name':'1998'},
    {'year_id':35,'year_name':'1997'},
    {'year_id':36,'year_name':'1996'},
    {'year_id':37,'year_name':'1995'},
    {'year_id':38,'year_name':'1994'},
    {'year_id':39,'year_name':'1993'},
    {'year_id':40,'year_name':'1992'},
    {'year_id':41,'year_name':'1991'},
    {'year_id':42,'year_name':'1990'},
    {'year_id':43,'year_name':'1989'},
    {'year_id':44,'year_name':'1988'},
    {'year_id':45,'year_name':'1987'},
    {'year_id':46,'year_name':'1986'},
    {'year_id':47,'year_name':'1985'},
    {'year_id':48,'year_name':'1984'},
    {'year_id':49,'year_name':'1983'},
    {'year_id':50,'year_name':'1982'},
    {'year_id':51,'year_name':'1981'},
    {'year_id':52,'year_name':'1980'}
    
  ]
  constructor(public downloadExcelService:DownloadExcelService,public dialog: MatDialog,public fb:FormBuilder,public carrierService:CarriersService,public alertService:AlertService) { 
    this.createYearForm();
  }
  
  ngOnInit() {
    this.getFleetDropDown({});
    this.getIftaYear({});
    this.getAssetsDropDown({});
    this.getIftaYearDropDown({});
    this.getAllIftaAssets({});
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[6];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
  }
  
  getFleetDropDown(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id
    this.carrierService.getFleetDropDown(filters).then(data => {
      if (data.success) {
        this.fleets = data.results;
      }
    })
  }
  
  getAssetsDropDown(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id
    this.carrierService.getAssetsDropDown(filters).then(data => {
      if (data.success) {
        this.assetsdrop = data.results;
      }
    })
  }
  
  getIftaYearDropDown(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id
    this.carrierService.getIftaYear(filters).then(data => {
      if (data.success) {
        this.iftayears = data.results;
        //this.getYear('2');
      }
    })
  }
  
  getIftaYear(filters) {
    console.log(this.selectedId)
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    let finalArray = [];
    this.carrierService.getIftaYear(filters).then(data => {
      if (data.success) {
        this.years = data.results;
        for(let i in data.results){
          finalArray.push(data.results[i]['year_name']) 
        }
        this.display = finalArray.sort((a,b) => b - a);
        if(this.selectedId == 0){
          this.selectedListItem = this.display[0];
          for(let i in this.years){
            if(this.years[i].year_name == this.display[0]){
              this.selectedYear = this.years[i].ifta_year_id;
              this.getIftaAssets({});
              if(this.years[i].document_exist == 1){
                this.isUploaded = true;
                this.fileName = this.years[i].year_document_name;
                this.filePath = this.years[i].year_document_path;
              } else {
                this.isUploaded = false;
              }
              
            }
          }
        } else {
          this.selectedListItem = this.display[this.selectedId];
          for(let i in this.years){
            if(this.years[i].year_name == this.display[this.selectedId]){
              this.selectedYear = this.years[i].ifta_year_id;
              this.getIftaAssets({});
              if(this.years[i].document_exist == 1){
                this.isUploaded = true;
                this.fileName = this.years[i].year_document_name;
                this.filePath = this.years[i].year_document_path;
              } else {
                this.isUploaded = false;
              }
              
            }
          } 
        } 
      }
    })
  }
  
  listNewClick(event, newValue) {
    this.selectedListItem = newValue;
    for(let i in this.years){
      if(this.years[i].year_name == newValue){
        this.selectedId = parseInt(i);
        this.selectedYear = this.years[i].ifta_year_id;
        this.isSelected = this.years[i].ifta_year_id;
        this.getIftaAssets({});
        if(this.years[i].document_exist == 1){
          this.isUploaded = true;
          this.fileName = this.years[i].year_document_name;
          this.filePath = this.years[i].year_document_path;
        }else {
          this.isUploaded = false;
        }
      }
    }
  }
  
  getIftaAssets(filters) {
    filters['per_page'] = this.pageSize;
    filters['page'] = this.currentPage;
    filters['ifta_year_id'] = this.selectedYear;
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getIftaAssets(filters).then(data => {
      if (data.success) {
        for(let i = 0 ; i < data.results.length ; i++) {
          data.results[i]['sortedFleet'] = data.results[i].trs_tbl_fleet.fleet_name;
          data.results[i]['sortedAsset'] = data.results[i].trs_tbl_asset.asset_number_id;
        }
        this.iftaAssets = data.results;
        this.iftaassetsforexcel = data.results;
        //  this.fleetList = this.totalFleetList.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
        this.totalSize = data.count;
        data.count ? this.showEmpty = false : this.showEmpty = true;
      }
      else {
        this.iftaAssets = [];
        this.showEmpty = true;
        this.alertService.createAlert(data.message, 0);
      }
    })
  }
  
  getAllIftaAssets(filters) {
    filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getAllIftaAssets(filters).then(data => {
      if (data.success) {
        this.alliftaAssets = data.results;
      }
    })
  }
  
  openDocumentYear(){
    console.log(this.selectedYear);
    if(this.selectedYear) {
      let dialogRef = this.dialog.open(IftaDocumentComponent, {
        data: this.selectedYear,
        height: 'auto',
        width: '600px',
        autoFocus: false
      });
      dialogRef.afterClosed().subscribe(prospects => {
        if(prospects == 'save') {
          this.getIftaYear({});
        }
      });
    }
    else {
      this.alertService.createAlert("Please select a year to upload IFTA Licence",0)
    }
    
  }
  deleteYear(){
    if(this.isSelected){
      let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: this.isSelected,
        height: 'auto',
        width: 'auto',
        autoFocus: false
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data != null && data !== undefined) {
          let finalObj = {};
          finalObj['ifta_year_id'] = data;
          finalObj['is_deleted'] = true;
          this.carrierService.delteIftaYearDoc(finalObj).then(data => {
            if(data.success) {
              this.alertService.createAlert("Year deleted successfully",1);
              this.isSelected = '';
              this.getIftaYear({});
            }
            else {
              this.alertService.createAlert(data.message,0);
            }
          })
        }
      });
    }
    else {
      this.alertService.createAlert("Please select the Year to delete",0);
    }
  }
  
  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.getIftaAssets({});
  }
  
  openIftaDialog(status) {
    let dialogRef = this.dialog.open(IftaDialogComponent, {
      data: status,
      height: 'auto',
      width: '600px',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(prospects => {
      if(prospects == 'save') {
        this.getIftaYear({});
      }
    });
  }
  
  openNote() {
    let dialogRef = this.dialog.open(IftaCommentsDialogComponent, {
      data:this.years[0],
      height: 'auto',
      width: '400px',
      autoFocus: false
    });
    
    dialogRef.afterClosed().subscribe(prospects => {
      if(prospects == 'save') {
        this.getIftaYear({});
      }
    });
  }
  
  get year() { return this.addYearForm.get('year'); }
  
  
  createYearForm() {
    this.addYearForm = this.fb.group({
      year : new FormControl('',[Validators.required]),
    })
  }
  
  
  saveYear(){
    let finalObj = {};
    const formData: FormData = new FormData();
    finalObj['year_name'] = parseInt(this.addYearForm.value.year);
    finalObj['docsLength'] = this.filesToUpload.length;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    for(let i = 0; i < this.filesToUpload.length ; i++) {
      formData.append('filesnew'+i,this.filesToUpload[i]);
    }
    formData.append('data',JSON.stringify(finalObj));
    this.carrierService.addIftaYear(formData).then(data => {
      if(data.success) {
        this.isyearadd = false;
        this.alertService.createAlert("Year added successfully",1);
        this.getIftaYear({});
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  addYear() {
    this.isyearadd = true;
  }
  
  closeAddForm() {
    this.isyearadd = false;
  }
  
  deleteLead() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data:this.selectedYear,
      height: 'auto',
      width: 'auto',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data != null && data !== undefined) {
        let finalObj = {};
        finalObj['ifta_year_id'] = data;
        this.carrierService.delteIftaYearDoc(finalObj).then(data => {
          if(data.success) {
            this.alertService.createAlert("Document deleted successfully",1);
            this.getIftaYear({});
          }
          else {
            this.alertService.createAlert(data.message,0);
          }
        })
      }
    });
  }
  deleteAsset(data) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data:data,
      height: 'auto',
      width: 'auto',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data != null && data !== undefined) {
        data['is_deleted'] = 1;
        this.carrierService.updateIftaAssets(data).then(data => {
          if(data.success) {
            this.alertService.createAlert("Asset deleted successfully",1);
            this.getIftaYear({});
          }
          else {
            this.alertService.createAlert(data.message,0);
          }
        })
      }
    });
  }
  
  Decal1Clicked(order) {
    if(order) {
      this.iftaAssets.sort(function(a, b) {
        var titleA = a.decal_first, titleB = b.decal_first;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.iftaAssets.sort(function(a, b) {
        var titleA = b.decal_first, titleB = a.decal_first;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  Decal2Clicked(order) {
    if(order) {
      this.iftaAssets.sort(function(a, b) {
        var titleA = a.decal_second, titleB = b.decal_second;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.iftaAssets.sort(function(a, b) {
        var titleA = b.decal_second, titleB = a.decal_second;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  FleetClicked(order) {
    if(order) {
      this.iftaAssets.sort(function(a, b) {
        var titleA = a.sortedFleet, titleB = b.sortedFleet;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.iftaAssets.sort(function(a, b) {
        var titleA = b.sortedFleet, titleB = a.sortedFleet;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  AssetClicked(order) {
    if(order) {
      this.iftaAssets.sort(function(a, b) {
        var titleA = a.sortedAsset, titleB = b.sortedAsset;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.iftaAssets.sort(function(a, b) {
        var titleA = b.sortedAsset, titleB = a.sortedAsset;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  handleFileSelect(event) {
    var target: HTMLInputElement = event.target as HTMLInputElement;
    this.file = target.files[0];
    // for (var i = 0; i < target.files.length; i++) {
    //    this.file = target.files[i];
    // }
    let fileExtension: string = this.file.name.substr(this.file.name.lastIndexOf('.') + 1)
    if (this.allowedFileExtensions.some(x => x.toLowerCase() === fileExtension.toLowerCase())) {
      this.Upload();
    }
    else {
      this.alertService.createAlert("Invalid file format",0);
    }
    event.target.value = '';
  }
  
  dowloadBulkUploadIftaAssetTemplate(item) {
    if(item == 'data') {
      let year = '';
      this.iftaassetsforexcel.forEach(element => {
        this.excelDataIfta.push({ 
          'Fleet': element.trs_tbl_fleet.fleet_name,
          'Asset ID': element.trs_tbl_asset.asset_number_id,
          'year' : this.getYear(element.ifta_year_id),
          'Decal#1': element.decal_first,
          'Decal#2': element.decal_second
        });
      });
      this.downloadExcelService.exportAsExcelFile(this.excelDataIfta, 'Ifta Assets');
    }
    else {
      this.excelData.push({ 'Fleet': "" });
      this.excelData.push({ 'Asset ID': "" });
      this.excelData.push({ 'year': "" });
      this.excelData.push({ 'First-Decal': "" });
      this.excelData.push({ 'Second-Decal': "" });
      let currentDate = (new Date).toISOString().slice(0, 10);
      let fileName = 'Ifta_Sample_File_' + currentDate;
      this.downloadExcelService.exportAsExcelFile(this.excelData, fileName)
    }
  }
  
  getYear(year_id){
    let year_name = '';
    for(let i in this.iftayears){
      if(year_id == this.iftayears[i].ifta_year_id){
        year_name = this.iftayears[i].year_name;
      }
    }
    return year_name;
  }
  arrayBuffer: any;
  
  Upload(){
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
      if(this.canUpload) {
        for(let i = 0 ; i < this.submittedExcelfile.length ; i++) {
          console.log(this.submittedExcelfile[i]);
          let innerObject = {};
          let newFleet = this.submittedExcelfile[i]['Fleet'].toString().trim();
          let newAsset = this.submittedExcelfile[i]['Asset ID'].toString().trim();
          let year = this.submittedExcelfile[i]['year'].toString().trim();
          console.log(newFleet);
          for(let f in this.fleets){
            if(newFleet == this.fleets[f].fleet_name) {
              this.submittedExcelfile[i]['fleet_id'] = this.fleets[f].fleet_id;
            }
          }
          for(let ad in this.assetsdrop){
            if(newAsset == this.assetsdrop[ad].asset_number_id) {
              this.submittedExcelfile[i]['asset_id'] = this.assetsdrop[ad].asset_id;
            }
          }
          for(let y in this.iftayears){
            if(year == this.iftayears[y].year_name) {
              this.submittedExcelfile[i]['ifta_year_id'] = this.iftayears[y].ifta_year_id;
            }
          }
          for(let l in this.alliftaAssets){
            if ((this.submittedExcelfile[i]['First-Decal'].toString().toLowerCase().trim() == this.alliftaAssets[l].decal_first.toLowerCase()) || (this.submittedExcelfile[i]['Second-Decal'].toString().toLowerCase().trim() == this.alliftaAssets[l].decal_second.toLowerCase()) || (this.submittedExcelfile[i]['First-Decal'].toString().toLowerCase().trim() == this.alliftaAssets[l].decal_second.toLowerCase()) || (this.submittedExcelfile[i]['Second-Decal'].toString().toLowerCase().trim() == this.alliftaAssets[l].decal_first.toLowerCase())){
              console.log("Entered");
              this.alertService.createAlert("Decal# is already existed",0);
              this.duplicate = false;
              break;
            } else {
              this.duplicate = true;
            }
          }
          console.log(this.bulkUploadArray);
          if(this.duplicate == true){
            innerObject = {"fleet_id":this.submittedExcelfile[i]['fleet_id'],"asset_id":this.submittedExcelfile[i]['asset_id'],"ifta_year_id":this.submittedExcelfile[i]['ifta_year_id'],"decal_first":this.submittedExcelfile[i]['First-Decal'],"decal_second":this.submittedExcelfile[i]['Second-Decal'],"carrier_id":JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id}
            this.bulkUploadArray.push(innerObject);
          }
          else {
            this.bulkUploadArray = [];
          }
        }
        if(this.bulkUploadArray.length){
          this.carrierService.addBulkIftaAssets(this.bulkUploadArray).then(data => {
            if(data.success) {
              this.alertService.createAlert("Assets uploaded successfully",1);
              this.getIftaAssets({});
            }
            else {
              this.alertService.createAlert(data.message,0);
            }
            this.bulkUploadArray = [];
          })
        }
      } else {
        this.alertService.createAlert("Asset with details already exists",0);
      }
    }
    fileReader.readAsArrayBuffer(this.file);
  }
  
  fliterSearch() {
    let filters = {};
    if(this.fleet_filter)
    filters['fleet_id'] = this.fleet_filter;
    if(this.asset_filter)
    filters['asset_id'] = this.asset_filter;
    this.getIftaAssets(filters);
  }
  
  clearFilters() {
    this.fleet_filter = '';
    this.asset_filter = '';
    this.getIftaAssets({});
  }
}

export class dataArray { 
  year_Id: number;
  year_name: string = '';
}