import { Component, OnInit } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { DriverDialogComponent } from './driver-dialog/driver-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { CarriersService } from '../carriers.service';
import { AlertService } from '../../shared/services/alert.service';
import { GridColumnsForDriverComponent } from './grid-columns-for-driver/grid-columns-for-driver.component';
import { DriverCommentDialogComponent } from './driver-comment-dialog/driver-comment-dialog.component';
import { AddNewDriverdocumentComponent } from './add-new-driverdocument/add-new-driverdocument.component';
import { DownloadExcelService } from './download-excel.service';
import * as XLSX from 'xlsx';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { DriverExcelServiceService } from './driver-excel-service.service';
import { ConfirmSendLinkDialogComponent } from './confirm-send-link-dialog/confirm-send-link-dialog.component';

@Component({
  selector: 'app-driver-information',
  templateUrl: './driver-information.component.html',
  styleUrls: ['./driver-information.component.scss']
})
export class DriverInformationComponent implements OnInit {
  drivers: any[] = [];
  public totalDrivers: any;
  tableList: any;
  pageEvent: PageEvent;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') : '5');
  public excelData = [];
  public excelDataDriver = [];
  public emailArray = [];
  public dlArray = [];
  public driversforexcel = [];
  public currentPage = 0;
  public totalSize = 0;
  public page: any;
  tableLists: any;
  public canUpload: boolean = true;
  submittedExcelfile: any[];
  finalSubmittedExcelfile = [];
  file: File;
  public bulkUploadArray = [];
  statesForCanadaAndUSa: any;
  errorRecord = [];
  errorRecordTemp = [];
  allowedFileExtensions: Array<string> = ['xl', 'xls', 'xlsx', 'csv'];
  isData: boolean = false;
  public permission_filter = "";
  public status_filter = "";
  public country_filter = "";
  public state_filter = "";
  showEmpty: boolean = false;
  filterToggle = false;
  compareObject = 0;
  gridColumns: any;
  public usingObject: any;
  firstControl = new FormControl();
  lastControl = new FormControl();
  dlControl = new FormControl();
  dlclassControl = new FormControl();
  citycontrol = new FormControl();
  statu = new FormControl();
  dlClass = new FormControl();
  cityForm = new FormControl();
  stateForm = new FormControl();
  countryForm = new FormControl();
  constructor( public downloadExcelService: DownloadExcelService, public route: ActivatedRoute, public dialog: MatDialog, public carrierService: CarriersService, public alertService: AlertService) { }
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this driver?';
  public popoverStatusTitle: string = 'Confirm Status Change';
  public popoverStatusMessage: string = 'Are you sure you want to change this driver status?';
  public cancelClicked: boolean = false;
  status = [{ id: 1, value: "Active" }, { id: 2, value: "Inactive" }];
  countries = [{ id: 38, value: "Canada" }, { id: 231, value: "USA" }];
  public canCreate: any;
  public canDelete: any;
  public canUpdate: any;
  lastnameAssending: boolean = false;
  firstnameAssending: boolean = false;
  contactAssending: boolean = false;
  emailAssending: boolean = false;
  lisenceAssending: boolean = false;
  classAssending: boolean = false;
  addressAssending: boolean = false;
  zipAssending: boolean = false;
  cityAssending: boolean = false;
  countryAssending: boolean = false;
  stateAssending: boolean = false;
  statusAssending: boolean = false;
  // city = [{'city_id':'1','city_name':'New York'},
  // {'city_id':'2','city_name':'Toronto'},
  // {'city_id':'3','city_name':'San Antonio'},
  // {'city_id':'4','city_name':'Vancouver'}
  // ]
  // state = [{'state_id':'1','state_name':'Alabama'},
  // {'state_id':'2','state_name':'Quebec'},
  // {'state_id':'3','state_name':'Colorado'},
  // {'state_id':'4','state_name':'Ontario'}
  // ]
  // country = [{'country_id':'1','country_name':'USA'},
  // {'country_id':'2','country_name':'Canada'}
  // ]
  // class = [{'class_id':'1','class_name':'Class C'},{'class_id':'2','class_name':'Class D'},{'class_id':'3','class_name':'Class A'},
  // {'class_id':'4','class_name':'Class B'}]

  // operations =[{'operation_id' : '1','operation_name':'A-Z'},
  // {'operation_id' : '2','operation_name':'Z-A'},
  // ]

