import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { UsersService } from './users.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { AlertService } from '../../shared/services/alert.service';
import { AdminService } from '../admin.service';
import {PageEvent} from '@angular/material';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [UsersService, AlertService]
})
export class UsersComponent implements OnInit {

    Users: any;
    operations =[{'operation_id' : '1','operation_name':'Active'},
    {'operation_id' : '2','operation_name':'Inactive'},
   ]
    public popoverTitle: string = 'Confirm Delete';
    public popoverMessage: string = 'Are you sure you want to delete this?';
    public popoverStatusTitle: string = 'Confirm Status Change';
    public popoverStatusMessage: string = 'Are you sure you want to change status.?';
    public cancelClicked: boolean = false;

    filterToggle: boolean;
    pageEvent: PageEvent;
    public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
    public currentPage = 0;
    public totalSize = 0;
    public searchText: string;
    public page: any;
    public settings: Settings;
    public name_filter = "";
    public status_filter = "";
    canCreate:any;
    canUpdate:any;
    canDelete:any;
    showEmpty: boolean = true;

    constructor(public appSettings: AppSettings,
        public dialog: MatDialog,
        public usersService: UsersService, private alertService: AlertService, private adminService:AdminService, private changeDetectorRefs: ChangeDetectorRef) {
        this.settings = this.appSettings.settings;
    }

    ngOnInit() {
        this.getUser(null);
        let userdata = JSON.parse(sessionStorage.getItem('sg_user_info')).user_permissions[12];
        this.canCreate = parseInt(userdata.permission_type.split('')[0]);
        this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
        this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    }

    getUser(filters) {
        let filterObj = {};
        filterObj['page'] = this.currentPage;
        filterObj['per_page'] = this.pageSize;
        if(filters) {
            filterObj['filter'] = filters;
        }
        this.adminService.getAllUsers(filterObj)
        .then( data => {
                if(data.success) {
                    this.Users = data.results;
                    this.totalSize = data.count;
                    data.count ? this.showEmpty = false : this.showEmpty = true;
                    this.changeDetectorRefs.detectChanges();
                } else {
                    this.Users = [];
                    this.totalSize = 0;
                    this.showEmpty = true;
                    this.alertService.createAlert(data.message, 0);
                }
            }
        )
    }

    filterUsers() {
        let temp = {};
        if(this.name_filter)
            temp['name'] = this.name_filter;
        if(this.status_filter)
            temp['is_active'] = this.status_filter;
        if(('name' in temp) || ('is_active' in temp)) {
            this.getUser(temp);
        }
    }

    omit_special_number_char(event) {
        var k;
        k=event.charCode;
        return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32)
    }

    clearFilters() {
        this.name_filter = "";
        this.status_filter = "";
        this.getUser(null);
    }

    public handlePage(e: any) {
        this.currentPage = e.pageIndex;
        this.pageSize = e.pageSize;
        this.getUser(null);
    }

    public openUserDialog(userInfo) {
        let dialogRef = this.dialog.open(UserDialogComponent, {
            data: userInfo,
            height: 'auto',
            width: '600px',
            autoFocus: false
        });
        dialogRef.afterClosed().subscribe(data => {
            if(data === "save") 
                this.getUser(null);
        });
    }
    
    updateUser(userId,changedValue,type){
        let detail = {"userId": userId, "updateFields" : type === "status" ? {"is_active": changedValue } : {"is_deleted": changedValue } };
        this.adminService.updateUser(detail).then(data => {
            if(data.success) {
                let message = "";
                if(type == 'status')
                message = changedValue ? "activated" : "inactivated";
                else
                message = "deleted";
                this.alertService.createAlert("User "+ message +" successfully" , 1);
                if(this.name_filter || this.status_filter) {
                    let temp = {};
                if(this.name_filter)
                    temp['name'] = this.name_filter;
                if(this.status_filter)
                    temp['is_active'] = this.status_filter;
                if(('name' in temp) || ('is_active' in temp)) {
                    this.getUser(temp);
                }
                } else {
                    this.getUser(null);
                }
            }
            else {
                this.alertService.createAlert(data.message , 0);
            }
        });
    }
        
}