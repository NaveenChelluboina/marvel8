import { Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from '../../../../shared/services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { CarriersService } from '../../../carriers.service';

@Component({
  selector: 'app-role-permissions',
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss'],
  providers: [AlertService] 
})

export class RolePermissionsComponent implements OnInit {
  
  roleId = null;
  public perm = false;
  public permAdministration : any;
  public permissions = [];
  public allSelector : any;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  constructor(public carrierService:CarriersService,private location:Location, private alertService: AlertService,public route:ActivatedRoute) {}
  ngOnInit() {
    this.permAdministration = sessionStorage.getItem('checkForAdminCreation');
    this.roleId = this.route.snapshot.paramMap.get('roleId');
    this.getRolePermissions(this.roleId);
    let userData = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[10];
    this.canCreate = parseInt(userData.permission_type.split('')[0]);
    this.canUpdate = parseInt(userData.permission_type.split('')[2]);
    this.canDelete = parseInt(userData.permission_type.split('')[3]);
  }
  goBack() {
    this.location.back();
  }
  
  clickFunction(permis) {
    if(permis) {
      this.perm = true;
      for(let i = 0; i < this.permissions.length; i++) {
        this.permissions[i].create = 1;
        this.permissions[i].delete = 1;
        this.permissions[i].read = 1;
        this.permissions[i].update = 1;
      }
    }
    else {
      this.perm = false;
      for(let i = 0; i < this.permissions.length; i++) {
        this.permissions[i].create = 0;
        this.permissions[i].delete = 0;
        this.permissions[i].read = 0;
        this.permissions[i].update = 0;
      }
    }
  }
  
  saveRolePermissions() {
    let finalObj = {"items":[]};
    for(let i = 0; i< this.permissions.length; i++) {
      let Obj = {};
      Obj['permission_id'] = this.permissions[i]['permission_id'];
      Obj['permission_type'] = ''+this.permissions[i]['create']+this.permissions[i]['read']+this.permissions[i]['update']+this.permissions[i]['delete'];
      finalObj.items.push(Obj);
    }
    this.carrierService.updateUserPermissions(finalObj)
    .then(data => {
      if(data.success) {
        this.alertService.createAlert("Permissions saved successfully", 1);
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  getRolePermissions(roleId) {
    this.carrierService.getRolePermissions(roleId).then(data => {
      if(data.success) {
        let results = data.results;
        let reqArray = [];
        results.forEach(element => {
          if(this.permAdministration == 1) {
            if(element['right_master_name'] == 'Subscriptions') {
              
            }
            else {
              let obj = {};
              obj['screenName'] = element['right_master_name'];
              obj['permission_id'] = element['permission_id'];
              obj['create'] = parseInt(element['permission_type'].split('')[0]);
              obj['read'] = parseInt(element['permission_type'].split('')[1]);
              obj['update'] = parseInt(element['permission_type'].split('')[2]);
              obj['delete'] = parseInt(element['permission_type'].split('')[3]);
              if(obj['create'] == 0 || obj['read'] == 0 || obj['update'] == 0 || obj['delete'] == 0) {
                this.allSelector = false;
                this.perm = this.allSelector;
              }
              else {
                this.allSelector = true;
                this.perm = this.allSelector;
              }
              reqArray.push(obj);
            }
          }
          else {
            let obj = {};
            obj['screenName'] = element['right_master_name'];
            obj['permission_id'] = element['permission_id'];
            obj['create'] = parseInt(element['permission_type'].split('')[0]);
            obj['read'] = parseInt(element['permission_type'].split('')[1]);
            obj['update'] = parseInt(element['permission_type'].split('')[2]);
            obj['delete'] = parseInt(element['permission_type'].split('')[3]);
            if(obj['create'] == 0 || obj['read'] == 0 || obj['update'] == 0 || obj['delete'] == 0) {
              this.allSelector = false;
              this.perm = this.allSelector;
            }
            else {
              this.allSelector = true;
              this.perm = this.allSelector;
            }
            reqArray.push(obj);
          }
          
        });
        this.permissions = reqArray;
      }
      else {
        this.permissions = [];
        this.alertService.createAlert(data.message, 0);
      }
    })
  }
  
  onPermissionChange(permission, type) {
    for(let i = 0; i< this.permissions.length; i++){
      if(this.permissions[i]['permission_id'] === permission.permission_id) {
        if(type === 'create') 
        this.permissions[i]['create'] = permission.create ? 1:0;
        if(type === 'read') 
        this.permissions[i]['read'] = permission.read ? 1:0;
        if(type === 'update') 
        this.permissions[i]['update'] = permission.update ? 1:0;
        if(type === 'delete') 
        this.permissions[i]['delete'] = permission.delete ? 1:0;
      }
    }
    var countingNow = 1;
    for(let i = 0; i< this.permissions.length; i++){
      if(parseInt(this.permissions[i].create) == 0) {
        countingNow = 0;
        break;
      }
      if(parseInt(this.permissions[i].read) == 0) {
        countingNow = 0;
        break;
      }
      if(parseInt(this.permissions[i].update) == 0) {
        countingNow = 0;
        break;
      }
      if(parseInt(this.permissions[i].delete) == 0) {
        countingNow = 0;
        break;
      }
      
    }
    if(countingNow == 0) {
      this.allSelector = false;
      this.perm = this.allSelector;
    }
    else {
      this.allSelector = true;
      this.perm = this.allSelector;
    }
  }
  
}
