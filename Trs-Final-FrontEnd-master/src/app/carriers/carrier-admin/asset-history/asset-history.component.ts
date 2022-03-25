import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import { PageEvent } from '@angular/material';
import { MatDialog } from '@angular/material';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
import { FormControl } from '@angular/forms';
import { AssetHistoryDialogComponent } from './asset-history-dialog/asset-history-dialog.component';

@Component({
  selector: 'app-asset-history',
  templateUrl: './asset-history.component.html',
  styleUrls: ['./asset-history.component.scss']
})
export class AssetHistoryComponent implements OnInit {

  tableList: any;
  showEmpty : boolean = true;
  filterToggle: boolean;
  userControl = new FormControl();
  driverControl = new FormControl();
  public status_filter = "";
  pageEvent: PageEvent;
  assetAssending : boolean = false;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  public searchText: string;
  public page: any;
  tableLists: any;
  documentData : any;
  status = [{id:1,value:"Driver Documents"},{id:2,value:"Asset Documents"},{id:3,value:"Corporate Documents"}]
  
  public settings: Settings;
  totaldocumentData: any;
  constructor(public appSettings: AppSettings,public alertService:AlertService,public dialog: MatDialog,public carrierService:CarriersService) {
    this.settings = this.appSettings.settings;
  }
  
  ngOnInit() {
    this.getAssetHist({});
  }
  
  filterSearch() {
    let filterObj = {};
    if(this.userControl.value) {
      filterObj['asset_number_id'] = this.userControl.value.trim();
    }
    this.getAssetHist(filterObj);
  }
  
  clearFilters() {
    this.userControl.setValue('');
    this.getAssetHist({});
  }
  
  getAssetHist(filterObj) {
    filterObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getAssetHistory(filterObj).then(data => {
      if(data.success) {
        for(let i = 0 ; i < data.result.length ; i++) {
          let finalArray = [];
          for(let j = 0 ; j < data.result[i].trs_tbl_drivers.length ; j++) {
            finalArray.push(data.result[i].trs_tbl_drivers[j].driver_first_name + ' ' + data.result[i].trs_tbl_drivers[j].driver_last_name);
          }
          data.result[i].currentDrivers = finalArray;
        }
        this.totaldocumentData = data.result;
        this.documentData = this.totaldocumentData.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
        if(data.result.length) {
          this.showEmpty = false;
          this.totalSize = data.result.length;
        }
        else {
          this.showEmpty = true;
          this.totalSize = data.result.length;
        }
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }

  openHistoryDialog(asset) {
    let dialogRef = this.dialog.open(AssetHistoryDialogComponent, {
      data: asset,
      height: 'auto',
      width: '900px',
      autoFocus: false,
    });
    
    dialogRef.afterClosed().subscribe(prospects => {
      if(prospects == 'save') {
       
      }
    });
  }

  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.documentData = this.totaldocumentData.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
  }

  assetClicked(order) {
    if(order) {
      this.documentData.sort(function(a, b) {
        var titleA = a.asset_number_id, titleB = b.asset_number_id;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.documentData.sort(function(a, b) {
        var titleA = b.asset_number_id, titleB = a.asset_number_id;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

}
