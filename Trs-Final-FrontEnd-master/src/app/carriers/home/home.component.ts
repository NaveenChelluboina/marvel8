import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AssetDialogComponent } from '../asset-information/asset-dialog/asset-dialog.component';
import { MatDialog } from '@angular/material';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { ImgDialogComponent } from './img-dialog/img-dialog.component';
import { FormControl } from '@angular/forms';
import { CarriersService } from '../carriers.service';
import { AlertService } from '../../shared/services/alert.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    alerts: any[] = [];
    public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
    public currentPage = 0;
    public totalSize = 0;
    public totalAlerts :any;
    public country = '0';
    public carrierId : any;
    filterToggle = false;
    public corpInfo:any;
    public countingVariable = 1;
    toppingsLead = new FormControl();
    showEmpty:boolean = true;
    toppingsTimeZone = new FormControl();
    documentnameAssending : boolean = false;
    documentoriginAssending : boolean = false;
    documentreferenceAssending : boolean = false;
    expAssending : boolean = false;
    daysAssending : boolean = false;
    constructor(public cdref:ChangeDetectorRef,public alertService:AlertService,public route:ActivatedRoute,public carrierService:CarriersService,public dialog: MatDialog) {
        this.getCorpInfoInHome({});
        
    }
    operations =[{'operation_id' : '1','operation_name':'A-Z'},
    {'operation_id' : '2','operation_name':'Z-A'},
]
docType = [{'doc_id':'1','doc_name':'Driver’s license'},{'doc_id':'2','doc_name':'IFTA License'}
,{'doc_id':'3','doc_name':'Auto Liability Insurance'},{'doc_id':'4','doc_name':'NM WDT Permits'}
,{'doc_id':'5','doc_name':'NY HUT permits'},{'doc_id':'6','doc_name':'Oregon WDT permits'}]

expiryDays = [{'doc_id':'1','doc_name':'10'},{'doc_id':'2','doc_name':'20'}
,{'doc_id':'3','doc_name':'30'},{'doc_id':'4','doc_name':'40'}
,{'doc_id':'5','doc_name':'50'},{'doc_id':'6','doc_name':'60'}]

