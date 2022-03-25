import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AlertService } from '../../../shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import {PageEvent, MatDialog} from '@angular/material';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  
  tableList: any;
  public popoverStatusTitle: string = 'Confirm Save Change';
  public popoverStatusMessage: string = 'Are you sure you want to save changes?';
  public cancelClicked: boolean = false;
  pageEvent: PageEvent;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  public page: any;
  canCreate:any;
  canUpdate:any;
  canDelete:any;
  showEmpty: boolean = true;
  list : any;
  public carrierData:any;
  timezones: any;
  
  constructor(private alertService: AlertService, public dialog: MatDialog, private adminService:CarriersService,  private changeDetectorRefs: ChangeDetectorRef) { 
    //this.getTimezones({});
  }
  
  ngOnInit() {
    this.carrierData = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.getSettings();
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[8];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    
  }
  
  checkEmail(email) {
    /* let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/; */
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])/;
    if (reg.test(email) == false) {
      return false;
    } else {
      return true;
    }
  }
  
  getSettings() {
    let filterObj = {};
    filterObj['page'] = this.currentPage;
    filterObj['per_page'] = this.pageSize;
    filterObj['carrier_id'] = this.carrierData;
    this.adminService.getSettings(filterObj).then( data => {
      if(data.success) {
        this.list = data.results;
        this.tableList = this.list;
        this.totalSize = data.count;
        data.count ? this.showEmpty = false : this.showEmpty = true;
        this.changeDetectorRefs.detectChanges();
        
      } else {
        this.tableList = [];
        this.totalSize = 0;
        this.showEmpty = true;
        this.alertService.createAlert(data.message, 0);
      }
    });
  }
  
  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.getSettings();
  }
  
  saveSettings(item) {
    if(!item.new_value)
    return;
    this.adminService.updateSettings(item).then( data => {
      if(data.success) {
        if(item.trs_tbl_setting.name == 'Grid Length') {
          sessionStorage.setItem('settings', item.new_value);
          localStorage.setItem('settings', item.new_value);
          this.pageSize = item.new_value;
        }
        this.getSettings();
        this.alertService.createAlert("Settings saved successfully", 1);
      } else {
        this.getSettings();
        this.alertService.createAlert(data.message, 0);
      }
    }
    );
  }
  openSaveDialog(item) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: item,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(item => {
    this.adminService.updateSettings(item).then( data => {
      if(data.success) {
        if(item.trs_tbl_setting.name == 'Grid Length') {
          sessionStorage.setItem('settings', item.new_value);
          localStorage.setItem('settings', item.new_value);
          this.pageSize = item.new_value;
        }
        this.getSettings();
        this.alertService.createAlert("Settings saved successfully", 1);
      } else {
        this.getSettings();
        this.alertService.createAlert(data.message, 0);
      }
    }
    ); 
 })  
}
   
  allow_only_numbers(event) {
    var k;
    k=event.charCode;
    return ((k > 47 && k < 58));
  }
  
}
