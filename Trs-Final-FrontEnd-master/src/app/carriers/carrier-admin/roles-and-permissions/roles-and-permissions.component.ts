import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
// import { AddPermissionComponent } from './add-permission/add-permission.component';
import { PageEvent } from '@angular/material';
// import { AdminService } from '../admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import { AddRolePermissionsComponent } from './add-role-permissions/add-role-permissions.component';
import { FormControl } from '@angular/forms';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss']
})
export class RolesAndPermissionsComponent implements OnInit {
  
  tableList: any;
  pageEvent: PageEvent;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  public searchText: string;
  public page: any;
  tableLists: any;
  roleAssending : boolean = false;
  public permission_filter = "";
  public status_filter = "";
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this role?';
  public popoverStatusTitle: string = 'Confirm Status Change';
  public popoverStatusMessage: string = 'Are you sure you want to change status?';
  public cancelClicked: boolean = false;
  showEmpty: boolean = false;
  statusAssending: boolean = false;
  filterToggle: boolean;
  toggleFilter() {
    this.filterToggle = !this.filterToggle;
  }
  public dateTime2: Date;
  permissionAdmin : any;
  public usingObject : any;
  public dateTime3: Date;
  status = [{id:1 , value:"Active"} , {id:2 , value:"Inactive"}];
  stepsOptionSelected: any;
  userControl = new FormControl();
  permissionsDropdown:any;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  public roles : any;
  onStepsOptionsSelected(event){
    
  }
  
  public settings: Settings;
  constructor(public appSettings: AppSettings,public alertService:AlertService,
    public dialog: MatDialog,public carrierService:CarriersService) {
      this.settings = this.appSettings.settings;
    }
    
    filterSearch() {
      let filterObj = {};
      if(this.userControl.value) {
        filterObj['role_name'] = this.userControl.value.trim();
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
      this.getRoles(filterObj);
    }
    
    clearFilters() {
      this.status_filter = '';
      this.userControl.setValue('');
      this.usingObject = {}
      this.getRoles({});
    }

    RoleClicked(order) {
      if(order) {
        this.roles.sort(function(a, b) {
          var titleA = a.role_name, titleB = b.role_name;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      else {
        this.roles.sort(function(a, b) {
          var titleA = b.role_name, titleB = a.role_name;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      
    }
    
    ngOnInit() {
      this.permissionAdmin = sessionStorage.getItem('checkForAdminCreation');
      // console.log(sessionStorage.getItem('checkForAdminCreation'));
      this.tableList = [];
      this.getRoles({});
      // this.getRoles({});
      // this.getPermissionsDropdown();
      let userData = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[10];
      this.canCreate = parseInt(userData.permission_type.split('')[0]);
      this.canUpdate = parseInt(userData.permission_type.split('')[2]);
      this.canDelete = parseInt(userData.permission_type.split('')[3]);
    }
    
    public getRoles(filter) {
      filter['forAdminAdded'] = 0;
      if(this.permissionAdmin == 1)
      filter['forAdminAdded'] = 1;
      filter['per_page'] = this.pageSize;
      filter['page'] = this.currentPage;
      filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      console.log(filter);
      this.carrierService.getRoles(filter).then(data => {
        if(data.success) {
          this.roles = data.results;
          console.log(this.roles,"hhsgsdgdgsgh")
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
  
    public openPermissionDialog(id) {
      let dialogRef = this.dialog.open(AddRolePermissionsComponent, {
        data: id,
        height: 'auto',
        width: '460px',
        autoFocus:false
      });
      dialogRef.afterClosed().subscribe(data => {
        if(data == 'save') {
          if(this.usingObject)
          this.getRoles(this.usingObject);
          else 
          this.getRoles({});
        }
      });
    }

    ActiveClicked(order) {
      if(order) {
        this.roles.sort(function(a, b) {
          return a.is_active - b.is_active;
        });
      }
      else {
        this.roles.sort(function(a, b) {
          return b.is_active - a.is_active;
        });
      }
      
    }
    
    updatePermissionsLevel(id,status,value) {
      let finalObj = {};
      finalObj['role_id'] = id;
      if(value == 'delete') {
        finalObj['is_deleted'] = status;
      }
      if(value == 'active') {
        finalObj['is_active'] = status;
      }
      this.carrierService.updateRole(finalObj).then(data => {
        if(data.success) {
          if(value == 'active')
          this.alertService.createAlert("Permission level " + (status ? 'activated' : 'deactivated') + ' successfully',1);
          if(value == 'delete')
          this.alertService.createAlert("Permission level deleted successfully",1);
          let filterObj = {};
          if(this.status_filter) {
            if(this.status_filter == "2") {
              filterObj['is_active'] = 0;  
            } 
            else 
            filterObj['is_active'] = this.status_filter;
          }
          if(this.userControl.value) {
            filterObj['role_name'] = this.userControl.value;
          } 
          this.getRoles(filterObj);
        }
        else {
          this.alertService.createAlert(data.message,0);
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
          finalObj['role_id'] = data.role_id;
          finalObj['is_deleted'] = 1;
          this.carrierService.updateRole(finalObj).then(data => {
            if (data.success) {
              this.alertService.createAlert("Role deleted successfully", 1);
              this.getRoles({});
            }
            else {
              this.alertService.createAlert(data.message, 0);
            }
          })  
        }
      });
    }
    
    public handlePage(e: any) {
      this.currentPage = e.pageIndex;
      this.pageSize = e.pageSize;
      if(this.usingObject)
      this.getRoles(this.usingObject);
      else 
      this.getRoles({});
    }
    
  }
  