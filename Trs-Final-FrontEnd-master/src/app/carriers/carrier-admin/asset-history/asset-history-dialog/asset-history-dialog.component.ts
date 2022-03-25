import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
// import { CarriersService } from '../../carriers.service';
// import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-asset-history-dialog',
  templateUrl: './asset-history-dialog.component.html',
  styleUrls: ['./asset-history-dialog.component.scss']
})
export class AssetHistoryDialogComponent implements OnInit {
  showEmpty: boolean = true;
  lastnameAssending :boolean = false;
  fromdateAssending :boolean = false;
  todateAssending :boolean = false;
  daysAssending:boolean = false;
  
  constructor(public fb:FormBuilder,public dialogRef: MatDialogRef<AssetHistoryDialogComponent>,@Inject(MAT_DIALOG_DATA) public assetHistory: any) { 
  }
  
  close(): void {
    this.dialogRef.close();
  }

  LastNameClicked(order) {
    if(order) {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var titleA = a.trs_tbl_driver.driver_last_name, titleB = b.trs_tbl_driver.driver_last_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var titleA = b.trs_tbl_driver.driver_last_name, titleB = a.trs_tbl_driver.driver_last_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  Fromdate(order) {
    if(order) {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var dateA = new Date(a.date).valueOf(), dateB = new Date(b.date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var dateA = new Date(a.date).valueOf(), dateB = new Date(b.date).valueOf();
        return dateB - dateA;
      });
    }
    
  }

  Todate(order) {
    if(order) {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var dateA = new Date(a.to_date).valueOf(), dateB = new Date(b.to_date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var dateA = new Date(a.to_date).valueOf(), dateB = new Date(b.to_date).valueOf();
        return dateB - dateA;
      });
    }
    
  }

  NumberClicked(order) {
    if(order) {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var titleA = parseInt(a.Difference_In_Days), titleB = parseInt(b.Difference_In_Days);
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.assetHistory.trs_tbl_driver_asset_histories.sort(function(a, b) {
        var titleA = parseInt(b.Difference_In_Days), titleB = parseInt(a.Difference_In_Days);
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  ngOnInit() {
    if(!this.assetHistory.trs_tbl_driver_asset_histories.length)
    this.showEmpty = true;
    else
    this.showEmpty = false;
    for(let i = 0 ; i < this.assetHistory.trs_tbl_driver_asset_histories.length ; i++) {
      if(this.assetHistory.trs_tbl_driver_asset_histories[i].to_date) {
        var date1 = new Date(this.assetHistory.trs_tbl_driver_asset_histories[i].date); 
        var date2 = new Date(this.assetHistory.trs_tbl_driver_asset_histories[i].to_date);
        var Difference_In_Time = date2.getTime() - date1.getTime();  
        this.assetHistory.trs_tbl_driver_asset_histories[i].Difference_In_Days = (Difference_In_Time / (1000 * 3600 * 24)+1).toString();
      }
      else {
        var date1 = new Date(this.assetHistory.trs_tbl_driver_asset_histories[i].date); 
        var date2 = new Date();
        var Difference_In_Time = date2.getTime() - date1.getTime();  
        let days = (Difference_In_Time / (1000 * 3600 * 24)+1).toString();
        this.assetHistory.trs_tbl_driver_asset_histories[i].Difference_In_Days = days.split('.')[0];
      }
    }
    console.log(this.assetHistory);
  }
  
}
