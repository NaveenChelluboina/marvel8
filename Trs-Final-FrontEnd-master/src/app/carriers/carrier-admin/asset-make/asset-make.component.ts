import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
// import { AddPermissionComponent } from './add-permission/add-permission.component';
import { PageEvent } from '@angular/material';
// import { AdminService } from '../admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import { FormControl } from '@angular/forms';
import { AddAssetMakeComponent } from './add-asset-make/add-asset-make.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
// import { AddAssetTypeComponent } from './add-asset-type/add-asset-type.component';

@Component({
  selector: 'app-asset-make',
  templateUrl: './asset-make.component.html',
  styleUrls: ['./asset-make.component.scss']
})
export class AssetMakeComponent implements OnInit {
  
  tableList: any;
  pageEvent: PageEvent;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  public searchText: string;
  public page: any;
  tableLists: any;
  public permission_filter = "";
  public status_filter = "";
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this asset make?';
  public popoverStatusTitle: string = 'Confirm Status Change';
  public popoverStatusMessage: string = 'Are you sure you want to change status?';
  public cancelClicked: boolean = false;
  showEmpty: boolean = false;
  
  filterToggle: boolean;
  toggleFilter() {
    this.filterToggle = !this.filterToggle;
  }
  public dateTime2: Date;
  public usingObject : any;
  public dateTime3: Date;
  status = [{id:1 , value:"Active"} , {id:2 , value:"Inactive"}];
  stepsOptionSelected: any;
  userControl = new FormControl();
  permissionsDropdown:any;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  public assets : any;
  assettypeAssending : boolean = false;
  assetnameAssending : boolean = false;
  activeAssending : boolean = false;
  
  onStepsOptionsSelected(event){
    
  }
  
  public settings: Settings;
  constructor(public appSettings: AppSettings,public alertService:AlertService,
    public dialog: MatDialog,public carrierService:CarriersService) {
      this.settings = this.appSettings.settings;
    }
    ngOnInit() {
      this.tableList = [];
      this.getAssetMake({});
      let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[12];
      this.canCreate = parseInt(userdata.permission_type.split('')[0]);
      this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
      this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    }
    
    filterSearch() {
      let filterObj = {};
      if(this.userControl.value) {
        filterObj['asset_make_name'] = this.userControl.value.trim();
      }
      if(this.status_filter) {
        if(this.status_filter == "2") {
          filterObj['is_active'] = 0;
        }
        else {
          filterObj['is_active'] = 1;
        }
      }
      this.usingObject = filterObj;
      this.getAssetMake(filterObj);
    }
    
    clearFilters() {
      this.status_filter = '';
      this.userControl.setValue('');
      this.usingObject = {}
      this.getAssetMake({});
    }

    AssetNameClicked(order) {
      if(order) {
        this.assets.sort(function(a, b) {
          var titleA = a.asset_make_name, titleB = b.asset_make_name;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      else {
        this.assets.sort(function(a, b) {
          var titleA = b.asset_make_name, titleB = a.asset_make_name;
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

    AssetTypeClicked(order) {
      if(order) {
        this.assets.sort(function(a, b) {
          return a.asset_type - b.asset_type;
        });
      }
      else {
        this.assets.sort(function(a, b) {
          return b.asset_type - a.asset_type;
        });
      }
      
    }
    
    public getAssetMake(filter) {
      filter['per_page'] = this.pageSize;
      filter['page'] = this.currentPage;
      this.carrierService.getAssetMakes(filter).then(data => {
        if(data.success) {
          for(let i = 0 ; i < data.results.length ; i++) {
            if(data.results[i].asset_type == 1) {
              data.results[i].asset_type_new = "Power Unit";
            }
            else {
              data.results[i].asset_type_new = "Trailer";
            }
          }
          this.assets = data.results;
          if(data.results) {
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
    
    public openAssetDialog(id) {
      let dialogRef = this.dialog.open(AddAssetMakeComponent, {
        data: id,
        height: 'auto',
        width: '450px',
        autoFocus:false
      });
      dialogRef.afterClosed().subscribe(data => {
        if(data == 'save') {
          if(this.usingObject)
          this.getAssetMake(this.usingObject);
          else 
          this.getAssetMake({});
        }
      });
    }

    openDeleteDialog(data) {
      let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: data,
        height: 'auto',
        width: 'auto',
        autoFocus: false
      });
      dialogRef.afterClosed().subscribe(data => {
        if (data != null && data !== undefined) {
          let finalObj = {};
          finalObj['asset_make_id'] = data.asset_make_id;
          finalObj['is_deleted'] = 1;
          this.carrierService.updateAssetMake(finalObj).then(data => {
            if (data.success) {
              this.alertService.createAlert("Asset-Make deleted successfully", 1);
              this.getAssetMake({});
            }
            else {
              this.alertService.createAlert(data.message, 0);
            }
          })  
        }
      });
    }
    
    updateAssetMake(id,status,value) {
      let finalObj = {};
      finalObj['asset_make_id'] = id;
      if(value == 'delete') {
        finalObj['is_deleted'] = status;
      }
      if(value == 'active') {
        finalObj['is_active'] = status;
      }
      this.carrierService.updateAssetMake(finalObj).then(data => {
        if(data.success) {
          if(value == 'active')
          this.alertService.createAlert("Asset-Make " + (status ? 'activated' : 'deactivated') + ' successfully',1);
          if(value == 'delete')
          this.alertService.createAlert("Asset-Make deleted successfully",1);
          let filterObj = {};
          if(this.status_filter) {
            if(this.status_filter == "2") {
              filterObj['is_active'] = 0;  
            } 
            else 
            filterObj['is_active'] = this.status_filter;
          }
          if(this.userControl.value) {
            filterObj['asset_make_name'] = this.userControl.value;
          } 
          this.getAssetMake(filterObj);
        }
        else {
          this.alertService.createAlert(data.message,0);
        }
      });
    }
    
    public handlePage(e: any) {
      this.currentPage = e.pageIndex;
      this.pageSize = e.pageSize;
      if(this.usingObject)
      this.getAssetMake(this.usingObject);
      else 
      this.getAssetMake({});
    }
  }
  