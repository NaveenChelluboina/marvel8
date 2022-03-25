import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AddfleetDialogComponent } from './addfleet-dialog/addfleet-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../carriers.service';
import { FleetCommentsComponent } from './fleet-comments/fleet-comments.component';

@Component({
  selector: 'app-fleet-information',
  templateUrl: './fleet-information.component.html',
  styleUrls: ['./fleet-information.component.scss']
})
export class FleetInformationComponent implements OnInit {
  
  filterToggle: boolean;
  fleetForm = new FormControl();
  public usingObject : any;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  public fleetList = [];
  public fleetIrp = [];
  public status_filter = "";
  public irp_filter = "";
  public totalFleetList = [];
  showEmpty: boolean = true;
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this driver?';
  public popoverStatusTitle: string = 'Confirm Status Change';
  public popoverStatusMessage: string = 'Are you sure you want to change this driver status?';
  public cancelClicked: boolean = false;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  public totalFleets: any;
  fleetnameAssending : boolean = false;
  irpAssending : boolean = false;
  statusAssending : boolean = false;
  status = [{'status_id':'1','status_name':'Active'},
  {'status_id':'0','status_name':'Inactive'}
]

irp = [{'irp_id':'1','irp_name':'Yes'},
{'irp_id':'0','irp_name':'No'}
]

constructor( public dialog: MatDialog,public carrierService:CarriersService, public alertService: AlertService) { }

ngOnInit() {
  this.getIrp();
  let sort = sessionStorage.getItem('sort');
  if(sort){
    this.getFleet(JSON.parse(sort));
  } else {
    this.getFleet({});
  }
  let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[3];
  this.canCreate = parseInt(userdata.permission_type.split('')[0]);
  this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
  this.canDelete = parseInt(userdata.permission_type.split('')[3]);
  
}

//   public handlePage(e: any) {
//     // this.currentPage = e.pageIndex;
//     // this.pageSize = e.pageSize;
//     // this.fleetList = this.totalFleetList.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
// }

public handlePage(e: any) {
  this.currentPage = e.pageIndex;
  this.pageSize = e.pageSize;
  if(this.usingObject) {
    this.getFleet(this.usingObject);
    this.getIrp();
  }
  else {
    this.getFleet({});
    this.getIrp();
  } 
}
getIrp() {
  let filters = {}
  filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  this.carrierService.getIrp(filters).then(data => {
    if (data.success) {
      this.fleetIrp = data.results;
    }
  })
}

getFleet(filters) {
  filters['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  this.carrierService.getFleet(filters).then(data => {
    if (data.success) {
      for(let i in data.results){
       for(let j in this.fleetIrp){
         if(data.results[i].fleet_id == this.fleetIrp[j].fleet_id) {
            if(this.fleetIrp[j].trs_tbl_irp){
              if((this.fleetIrp[j].trs_tbl_irp.trs_tbl_irp_fleet_years.length != 0) || (this.fleetIrp[j].trs_tbl_irp.trs_tbl_irp_weight_groups.length != 0)){
                  data.results[i]['is_delete'] = true;
              } else {
                 data.results[i]['is_delete'] = false;
              }
            } else {
               data.results[i]['is_delete'] = false;
         }
     }
  }
}
 console.log(data.results);
      this.totalFleets = data.results;
      this.fleetList = this.totalFleets.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
      this.totalSize =  data.results.length;
      data.count ? this.showEmpty = false : this.showEmpty = true;
    }
    else {
      this.fleetList = [];
      this.showEmpty = true;
      this.alertService.createAlert(data.message, 0);
    }
  })
}

public openFleetDialog(data) {
  let dialogRef = this.dialog.open(AddfleetDialogComponent, {
    data: data,
    height: 'auto',
    width: '600px',
    autoFocus: false
  });
  dialogRef.afterClosed().subscribe(data => {
    if(data == 'save'){
      this.getFleet({})
      this.getIrp();
    }
  });
}

openNote(fleet){
  let dialogRef = this.dialog.open(FleetCommentsComponent, {
    data:fleet,
    height: 'auto',
    width: '400px',
    autoFocus: false
  });
  
  dialogRef.afterClosed().subscribe(prospects => {
    if(prospects == 'save') {
      this.getFleet({});
      this.getIrp();
    }
  });
}
getAllFleetsSorted(data) {
  let obj = {};
  if(data == "a-z") {
    obj['a-z'] = 1;
  }
  if(data == 'z-a') {
    obj['z-a'] = 1;
  }
  this.getFleet(obj);
  sessionStorage.setItem('sort', JSON.stringify(obj));
  this.getIrp();
}

// updateFleet(id,status,value) {
//   let finalObj = {};
//   finalObj['fleet_id'] = id;
//   if(value == 'active') {
//     finalObj['is_active'] = status;
//   }
//   this.carrierService.updateFleet(finalObj).then(data => {
//     if(data.success) {
//       if(value == 'active')
//       this.alertService.createAlert("Fleet " + (status ? 'activated' : 'deactivated') + ' successfully',1);
//       let filterObj = {};
//       if(this.status_filter) {
//         if(this.status_filter == "2") {
//           filterObj['is_active'] = 0;  
//         } 
//         else 
//         filterObj['is_active'] = this.status_filter;
//       }
//       this.getFleet(filterObj);
//     }
//     else {
//       this.alertService.createAlert(data.message,0);
//     }
//   });
// }

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
      finalObj['fleet_id'] = data.fleet_id;
      finalObj['is_deleted'] = 1;
      this.carrierService.updateFleet(finalObj).then(data => {
        if (data.success) {
          this.alertService.createAlert("Fleet deleted successfully", 1);
          this.getFleet({});
          this.getIrp();
        }
        else {
          this.alertService.createAlert(data.message, 0);
        }
      })  
    }
  });
}

fleetNameClicked(order) {
  if(order) {
    this.fleetList.sort(function(a, b) {
      var titleA = a.fleet_name, titleB = b.fleet_name;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.fleetList.sort(function(a, b) {
      var titleA = b.fleet_name, titleB = a.fleet_name;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

IRPClicked(order) {
  if(order) {
    this.fleetList.sort(function(a, b) {
      return a.is_irp - b.is_irp;
    });
  }
  else {
    this.fleetList.sort(function(a, b) {
      return b.is_irp - a.is_irp;
    });
  }
  
}

ActiveClicked(order) {
  if(order) {
    this.fleetList.sort(function(a, b) {
      return a.is_active - b.is_active;
    });
  }
  else {
    this.fleetList.sort(function(a, b) {
      return b.is_active - a.is_active;
    });
  }
  
}


fliterSearch() {
  let filters = {};
  if (this.status_filter){
    filters['is_active'] = parseInt(this.status_filter);
  } 
  if (this.irp_filter){
    filters['is_irp'] = parseInt(this.irp_filter);
  }
  if (this.fleetForm.value){
    filters['fleet_name'] = this.fleetForm.value.trim();
  } 
  this.usingObject = filters;
  this.getFleet(filters);
  this.getIrp();
}

clearFilters() {
  this.status_filter = '';
  this.irp_filter = '';
  this.fleetForm.setValue('');
  this.usingObject = {};
  this.getFleet({});
  this.getIrp();
  }
}