  ngOnInit() {
    this.excelDataDriver = [];
    this.getGridColumns({});
    this.getDrivers({});
    this.allDrivers({});
    // this.getStatesForCanadaAndUsa({});
    this.getSelecteStateDropdown({});
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[2];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
    // this.drivers = [
    //   { docs:'5',country:'USA',state:'Alabama',city: 'New York', address1: '8461 Edgefield Ave. Menasha, WI 54952', last:'PEREZ',name: 'JACKSON',phone: '(541) 754-3010', email: 'jackson@gmail.com', dlnumber: 'AK120111062821', type: 'Class C', status: 1 },
    //   { docs:'6',country:'Canada',state:'Quebec',city: 'Toronto', address1: '9277 Henry Smith Ave.Stouffville, ON L4A 5Y2',last:'THOMAS', name: 'PEREZ', phone: '(856) 774-3010', email: 'perez@gmail.com', dlnumber: 'SL1120110062821', type: 'Class D', status: 1 },
    //   { docs:'4',country:'USA',state:'Colorado',city: 'San Antonio', address1: '208 Carpenter Rd.Springfield Gardens, NY 11413',last:'PEREZ', name: 'WHITE', phone: '(847) 523-3010', email: 'white@gmail.com', dlnumber: 'AK1320110462821', type: 'Class A', status: 1 },
    //   { docs:'6',country:'Canada',state:'Ontario',city: 'Vancouver', address1: '8575 Laurel LaneBelleville, ON K8R 1R0', last:'CARTER',name: 'THOMAS', phone: '(241) 754-8547', email: 'thomas@gmail.com', dlnumber: 'GLH1420130062821', type: 'Class E', status: 1 },
    //   { docs:'6',country:'Canada',state:'Ontario',city: 'Montreal', address1: '8027 Meadowbrook RoadWinfield, BC V4V 8R7', last:'JACKSON',name: 'CARTER', phone: '(985) 457-1245', email: 'carter@gmail.com', dlnumber: 'UK1420114062821', type: 'Class E', status: 0 },
    //   { docs:'5',country:'USA',state:'Iowa',city: 'Charlotte', address1: '9018 High StreetAmsterdam, NY 12010', name: 'GOMEZ', last:'CARTER',phone: '(658) 698-7852', email: 'gomex@gmail.com', dlnumber: 'LO1120110022821', type: 'CDL', status: 1 }
    // ];
    // this.totalSize = this.drivers.length;
  }

