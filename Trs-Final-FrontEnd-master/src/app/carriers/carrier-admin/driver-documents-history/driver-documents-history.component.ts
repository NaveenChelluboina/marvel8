import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import { PageEvent } from '@angular/material';
import { MatDialog } from '@angular/material';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-driver-documents-history',
  templateUrl: './driver-documents-history.component.html',
  styleUrls: ['./driver-documents-history.component.scss']
})
export class DriverDocumentsHistoryComponent implements OnInit {
  
  tableList: any;
  
  showEmpty : boolean = true;
  filterToggle: boolean;
  userControl = new FormControl();
  driverControl = new FormControl();
  public status_filter = "";
  pageEvent: PageEvent;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  public searchText: string;
  public page: any;
  tableLists: any;
  documentData : any;
  lastnameAssending : boolean = false;
  firstnameAssending : boolean = false;
  sharedAssending : boolean = false;
  dateAssending : boolean = false;
  documentnameAssending : boolean = false;
  doctypeAssending : boolean = false;
  status = [{id:1,value:"Driver Documents"},{id:2,value:"Asset Documents"},{id:3,value:"Corporate Documents"}]
  
  public settings: Settings;
  totaldocumentData: any;
  constructor(public appSettings: AppSettings,public alertService:AlertService,public dialog: MatDialog,public carrierService:CarriersService) {
    this.settings = this.appSettings.settings;
  }
  
  ngOnInit() {
    this.getDriverHistDocs({});
  }
  
  filterSearch() {
    let filterObj = {};
    if(this.userControl.value) {
      filterObj['driver_last_name'] = this.userControl.value.trim();
    }
    if(this.driverControl.value) {
      filterObj['driver_first_name'] = this.driverControl.value.trim();
    }
    if(this.status_filter) {
      filterObj['document_type'] = this.status_filter;
    }
    this.getDriverHistDocs(filterObj);
  }
  
  clearFilters() {
    this.status_filter = '';
    this.userControl.setValue('');
    this.driverControl.setValue('');
    this.getDriverHistDocs({});
  }

  LastNameClicked(order) {
    if(order) {
      this.documentData.sort(function(a, b) {
        var titleA = a.trs_tbl_driver.driver_last_name, titleB = b.trs_tbl_driver.driver_last_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.documentData.sort(function(a, b) {
        var titleA = b.trs_tbl_driver.driver_last_name, titleB = a.trs_tbl_driver.driver_last_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  docTypeClicked(order) {
    if(order) {
      this.documentData.sort(function(a, b) {
        return a.document_type - b.document_type;
      });
    }
    else {
      this.documentData.sort(function(a, b) {
        return b.document_type - a.document_type;
      });
    }
    
  }

  documentNameClicked(order) {
    if(order) {
      this.documentData.sort(function(a, b) {
        var titleA = a.documentData.document_name, titleB = b.documentData.document_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.documentData.sort(function(a, b) {
        var titleA = b.documentData.document_name, titleB = a.documentData.document_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  FirstNameClicked(order) {
    if(order) {
      this.documentData.sort(function(a, b) {
        var titleA = a.trs_tbl_driver.driver_first_name, titleB = b.trs_tbl_driver.driver_first_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.documentData.sort(function(a, b) {
        var titleA = b.trs_tbl_driver.driver_first_name, titleB = a.trs_tbl_driver.driver_first_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  SharedToClicked(order) {
    if(order) {
      this.documentData.sort(function(a, b) {
        var titleA = a.shared_to_email, titleB = b.shared_to_email;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.documentData.sort(function(a, b) {
        var titleA = b.shared_to_email, titleB = a.shared_to_email;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  date(order) {
    if(order) {
      this.documentData.sort(function(a, b) {
        var dateA = new Date(a.shared_date).valueOf(), dateB = new Date(b.shared_date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.documentData.sort(function(a, b) {
        var dateA = new Date(a.shared_date).valueOf(), dateB = new Date(b.shared_date).valueOf();
        return dateB - dateA;
      });
    }
    
  }
  
  getDriverHistDocs(filterObj) {
    
    filterObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getDriverDocsShareHistory(filterObj).then(data => {
      if(data.success) {
        this.totaldocumentData = data.results;
        this.documentData = this.totaldocumentData.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
        if(data.results.length) {
          this.showEmpty = false;
          this.totalSize = data.results.length;
        }
        else {
          this.showEmpty = true;
          this.totalSize = data.results.length;
        }
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }

  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.documentData = this.totaldocumentData.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
  }
  
}
