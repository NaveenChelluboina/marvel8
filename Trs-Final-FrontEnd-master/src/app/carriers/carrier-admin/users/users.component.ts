import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AddUserComponent } from './add-user/add-user.component';
import { CarriersService } from '../../carriers.service';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
// import { AddPermissionComponent } from './add-permission/add-permission.component';
import { PageEvent } from '@angular/material';
// import { AdminService } from '../admin.service';
import { AlertService } from '../../../shared/services/alert.service';
import { FormControl } from '@angular/forms';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  
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
  nameAssending:boolean = false;
  emailAssending:boolean = false;
  contactAssending:boolean = false;
  statusAssending:boolean = false;
  roleAssending : boolean = false;
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this user?';
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
  public carrierData : any;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  public assets : any;
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
        filterObj['user_name'] = this.userControl.value.trim();
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
      this.getAllUsers(filterObj);
    }
    
    clearFilters() {
      this.status_filter = '';
      this.userControl.setValue('');
      this.usingObject = {}
      this.getAllUsers({});
    }

    NameClicked(order) {
      if(order) {
        this.Users.sort(function(a, b) {
          var titleA = a.user_name, titleB = b.user_name;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      else {
        this.Users.sort(function(a, b) {
          var titleA = b.user_name, titleB = a.user_name;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      
    }

    ContactClicked(order) {
      if(order) {
        this.Users.sort(function(a, b) {
          var titleA = a.phone, titleB = b.phone;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      else {
        this.Users.sort(function(a, b) {
          var titleA = b.phone, titleB = a.phone;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      
    }

    ActiveClicked(order) {
      if(order) {
        this.Users.sort(function(a, b) {
          return a.is_active - b.is_active;
        });
      }
      else {
        this.Users.sort(function(a, b) {
          return b.is_active - a.is_active;
        });
      }
      
    }

    EmailClicked(order) {
      if(order) {
        this.Users.sort(function(a, b) {
          var titleA = a.user_email, titleB = b.user_email;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      else {
        this.Users.sort(function(a, b) {
          var titleA = b.user_email, titleB = a.user_email;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      
    }

    RoleClicked(order) {
      if(order) {
        this.Users.sort(function(a, b) {
          var titleA = a.sortRole, titleB = b.sortRole;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      else {
        this.Users.sort(function(a, b) {
          var titleA = b.sortRole, titleB = a.sortRole;
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        });
      }
      
    }
    
    
    Users = [];
    ngOnInit() {
      this.carrierData = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      this.getAllUsers({});
      let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[9];
      this.canCreate = parseInt(userdata.permission_type.split('')[0]);
      this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
      this.canDelete = parseInt(userdata.permission_type.split('')[3]);
      console.log(userdata)
    }
    
    public getAllUsers(filter) {
      filter['per_page'] = this.pageSize;
      filter['page'] = this.currentPage;
      filter['carrier_id'] = this.carrierData;
      this.carrierService.getAllUsers(filter).then(data => {
        if(data.success) {
          for(let i = 0 ; i < data.results.length ; i++) {
            data.results[i]['sortRole'] = data.results[i].trs_tbl_role.role_name;
          }
          this.Users = data.results;
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
      })
    }
    
    public openUserDialog(status) {
      let dialogRef = this.dialog.open(AddUserComponent, {
        data:status,
        height: 'auto',
        width: '600px',
        autoFocus: false,
        panelClass: 'my-dialog'
      });
      dialogRef.afterClosed().subscribe(data => {
        if(data == 'save') {
          if(this.usingObject)
          this.getAllUsers(this.usingObject);
          else 
          this.getAllUsers({});
        }
      });
    }
    
    updateUsers(id,status,value) {
      let finalObj = {};
      finalObj['user_id'] = id;
      if(value == 'delete') {
        finalObj['is_deleted'] = status;
      }
      if(value == 'active') {
        finalObj['is_active'] = status;
      }
      this.carrierService.updateUser(finalObj).then(data => {
        if(data.success) {
          if(value == 'active')
          this.alertService.createAlert("User " + (status ? 'activated' : 'deactivated') + ' successfully',1);
          if(value == 'delete')
          this.alertService.createAlert("User deleted successfully",1);
          let filterObj = {};
          if(this.status_filter) {
            if(this.status_filter == "2") {
              filterObj['is_active'] = 0;  
            } 
            else 
            filterObj['is_active'] = this.status_filter;
          }
          if(this.userControl.value) {
            filterObj['user_name'] = this.userControl.value;
          } 
          this.getAllUsers(filterObj);
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
          finalObj['user_id'] = data.user_id;
          finalObj['is_deleted'] = 1;
          this.carrierService.updateUser(finalObj).then(data => {
            if (data.success) {
              this.alertService.createAlert("User deleted successfully", 1);
              this.getAllUsers({});
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
      this.getAllUsers(this.usingObject);
      else 
      this.getAllUsers({});
    }
    
  }
  