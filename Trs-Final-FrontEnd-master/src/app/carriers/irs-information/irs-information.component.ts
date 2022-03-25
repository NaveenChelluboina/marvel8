import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { IrsDocsDialogComponent } from './irs-docs-dialog/irs-docs-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { OwlDateTimeComponent, DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, OwlDateTimeFormats } from 'ng-pick-datetime'
// import * as _moment from 'moment';
import { CarriersService } from '../carriers.service';
import { AlertService } from '../../shared/services/alert.service';
// import { Moment } from 'moment';
// import { MomentDateTimeAdapter, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';
// const moment = (_moment as any).default ? (_moment as any).default : _moment;

// export const MY_MOMENT_DATE_TIME_FORMATS: OwlDateTimeFormats = {
//   parseInput: 'MM/YYYY',
//   fullPickerInput: 'l LT',
//   datePickerInput: 'MM/YYYY',
//   timePickerInput: 'LT',
//   monthYearLabel: 'MMM YYYY',
//   dateA11yLabel: 'LL',
//   monthYearA11yLabel: 'MMMM YYYY',
// };

@Component({
  selector: 'app-irs-information',
  templateUrl: './irs-information.component.html',
  styleUrls: ['./irs-information.component.scss'],
  // providers: [
  //   // `MomentDateTimeAdapter` and `OWL_MOMENT_DATE_TIME_FORMATS` can be automatically provided by importing
  //   // `OwlMomentDateTimeModule` in your applications root module. We provide it at the component level
  //   // here, due to limitations of our example generation script.
  //   {provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE]},
  
  //   {provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_DATE_TIME_FORMATS},
  // ],
})
export class IrsInformationComponent implements OnInit {
  irss: any[] = [];
  
  iftas: any[];
  public currentPage = 0;
  public totalSize = 0;
  isyearadd = false;
  name:any;
  names:any;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  selectedListItem:any;
  showEmptyDocs : boolean = true;
  public settingButton : boolean = false;
  public item :any;
  public allDocuments : any;
  public mainYearId : any;
  filterToggle = false;
  statu = new FormControl();
  public years : any = [];
  docTitleAssending:boolean = false;
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this document?';
  public cancelClicked: boolean = false;
  public monthsObj = [{id:"01" , value:"Jan"} , {id:"02" , value:"Feb"} , {id:"03" , value:"Mar"} , {id:"04" , value:"Apr"} , {id:"05" , value:"May"} , {id:"06" , value:"Jun"} , {id:"07" , value:"Jul"} , {id:"08" , value:"Aug"} , {id:"09" , value:"Sep"} , {id:"10" , value:"Oct"} , {id:"11" , value:"Nov"} , {id:"12" , value:"Dec"}];
  constructor(public fb:FormBuilder,public dialog: MatDialog,public carrierService:CarriersService,public alertService:AlertService) { 
    this.createYearForm()
  }
  status = [{'status_id':'1','status_name':'Active'},{'status_id':'2','status_name':'Inactive'}]
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  
  ngOnInit() {
    this.getIRSYears({});
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[7];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    
    this.iftas = [
      { vehicle_no: 'HJ256982323', docs: '20', fleet_level: 'Fleet 1', doc_name1: 'Asset101.pdf', doc_name2: '115003', expiry_date1: '17-12-2019', expiry_date2: '03-08-2020', issue_date1: '12-12-2019', status: 1 },
      { vehicle_no: 'TR896582323', docs: '22', fleet_level: 'Fleet 2', doc_name1: 'Asset102.pdf', doc_name2: '489785', expiry_date1: '28-12-2019', expiry_date2: '14-12-2019', issue_date1: '26-12-2019', status: 0 },
      { vehicle_no: 'KL125482323', docs: 'Add', fleet_level: 'Fleet 5', doc_name1: 'Asset103.pdf', doc_name2: '336478', expiry_date1: '23-12-2019', expiry_date2: '03-08-2020', issue_date1: '23-12-2019', status: 1 },
      { vehicle_no: 'MN256982323', docs: '12', fleet_level: 'Fleet 3', doc_name1: 'Asset104.pdf', doc_name2: '115847', expiry_date1: '11-12-2019', expiry_date2: '14-12-2019', issue_date1: '11-12-2019', status: 1 },
      { vehicle_no: 'WE123482323', docs: 'Add', fleet_level: 'Fleet 3', doc_name1: 'Asset105.pdf', doc_name2: '984721', expiry_date1: '28-12-2019', expiry_date2: '23-12-2020', issue_date1: '28-12-2019', status: 0 },
      { vehicle_no: 'ED001582323', docs: '32', fleet_level: 'Fleet 3', doc_name1: 'Asset106.pdf', doc_name2: '589612', expiry_date1: '03-08-2020', expiry_date2: '02-11-2020', issue_date1: '03-08-2020', status: 0 }
    ];
    this.irss = [ 
      { year: '2019 - 2020', fleet_level: 'Level 1', asset: 'ED001582323', name: 'DC-003.doc', docs: 2 },
      { year: '2019 - 2020', fleet_level: 'Level 5', asset: 'HJ256982323', name: 'DC-247.doc', docs: 1 },
      { year: '2019 - 2020', fleet_level: 'Level 8', asset: 'KL125482323', name: 'DC-A45.doc', docs: 2 },
      { year: '2019 - 2020', fleet_level: 'Level 3', asset: 'MN256982323', name: 'DC-0D5.doc', docs: 2 },
      { year: '2019 - 2020', fleet_level: 'Level 1', asset: 'WE123482323', name: 'DC-8L6.doc', docs: 1 },
      { year: '2019 - 2020', fleet_level: 'Level 7', asset: 'TR896582323', name: 'IRS_2019.doc', docs: 1 },
    ];
    this.totalSize = this.irss.length;
  }
  