  getSelecteStateDropdown(filter) {
    this.carrierService.getSelectedStateDropDown(filter).then(data => {
      if (data.success) {
        this.statesForCanadaAndUSa = data.results;
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }

  public getGridColumns(filter) {
    if (this.compareObject == 0) {
      let data = this.route.snapshot.data['carriesresolver']['gridColumnsInDriversFromResolver'];
      this.gridColumns = data.results;
      this.compareObject++;
    }
    else {
      filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      this.carrierService.getGridColumnsForDrivers(filter).then(data => {
        if (data.success) {
          this.gridColumns = data.results;
        }
        else {
          this.alertService.createAlert(data.message, 0);
        }
      })
    }

  }

  public getDrivers(filter) {
    filter['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getDrivers(filter).then(data => {
      if (data.success) {
        for (let i = 0; i < data.results.length; i++) {
          data.results[i]['sortCountry'] = data.results[i].trs_tbl_country.country_name;
          data.results[i]['sortState'] = data.results[i].trs_tbl_state.state_name;
        }
        // console.log(data.results.length);
        // console.log(data.results.length,"dafff",data.count)
        this.totalDrivers = data.results;
        // this.drivers = data.results;
        this.drivers = this.totalDrivers.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
        this.totalSize = data.results.length;
        // console.log(this.totalSize);
        if (data.results) {
          if (!data.results.length) {
            this.showEmpty = true;
            this.totalSize = 0;
          }
          else {
            this.totalSize = data.results.length;
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

  LastNameClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.driver_last_name, titleB = b.driver_last_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.driver_last_name, titleB = a.driver_last_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  FirstNameClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.driver_first_name, titleB = b.driver_first_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.driver_first_name, titleB = a.driver_first_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  ContactClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.cell_phone, titleB = b.cell_phone;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.cell_phone, titleB = a.cell_phone;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  EmailClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.email_address, titleB = b.email_address;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.email_address, titleB = a.email_address;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  LisenceClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.dl_number, titleB = b.dl_number;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.dl_number, titleB = a.dl_number;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  ClassClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.dl_class, titleB = b.dl_class;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.dl_class, titleB = a.dl_class;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  ZipClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.zip, titleB = b.zip;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.zip, titleB = a.zip;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  CityClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.city, titleB = b.city;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.city, titleB = a.city;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  AddressClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.address1, titleB = b.address1;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.address1, titleB = a.address1;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  CountryClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.sortCountry, titleB = b.sortCountry;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.sortCountry, titleB = a.sortCountry;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  StateClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        var titleA = a.sortState, titleB = b.sortState;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        var titleA = b.sortState, titleB = a.sortState;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  ActiveClicked(order) {
    if (order) {
      this.drivers.sort(function (a, b) {
        return a.is_active - b.is_active;
      });
    }
    else {
      this.drivers.sort(function (a, b) {
        return b.is_active - a.is_active;
      });
    }

  }



  getAllDriversSorted(data) {
    let obj = {};
    if (data == "a-z") {
      obj['a-z'] = 1;
    }
    if (data == 'z-a') {
      obj['z-a'] = 1;
    }
    this.getDrivers(obj);
    this.allDrivers(obj);
  }

  openDriverDialog(status) {
    let dialogRef = this.dialog.open(DriverDialogComponent, {
      data: status,
      height: 'auto',
      width: '900px',
      autoFocus: false,
      panelClass: 'my-dialog'
    });

    dialogRef.afterClosed().subscribe(prospects => {
      if (prospects == 'save') {
        if (this.usingObject) {
          this.getDrivers(this.usingObject);
          this.allDrivers(this.usingObject);
        }

        else {
          this.getDrivers({});
          this.allDrivers({});
        }
      }
    });
  }

  openGridColumnsDialog(stat) {
    let dialogRef = this.dialog.open(GridColumnsForDriverComponent, {
      data: stat,
      height: 'auto',
      width: '600px',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(prospects => {
      if (prospects == 'save') {
        if (this.usingObject) {
          this.getDrivers(this.usingObject);
          this.allDrivers(this.usingObject);
          this.getGridColumns({});
        }

        else {
          this.getDrivers({});
          this.allDrivers({});
          this.getGridColumns({});
        }
      }
    });
  }

  openDocumentsDialog(driver) {
    let dialogRef = this.dialog.open(AddNewDriverdocumentComponent, {
      data: driver,
      height: 'auto',
      width: '800px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(prospects => {
      if (prospects == 'save') {
        if (this.usingObject) {
          this.getDrivers(this.usingObject);
          this.allDrivers(this.usingObject);
        }
        else {
          this.getDrivers({});
          this.allDrivers({});
        }
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
        finalObj['driver_id'] = data.driver_id;
        finalObj['is_deleted'] = 1;
        this.carrierService.updateDriverComments(finalObj).then(data => {
          if (data.success) {
            this.alertService.createAlert("Driver deleted successfully", 1);
            this.getDrivers({});
            this.allDrivers({});
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        })
      }
    });
  }

  public allDrivers(finalObj) {
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carrierService.getAllDrivers(finalObj).then(data => {
      if (data.success) {
        this.driversforexcel = data.results;
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    });
  }

  openNote(driver) {
    let dialogRef = this.dialog.open(DriverCommentDialogComponent, {
      data: driver,
      height: 'auto',
      width: '400px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(prospects => {
      if (prospects == 'save') {
        this.getDrivers({});
        this.allDrivers({});
      }
    });
  }

  filterSearch() {
    let filterObj = {};
    if (this.firstControl.value) {
      filterObj['driver_first_name'] = this.firstControl.value.trim();
    }
    if (this.dlclassControl.value) {
      filterObj['dl_class'] = this.dlclassControl.value.trim();
    }
    if (this.citycontrol.value) {
      filterObj['city'] = this.citycontrol.value.trim();
    }
    if (this.lastControl.value) {
      filterObj['driver_last_name'] = this.lastControl.value.trim();
    }
    if (this.dlControl.value) {
      filterObj['dl_number'] = this.dlControl.value.trim();
    }
    if (this.status_filter) {
      if (this.status_filter == "2") {
        filterObj['is_active'] = 0;
      }
      else {
        filterObj['is_active'] = 1;
      }
    }
    if (this.country_filter) {
      filterObj['country_id'] = this.country_filter;
    }
    if (this.state_filter) {
      filterObj['state_id'] = this.state_filter;
    }
    this.usingObject = filterObj;
    this.getDrivers(filterObj);
    this.allDrivers(filterObj);
  }

  // selectAll(ev, type) {
  //   if (ev._selected) {
  //     if (type == 'status') {
  //       let temp = [];
  //       for (let i = 0; i < this.status.length; i++) {
  //         temp.push(this.status[i]['status_id']);
  //       }
  //       this.statu.setValue(temp);
  //     }
  //     if (type == 'class') {
  //       let temp = [];
  //       for (let i = 0; i < this.class.length; i++) {
  //         temp.push(this.class[i]['class_id']);
  //       }
  //       this.dlClass.setValue(temp);
  //     }
  //     if (type == 'city') {
  //       let temp = [];
  //       for (let i = 0; i < this.city.length; i++) {
  //         temp.push(this.city[i]['city_id']);
  //       }
  //       this.cityForm.setValue(temp);
  //     }
  //     if (type == 'country') {
  //       let temp = [];
  //       for (let i = 0; i < this.country.length; i++) {
  //         temp.push(this.country[i]['country_id']);
  //       }
  //       this.countryForm.setValue(temp);
  //     }
  //     if (type == 'state') {
  //       let temp = [];
  //       for (let i = 0; i < this.state.length; i++) {
  //         temp.push(this.state[i]['state_id']);
  //       }
  //       this.stateForm.setValue(temp);
  //     }
  //     ev._selected = true;
  //   }
  //   if (ev._selected == false) {
  //     if (type == 'status')
  //     this.statu.setValue([]);
  //     if (type == 'class')
  //     this.dlClass.setValue([]);
  //     if (type == 'city')
  //     this.cityForm.setValue([]);
  //     if (type == 'state')
  //     this.stateForm.setValue([]);
  //     if (type == 'country')
  //     this.countryForm.setValue([]);
  //   }
  // }

  // selectOne(ev, type) {
  //   if (type == 'status') {
  //     ((this.status.length <= this.statu.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  //   }
  //   if (type == 'class') {
  //     ((this.class.length <= this.dlClass.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  //   }
  //   if (type == 'city') {
  //     ((this.city.length <= this.cityForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  //   }
  //   if (type == 'state') {
  //     ((this.state.length <= this.stateForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  //   }
  //   if (type == 'country') {
  //     ((this.country.length <= this.countryForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
  //   }
  // }

  clearFilters() {
    this.status_filter = '';
    this.country_filter = '';
    this.state_filter = '';
    this.firstControl.setValue('');
    this.lastControl.setValue('');
    this.dlControl.setValue('');
    this.dlclassControl.setValue('');
    this.citycontrol.setValue('');
    this.usingObject = {};
    this.getDrivers({});
    this.allDrivers({});
  }

  dowloadBulkUploadAssetTemplate(item) {
    if (item == 'data') {
      this.driversforexcel.forEach(element => {
        this.excelDataDriver.push({
          'Driver Last Name': element.driver_last_name,
          'Driver First Name': element.driver_first_name,
          'Cell Phone': element.cell_phone,
          'Email ID': element.email_address,
          'Driving Licence Number': element.dl_number,
          'Driving Licence Class': element.dl_class,
          'Address': element.address1,
          'Zip': element.zip,
          'Start Date': element.start_date,
          'Country': element.trs_tbl_country.country_name,
          'State': element.trs_tbl_state.state_name,
          'City': element.city,
          // 'Start Date': element.start_date.slice(0,10),
          // 'Inactive Date': element.inactive_date.slice(0,10),
          'Comments': element.comments
        });
      });
      this.downloadExcelService.exportAsExcelFile(this.excelDataDriver, 'Drivers');
      this.excelDataDriver = [];
      //this._downloadExcelService.exportAsExcelFileForAssetTemplate(this.excelData, fileName,'Enter Details')
    }
    else {
      this.excelData.push({ 'Driver Last Name': "" });
      this.excelData.push({ 'Driver First Name': "" });
      this.excelData.push({ 'Cell Phone': "" });
      this.excelData.push({ 'Email ID': "" });
      this.excelData.push({ 'Driving Licence Number': "" });
      this.excelData.push({ 'Driving Licence Class': "" });
      this.excelData.push({ 'Address': "" });
      this.excelData.push({ 'Zip': "" });
      this.excelData.push({ 'Start Date(YYYY,MM,DD)': "" });
      this.excelData.push({ 'Country': "" });
      this.excelData.push({ 'State': "" });
      this.excelData.push({ 'City': "" });
      // this.excelData.push({ 'Start Date': "" })
      // this.excelData.push({ 'Inactive Date': "" })
      this.excelData.push({ 'Comments': "" });
      let currentDate = (new Date).toISOString().slice(0, 10);
      let fileName = 'Driver_Sample_File_' + currentDate;
      this.downloadExcelService.exportAsExcelFile(this.excelData, fileName)
      //this._downloadExcelService.exportAsExcelFileForAssetTemplate(this.excelData, fileName,'Enter Details')
    }

  }

  handleFileSelect(event) {
    var target: HTMLInputElement = event.target as HTMLInputElement;
    for (var i = 0; i < target.files.length; i++) {
      this.file = target.files[i];
    }
    let fileExtension: string = this.file.name.substr(this.file.name.lastIndexOf('.') + 1)
    if (this.allowedFileExtensions.some(x => x.toLowerCase() === fileExtension.toLowerCase())) {
      this.Upload()
    }
    else {
      this.alertService.createAlert("Invalid file format", 0);
    }
    event.target.value = '';
  }

  arrayBuffer: any;

  Upload() {
    this.errorRecord = [];
    this.canUpload = true;
    this.submittedExcelfile = [];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      this.submittedExcelfile = XLSX.utils.sheet_to_json(worksheet, { raw: true });

      let munObj = {};
      let dlObj = {};
      for (let i = 0; i < this.driversforexcel.length; i++) {
        if (this.driversforexcel[i]) {

          munObj[this.driversforexcel[i]['email_address']] = 1;
          dlObj[this.driversforexcel[i]['dl_number']] = 1;

        }
      }

      let fileMunObj = {};
      let filedlObj = {};
      for (let i = 0; i < this.submittedExcelfile.length; i++) {
        if (this.submittedExcelfile[i]) {

          fileMunObj[this.submittedExcelfile[i]['Email ID']] = 1;
          filedlObj[this.submittedExcelfile[i]['Driving Licence Number']] = 1;


        }
      }

      for (let key in fileMunObj) {

        if (key in munObj) {
          this.errorRecord.push({ 'EmailID': key, errorStatus: false, message: 'Already Exists' });
        } else if (key == 'undefined') {
          this.alertService.createAlert('Invalid Data, Please Check', 0);
        }
        else if (key == "") {
          this.errorRecord.push({ 'EmailID': key, errorStatus: false, message: 'Empty' });
        }
        else {
          this.errorRecord.push({ 'EmailID': key, errorStatus: true, message: 'Correct' });
        }
      }
      for (let key in filedlObj) {

        if (key in dlObj) {
          this.errorRecord.push({ 'DrivingLicenceNumber': key, errorStatus: false, message: 'Already Exists' });
        } else if (key == 'undefined') {
          this.alertService.createAlert('Invalid Data, Please Check', 0);
        }
        else if (key == "") {
          this.errorRecord.push({ 'DrivingLicenceNumber': key, errorStatus: false, message: 'Empty' });
        }
        else {
          this.errorRecord.push({ 'DrivingLicenceNumber': key, errorStatus: true, message: 'Correct' });
        }
      }
      if (this.errorRecord.length > 0) {
        this.finalSubmittedExcelfile = [];
        for (let i = 0; i < this.errorRecord.length; i++) {
          if (this.errorRecord[i].errorStatus == false) {
            this.canUpload = false;
          }
        }
        if (this.canUpload) {
          for (let i = 0; i < this.submittedExcelfile.length; i++) {
            let innerObject = {};
            let aa = this.submittedExcelfile[i]['Active Date(YYYY,MM,DD)'].toString();
            // console.log(aa);
            let year = aa[0]+aa[1]+aa[2]+aa[3];
            let month = aa[5]+aa[6];
            let day = aa[8]+aa[9];
            // console.log(year);
            let add1 = new Date(year,month-1,day);
            console.log(add1,"vijadkumar")
            let add = add1.setTime(add1.getTime() + (330 * 60 * 1000));
            this.submittedExcelfile[i]['Start Date'] = add
            let newCase = this.submittedExcelfile[i]['Country (Canada, USA)'].toLowerCase();
            if (newCase.startsWith("ca"))
              this.submittedExcelfile[i]['Country'] = 38;
            else
              this.submittedExcelfile[i]['Country'] = 231;
            let newState = this.submittedExcelfile[i]['State (No abbreviations)'].toLowerCase().trim();
            for (let j = 0; j < this.statesForCanadaAndUSa.length; j++) {
              if (newState == this.statesForCanadaAndUSa[j].state_name.toLowerCase()) {
                this.submittedExcelfile[i]['State'] = this.statesForCanadaAndUSa[j].state_id;
              }
            }
            innerObject = { "driver_first_name": this.submittedExcelfile[i]['Driver First Name'], "driver_last_name": this.submittedExcelfile[i]['Driver Last Name'], "cell_phone": this.submittedExcelfile[i]['Cell Phone'], "email_address": this.submittedExcelfile[i]['Email ID'], "dl_number": this.submittedExcelfile[i]['Driving Licence Number'], "dl_class": this.submittedExcelfile[i]['Driving Licence Class'], "address1": this.submittedExcelfile[i]['Address'], "city": this.submittedExcelfile[i]['City'], "country_id": this.submittedExcelfile[i]['Country'], "state_id": this.submittedExcelfile[i]['State'], "start_date": this.submittedExcelfile[i]['Start Date'], "comments": this.submittedExcelfile[i]['Comments'], "created_by": 1, "modified_by": 1, "carrier_id": JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id, "zip": this.submittedExcelfile[i]['Zip'] };
            this.bulkUploadArray.push(innerObject);
          }
          this.carrierService.addBulkDrivers(this.bulkUploadArray).then(data => {
            if (data.success) {
              this.alertService.createAlert("Drivers uploaded successfully", 1);
              this.getDrivers({});
            }
            else {
              this.alertService.createAlert(data.message, 0);
            }
            this.bulkUploadArray = [];
          })
        }
        else {
          this.alertService.createAlert("Driver with details already exists", 0);
        }
        // this.errorRecordTemp = this.errorRecord.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
        // this.totalSize = this.errorRecord.length;
        this.isData = true;
      }
      else {
        this.isData = false;
        this.alertService.createAlert("No Data, Please Check", 0);
      }
    }
    fileReader.readAsArrayBuffer(this.file);
  }

  dowloadBulkUploadAssetTemplateHeaders() {
    
  }

  openPasswordSetLink(driver) {
    let dialogRef = this.dialog.open(ConfirmSendLinkDialogComponent, {
      data: driver,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(item => {
      if (item != null && item !== undefined) {
        this.carrierService.sendDriverPasswordLink(item).then(data => {
          if (data.success) {
            this.alertService.createAlert("You have successfully invited this driver to download the PermiShare app", 1);
            if (this.usingObject) {
              this.getDrivers(this.usingObject);
              this.allDrivers(this.usingObject);
            }

            else {
              this.getDrivers({});
              this.allDrivers({});
            }
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        })
      }

    })
  }

  getStatesForCanadaAndUsa(filter) {
    this.carrierService.getStatedForCanadaAndUsa(filter).then(data => {
      if (data.success) {
        this.statesForCanadaAndUSa = data.results;
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }

  updateDriver(id, status, value) {
    let finalObj = {};
    finalObj['driver_id'] = id;
    if (value == 'delete') {
      finalObj['is_deleted'] = status;
    }
    if (value == 'active') {
      finalObj['is_active'] = status;
    }
    this.carrierService.updateDriverComments(finalObj).then(data => {
      if (data.success) {
        if (value == 'active')
          this.alertService.createAlert("Driver " + (status ? 'activated' : 'deactivated') + ' successfully', 1);
        if (value == 'delete')
          this.alertService.createAlert("Driver deleted successfully", 1);
        let filterObj = {};
        if (this.status_filter) {
          if (this.status_filter == "2") {
            filterObj['is_active'] = 0;
          }
          else
            filterObj['is_active'] = this.status_filter;
        }
        // if(this.userControl.value) {
        //   filterObj['asset_make_name'] = this.userControl.value;
        // } 
        this.getDrivers(filterObj);
        this.allDrivers(filterObj);
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    });
  }

  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.drivers = this.totalDrivers.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
    // if(this.usingObject) {
    //   this.getDrivers(this.usingObject);
    //   this.allDrivers(this.usingObject);
    // }
    // else {
    //   this.getDrivers({});
    //   this.allDrivers({});
    // } 
  }

}