ngOnInit() {
    this.carrierId = (JSON.parse(sessionStorage.getItem('trs_user_info'))).carrier_id;
    // console.log(this.carrierId);
    this.getDriverDocuments({'carrier_id':this.carrierId});
    // this.makePaymentAPID();
    this.country = sessionStorage.getItem('country');
    this.alerts = [
        // { doc_type: 'Driver’s license', ref_num: 'TA3534DF657567', days_expiry: '10', expiry_date: '11-12-2019', document_name: '12-DD', link: 'dsadas' },
        // { doc_type: 'License Plate (IRP)', ref_num: 'BB6985DF657567', days_expiry: '60', expiry_date: '03-08-2020', document_name: 'AD-25', link: 'dsadas' },
        // { doc_type: 'IFTA License', ref_num: 'XD0534DF888567', days_expiry: '50', expiry_date: '03-02-2020', document_name: 'NM-25', link: 'dsadas' },
        // { doc_type: 'NM WDT Permits', ref_num: 'CV9966DF657567', days_expiry: '15', expiry_date: '23-10-2019', document_name: 'GH-55', link: 'dsadas' },
        // { doc_type: 'NY HUT permits', ref_num: 'WE8569DF657567', days_expiry: '40', expiry_date: '17-12-2019', document_name: 'FG-88', link: 'dsadas' },
        // { doc_type: 'Auto Liability Insurance', ref_num: 'YU0101DF657567', days_expiry: '30', expiry_date: '19-12-2019', document_name: '78-KL', link: 'dsadas' },
        // { doc_type: 'US DOT Biennial Update', ref_num: 'RF4785DF657567', days_expiry: '10', expiry_date: '28-12-2019', document_name: '78-G8', link: 'dsadas' },
        // { doc_type: 'Oregon WDT permits', ref_num: 'JH4589DF657567', days_expiry: '10', expiry_date: '30-12-2019', document_name: 'ASD-5', link: 'dsadas' },
        // { doc_type: 'IRS Heavy Vehicle Use Tax (HVUT) 2290', ref_num: 'DF89784DF657567', days_expiry: '30', expiry_date: '14-12-2019', document_name: 'DCF-4', link: 'dsadas' },
        // { doc_type: 'U.S. CBP customs transponders', ref_num: 'KL8534DF010567', days_expiry: '30', expiry_date: '23-12-2019', document_name: '3365-A', link: 'dsadas' },
        // { doc_type: 'SCAC code renewal', ref_num: 'GH2334DF667567', days_expiry: '30', expiry_date: '17-12-2019', document_name: '12365-A', link: 'dsadas' },
        // { doc_type: 'Driver’s license', ref_num: 'QW1134DF657567', days_expiry: '10', expiry_date: '11-12-2019', document_name: '1245-DD', link: 'dsadas' },
        // { doc_type: 'License Plate (IRP)', ref_num: 'ER6900DF657567', days_expiry: '60', expiry_date: '03-08-2020', document_name: '56AD-25', link: 'dsadas' },
        // { doc_type: 'IFTA License', ref_num: 'TY0534DF888000', days_expiry: '50', expiry_date: '03-02-2020', document_name: 'N11M-25', link: 'dsadas' },
        // { doc_type: 'NM WDT Permits', ref_num: 'UI9966DF657567', days_expiry: '15', expiry_date: '23-10-2019', document_name: '34GH-55', link: 'dsadas' },
        // { doc_type: 'NY HUT permits', ref_num: 'OP8569DF657567', days_expiry: '40', expiry_date: '17-12-2019', document_name: '698FG-88', link: 'dsadas' },
        // { doc_type: 'Auto Liability Insurance', ref_num: 'AS0101DF657567', days_expiry: '30', expiry_date: '19-12-2019', document_name: '25678-KL', link: 'dsadas' },
        // { doc_type: 'US DOT Biennial Update', ref_num: 'DF4785DF657567', days_expiry: '10', expiry_date: '28-12-2019', document_name: '985-G8', link: 'dsadas' },
        // { doc_type: 'Oregon WDT permits', ref_num: 'GHDF65DF657567', days_expiry: '10', expiry_date: '30-12-2019', document_name: '11SD-5', link: 'dsadas' },
        // { doc_type: 'IRS Heavy Vehicle Use Tax (HVUT) 2290', ref_num: 'KL89784DF657567', days_expiry: '30', expiry_date: '14-12-2019', document_name: 'D52F-4', link: 'dsadas' },
        // { doc_type: 'U.S. CBP customs transponders', ref_num: 'ZX8534DF010567', days_expiry: '30', expiry_date: '23-12-2019', document_name: 'AA65-A', link: 'dsadas' },
        // { doc_type: 'SCAC code renewal', ref_num: 'VB2334DF667567', days_expiry: '30', expiry_date: '17-12-2019', document_name: 'MNB5-A1', link: 'dsadas' },
    ];
    this.totalSize = this.alerts.length;
}

makePaymentAPID() {
    this.carrierService.makePaymentForPackage({});
}

getCorpInfoInHome(filter) {
    let data= this.route.snapshot.data['carriesresolver']['homeInfo'];
    console.log(data.results.length);
    if(!data.results.length)
    this.countingVariable = 0;
    this.corpInfo = data.results[0];
    console.log(this.corpInfo);
    
    // this.carrierService.getCorporateInformationInHome(filter).then(home => {
    //     if(home.success) {
    //         console.log('helooo',home.results[0]);
    //         this.corpInfo = home.results[0];
    //     }
    //     else {
    //         this.alertService.createAlert(home.message,0);
    //     }
    // })
}