  doSomethingOnTabSelect(event) {
    console.log(event);
  }
  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    
  }
  
  updateDeleteDocument(id,status,value) {
    let finalObj = {};
    finalObj['document_id'] = id;
    if(value == 'delete') {
      finalObj['is_deleted'] = status;
    }
    if(value == 'active') {
      finalObj['is_active'] = status;
    }
    console.log(finalObj);
    this.carrierService.updateDocumentInIrs(finalObj).then(data => {
      if(data.success) {
        if(value == 'active')
        this.alertService.createAlert("Driver " + (status ? 'activated' : 'deactivated') + ' successfully',1);
        if(value == 'delete')
        this.alertService.createAlert("Document deleted successfully",1);
        this.getIRSYears({});
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    });
  }
  
  deleteYear() {
    let obj = {};
    obj['irs_id'] = this.mainYearId;
    obj['is_deleted'] = 1;
    let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: obj,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    
    dialogRef.afterClosed().subscribe(data => {
      if (data != null && data !== undefined) {
        let finalObj = {};
        finalObj['irs_id'] = this.mainYearId;
        finalObj['is_deleted'] = 1;
        if(this.showEmptyDocs) {
          this.carrierService.deleteIrsYearRecord(finalObj).then(data => {
            if(data.success) {
              this.alertService.createAlert("Year deleted successfully",1);
              this.getIRSYears({});
            }
            else {
              this.alertService.createAlert(data.message,0);
            }
          })
        }
        else {
          this.alertService.createAlert("Year cannot be deleted. Please De-associate all documents for this year and try again",0);
        } 
      }
    });
    
    
  }
  
  listNewClick(event, newValue) {
    console.log(newValue);
    this.selectedListItem = newValue;
    this.item = newValue.year;
    this.mainYearId = newValue.irs_id;
    this.addYearForm.controls['startDate'].setValue(newValue.start_date);
    this.addYearForm.controls['endDate'].setValue(newValue.end_date);
    sessionStorage.setItem('CurrentYear',newValue.year);
    if(newValue.trs_tbl_irs_year_documents.length) {
      this.showEmptyDocs = false;
      this.allDocuments = newValue.trs_tbl_irs_year_documents;
      this.totalSize = newValue.trs_tbl_irs_year_documents.length;
    }
    else {
      this.showEmptyDocs = true;
      this.allDocuments = [];
      this.totalSize = 0;
    } 
  }

  docTitleClicked(order) {
    if(order) {
      this.allDocuments.sort(function(a, b) {
        var titleA = a.document_name, titleB = b.document_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allDocuments.sort(function(a, b) {
        var titleA = b.document_name, titleB = a.document_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  public getIRSYears(filter) {
    filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getAllIRS(filter).then(data => {
      if(data.success) {
        if(data.results.length) {
          this.years = data.results;
          this.mainYearId = data.results[0].irs_id;
          this.selectedListItem = data.results[0];
          this.item = data.results[0]['year'];
          this.addYearForm.controls['startDate'].setValue(data.results[0].start_date);
          this.addYearForm.controls['endDate'].setValue(data.results[0].end_date);
          sessionStorage.setItem('CurrentYear',data.results[0].year);
          if(data.results[0].trs_tbl_irs_year_documents.length) {
            this.showEmptyDocs = false;
            this.allDocuments = data.results[0].trs_tbl_irs_year_documents;
            this.totalSize = data.results[0].trs_tbl_irs_year_documents.length;
          }
          else {
            this.showEmptyDocs = true;
            this.allDocuments = [];
            this.totalSize = 0;
          } 
          console.log(this.selectedListItem);
          console.log(this.item);
        }
        else {
          this.years = [];
          this.showEmptyDocs = true;
          this.allDocuments = [];
          this.totalSize = 0;
        }
        
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  addYearForm : FormGroup;
  
  get startDate() { return this.addYearForm.get('startDate'); }
  
  get endDate() { return this.addYearForm.get('endDate'); }
  
  createYearForm() {
    this.addYearForm = this.fb.group({
      startDate : new FormControl('',[Validators.required]),
      endDate : new FormControl('',[Validators.required])
    })
  }
  
  // public date = new FormControl(moment());
  
  // public dates = new FormControl(moment());
  
  // public minDate = new Date(this.date.value._d.getFullYear(), this.date.value._d.getMonth(), this.date.value._d.getDate());
  // public maxDate = new Date(this.currDate.getFullYear(), this.currDate.getMonth(), this.currDate.getDate()+1);
  
  // chosenYearHandler( normalizedYear: Moment ) {
  //   const ctrlValue = this.date.value;
  //   ctrlValue.year(normalizedYear.year());
  //   this.date.setValue(ctrlValue);
  // }
  
  // chosenMonthHandler( normalizedMonth: Moment, datepicker: OwlDateTimeComponent<Moment> ) {
  //   const ctrlValue = this.date.value;
  //   ctrlValue.month(normalizedMonth.month());
  //   this.date.setValue(ctrlValue);
  //   this.name = ctrlValue;
  //   datepicker.close();
  // }
  
  // chosenYearHandlers( normalizedYear: Moment ) {
  //   const ctrlValue = this.dates.value;
  //   ctrlValue.year(normalizedYear.year());
  //   this.dates.setValue(ctrlValue);
  // }
  
  // chosenMonthHandlers( normalizedMonth: Moment, datepicker: OwlDateTimeComponent<Moment> ) {
  //   const ctrlValue = this.dates.value;
  //   ctrlValue.month(normalizedMonth.month());
  //   this.dates.setValue(ctrlValue);
  //   this.names = ctrlValue;
  //   datepicker.close();
  // }
  
  saveYear() {
    let finalObj = {};
    let stringedStartDate = this.addYearForm.value.startDate.toString();
    let stringedEndDate = this.addYearForm.value.endDate.toString();
    let ad = new Date(this.addYearForm.value.startDate);
    let ed = new Date(this.addYearForm.value.endDate);
    finalObj['start_date'] = ad.setTime(ad.getTime() + (330 * 60 * 1000));
    finalObj['end_date'] = ed.setTime(ed.getTime() + (330 * 60 * 1000));
    // finalObj['start_date'] = this.addYearForm.value.startDate;
    // finalObj['end_date'] = this.addYearForm.value.endDate;
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    // console.log(stringedStartDate.split(" ")[1],stringedStartDate.split(" ")[3],stringedEndDate.split(" ")[1],stringedEndDate.split(" ")[3]);
    finalObj['year'] = stringedStartDate.split(" ")[1] + " " + stringedStartDate.split(" ")[3] + " - " + stringedEndDate.split(" ")[1] + " " + stringedEndDate.split(" ")[3]
    // console.log(finalObj);
    this.carrierService.addYearInIrs(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Year added successfully",1);
        this.settingButton = false;
        this.isyearadd = false;
        this.addYearForm.controls['startDate'].setValue('');
        this.addYearForm.controls['endDate'].setValue('');
        this.getIRSYears({});
      }
      else {
        this.alertService.createAlert(data.message,0);
        this.settingButton = false;
        this.isyearadd = false;
      }
    })
  }
  
  openIRSDialog(status) {
    let dialogRef = this.dialog.open(IrsDocsDialogComponent, {
      data: status,
      height: 'auto',
      width: '600px',
      // panelClass: 'my-dialog'
    });
    
    dialogRef.afterClosed().subscribe(prospects => {
      
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
        finalObj['document_id'] = data.document_id;
        finalObj['is_deleted'] = 1;
        this.carrierService.updateDocumentInIrs(finalObj).then(data => {
          if (data.success) {
            this.alertService.createAlert("Document deleted successfully", 1);
            this.getIRSYears({});
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        })  
      }
    });
  }
  
  addYear() {
    this.settingButton = false;
    this.addYearForm.controls['startDate'].setValue('');
    this.addYearForm.controls['endDate'].setValue('');
    this.isyearadd = true;
  }
  
  updateYear(variab) {
    this.isyearadd = true;
    if(variab == 'yes') {
      this.settingButton = true;
    }
  }
  
  closeAddForm() {
    this.isyearadd = false;
    this.addYearForm.controls['startDate'].setValue('');
    this.addYearForm.controls['endDate'].setValue('');
    this.settingButton = false;
  }
  
  selectAll(ev, type) {
    if (ev._selected) {
      if (type == 'status') {
        let temp = [];
        for (let i = 0; i < this.status.length; i++) {
          temp.push(this.status[i]['status_id']);
        }
        this.statu.setValue(temp);
      }
      ev._selected = true;
    }
    if (ev._selected == false) {
      if (type == 'status')
      this.statu.setValue([]);
    }
  }
  
  selectOne(ev, type) {
    
    if (type == 'status') {
      ((this.status.length <= this.statu.value.length) && !ev._selected) ? ev.select() : ev.deselect();
    }
  }
  
  clearFilters() {
    this.statu.setValue([]);
  }
  
  updateYearForIrs() {
    let finalObj = {};
    finalObj['irs_id'] = this.mainYearId;
    if(this.selectedListItem.start_date == this.addYearForm.value.startDate && this.selectedListItem.end_date == this.addYearForm.value.endDate) {
      this.isyearadd = false;
    }
    else if(this.selectedListItem.start_date == this.addYearForm.value.startDate || this.selectedListItem.end_date == this.addYearForm.value.endDate) {
      if(this.selectedListItem.start_date == this.addYearForm.value.startDate) {
        console.log("End date changed");
        let newdates ="";
        let stringedStartDate = this.addYearForm.value.startDate.toString();
        let stringedEndDate = this.addYearForm.value.endDate.toString();
        let ad = new Date(this.addYearForm.value.startDate);
        let ed = new Date(this.addYearForm.value.endDate);
             finalObj['start_date'] = ad.setTime(ad.getTime() + (330 * 60 * 1000));
             finalObj['end_date'] = ed.setTime(ed.getTime() + (330 * 60 * 1000));
        for(let i = 0 ; i < this.monthsObj.length ; i++) {
          if(stringedStartDate.split("-")[1] == this.monthsObj[i].id) {
            newdates = this.monthsObj[i].value;
          }
        }
        let totalStringStartDate = newdates + " " + stringedStartDate.split("-")[0]
        finalObj['year'] = totalStringStartDate + " - " + stringedEndDate.split(" ")[1] + " " + stringedEndDate.split(" ")[3]
      }
      else {
        console.log("Start date changed");
        let newdates ="";
        let stringedStartDate = this.addYearForm.value.startDate.toString();
        let stringedEndDate = this.addYearForm.value.endDate.toString();
        let ad = new Date(this.addYearForm.value.startDate);
        let ed = new Date(this.addYearForm.value.endDate);
          finalObj['start_date'] = ad.setTime(ad.getTime() + (330 * 60 * 1000));
          finalObj['end_date'] = ed.setTime(ed.getTime() + (330 * 60 * 1000));
        for(let i = 0 ; i < this.monthsObj.length ; i++) {
          if(stringedEndDate.split("-")[1] == this.monthsObj[i].id) {
            newdates = this.monthsObj[i].value;
          }
        }
        let totalStringEndDate = newdates  + " " + stringedEndDate.split("-")[0]
        finalObj['year'] = stringedStartDate.split(" ")[1] + " " + stringedStartDate.split(" ")[3] + " - " + totalStringEndDate 
      }
    }
    else {
      console.log("Both changed");
      let stringedStartDate = this.addYearForm.value.startDate.toString();
      let stringedEndDate = this.addYearForm.value.endDate.toString();
      let ad = new Date(this.addYearForm.value.startDate);
      let ed = new Date(this.addYearForm.value.endDate);
       finalObj['start_date'] = ad.setTime(ad.getTime() + (330 * 60 * 1000));
       finalObj['end_date'] = ed.setTime(ed.getTime() + (330 * 60 * 1000));
      // console.log(stringedStartDate.split(" ")[1],stringedStartDate.split(" ")[3],stringedEndDate.split(" ")[1],stringedEndDate.split(" ")[3]);
       finalObj['year'] = stringedStartDate.split(" ")[1] + " " + stringedStartDate.split(" ")[3] + " - " + stringedEndDate.split(" ")[1] + " " + stringedEndDate.split(" ")[3]
    }
    console.log(finalObj);
    this.carrierService.updateCalendarInIrs(finalObj).then(data => {
      if(data.success) {
        this.alertService.createAlert("Year updated successfully",1);
        this.settingButton = false;
        this.getIRSYears({});
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
}
