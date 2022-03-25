import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from '../../../shared/services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../admin.service';
import { forEach } from '@angular/router/src/utils/collection';



@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.scss'],
    providers: [AlertService]
  })
  export class PermissionsComponent implements OnInit {
      userId = null;
      updatedPermissions = [];
      constructor(private location:Location, private adminService: AdminService, private alertService: AlertService, private route: ActivatedRoute, private changeDetectorRefs: ChangeDetectorRef) {}
      public permissions = [];
      ngOnInit() {
        this.userId = this.route.snapshot.paramMap.get('userId');
        this.getUserPermissions(this.userId);
      }
      goBack() {
        this.location.back();
      }

      getUserPermissions(userId) {
        this.adminService.getUserPermissions(userId)
        .then(perms => {
                if(perms.success) {
                    let results = perms.results;
                    let requiredArray = [];
                    results.forEach(function (ele) {
                      let Obj = {};
                      Obj['name'] = ele['right_master_name'];
                      Obj['permission_id'] = ele['permission_id'];
                      Obj['create'] = parseInt(ele['permission_type'].split('')[0]);
                      Obj['read'] = parseInt(ele['permission_type'].split('')[1]);
                      Obj['update'] = parseInt(ele['permission_type'].split('')[2]);
                      Obj['delete'] = parseInt(ele['permission_type'].split('')[3]);
                      requiredArray.push(Obj);
                    });
                    this.permissions = requiredArray;
                    this.changeDetectorRefs.detectChanges();
                } else {
                    this.permissions = [];
                    this.alertService.createAlert(perms.message, 0);
                }
            }
        );
      }

      savePermissions() {
        let finalObj = {"items":[]};
        for(let i = 0; i< this.permissions.length; i++) {
          let Obj = {};
          Obj['permission_id'] = this.permissions[i]['permission_id'];
          Obj['permission_type'] = ''+this.permissions[i]['create']+this.permissions[i]['read']+this.permissions[i]['update']+this.permissions[i]['delete'];
          finalObj.items.push(Obj);
        }
        this.adminService.updateUserPermissions(finalObj)
        .then(data => {
          if(data.success) {
           this.alertService.createAlert("Permissions saved successfully", 1);
          }
          else {
            this.alertService.createAlert(data.message,0);
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
      }
  }