public getDriverDocuments(filter) {
    this.carrierService.getDriverDocumentsInHome(filter).then(data => {
        if(data.success) {
            if(data.results.length) {
                this.showEmpty = false;
                for(let i = 0 ; i < data.results.length ; i++) {
                    data.results[i].expiringDate = data.results[i].expiringDate.split("T")[0];
                    if(data.results[i]['referene'] == null)
                    data.results[i]['reffer'] = 0;
                    else
                    data.results[i]['reffer'] = data.results[i]['referene'];
                }
                this.totalAlerts = data.results;
                this.alerts = this.totalAlerts.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
                // this.alerts = data.results;
                this.totalSize = data.results.length;
                this.cdref.detectChanges();
            }
            else {
                this.showEmpty = true;
                this.totalAlerts = [];
                this.alerts = this.totalAlerts.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
                this.totalSize = 0;
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
    this.alerts = this.totalAlerts.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
    // if(this.usingObject) {
    //   this.getDrivers(this.usingObject);
    //   this.allDrivers(this.usingObject);
    // }
    // else {
    //   this.getDrivers({});
    //   this.allDrivers({});
    // } 
}

DocumentNameClicked(order) {
    if(order) {
      this.alerts.sort(function(a, b) {
        var titleA = a.documentName, titleB = b.documentName;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.alerts.sort(function(a, b) {
        var titleA = b.documentName, titleB = a.documentName;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  DocumentOriginClicked(order) {
    if(order) {
      this.alerts.sort(function(a, b) {
        var titleA = a.documentType, titleB = b.documentType;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.alerts.sort(function(a, b) {
        var titleA = b.documentType, titleB = a.documentType;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  DocumentReferenceClicked(order) {
    if(order) {
      this.alerts.sort(function(a, b) {
        var titleA = a.reffer, titleB = b.reffer;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.alerts.sort(function(a, b) {
        var titleA = b.reffer, titleB = a.reffer;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }

  ExpClicked(order) {
    if(order) {
        this.alerts.sort(function(a, b) {
          var dateA = new Date(a.expiringDate).valueOf(), dateB = new Date(b.expiringDate).valueOf();
          return dateA - dateB;
        });
      }
      else {
        this.alerts.sort(function(a, b) {
          var dateA = new Date(a.expiringDate).valueOf(), dateB = new Date(b.expiringDate).valueOf();
          return dateB - dateA;
        });
      }
    
  }

  DaysClicked(order) {
    if(order) {
      this.alerts.sort(function(a, b) {
        return a.difference - b.difference;
      });
    }
    else {
      this.alerts.sort(function(a, b) {
        return b.difference - a.difference;
      });
    }
    
  }

openDocDialog() {
    let dialogRef = this.dialog.open(ImgDialogComponent, {
        data: 'doc',
        height: 'auto',
        width: '600px',
        autoFocus: false,
        panelClass: 'my-dialog'
    });
    
    dialogRef.afterClosed().subscribe(prospects => {
        
    });
}

openDeleteDialog(dat) { 
    let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: dat,
        height: 'auto',
        width: 'auto',
        autoFocus: false
    });
    
    dialogRef.afterClosed().subscribe(prospects => {
        if (prospects != null && prospects !== undefined) {
            let finalObj = {};
            finalObj['origin'] = dat.documentType;
            finalObj['document_id'] = dat.ID ;
            finalObj['is_removed_from_home'] = 1;
            this.carrierService.updateAlertStatus(finalObj).then(data => {
                if (data.success) {
                    this.alertService.createAlert("Alert dismissed successfully", 1);
                    this.getDriverDocuments({'carrier_id':this.carrierId});
                }
                else {
                    this.alertService.createAlert(data.message, 0);
                }
            })  
        }
    });
}
selectAll(ev, type) {
    if (ev._selected) {
        if (type == 'lead') {
            let temp = [];
            for (let i = 0; i < this.docType.length; i++) {
                temp.push(this.docType[i]['doc_id']);
            }
            this.toppingsLead.setValue(temp);
        }
        if (type == 'days') {
            let temp = [];
            for (let i = 0; i < this.expiryDays.length; i++) {
                temp.push(this.expiryDays[i]['doc_id']);
            }
            this.toppingsTimeZone.setValue(temp);
        }
        ev._selected = true;
    }
    if (ev._selected == false) {
        if (type == 'lead')
        this.toppingsLead.setValue([]);
        if (type == 'days')
        this.toppingsTimeZone.setValue([]);
    }
}
selectOne(ev, type) {
    if (type == 'lead') {
        ((this.docType.length <= this.toppingsLead.value.length) && !ev._selected) ? ev.select() : ev.deselect();
    }
    if (type == 'days') {
        ((this.expiryDays.length <= this.toppingsTimeZone.value.length) && !ev._selected) ? ev.select() : ev.deselect();
    }
}
clearFilters() {
    this.toppingsLead.setValue([]);
    this.toppingsTimeZone.setValue([]);
}
}