import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { AddCarrierListingComponent } from './add-carrier-listing/add-carrier-listing.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { AlertService } from '../../shared/services/alert.service';
import { CarrierService } from '../carrier.service';
import { CarriersService } from '../../carriers/carriers.service';
import { DownloadExcelService } from '../../carriers/driver-information/download-excel.service';
import * as XLSX from 'xlsx';
import { AutoComplete } from 'primeng/primeng';
import { UpdatePackageDialogComponent } from './update-package-dialog/update-package-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { GridColumnsForClientsScreenComponent } from './grid-columns-for-clients-screen/grid-columns-for-clients-screen.component';
import { LoginService } from 'src/app/logins/login.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-carrier-listing',
  templateUrl: './carrier-listing.component.html',
  styleUrls: ['./carrier-listing.component.scss'],
  providers: [CookieService]
})
export class CarrierListingComponent implements OnInit {
  statu = new FormControl();
  public popoverTitle: string = 'Confirm Delete';
  public popoverMessage: string = 'Are you sure you want to delete this user?';
  public popoverStatusTitle: string = 'Confirm Status Change';
  public popoverStatusMessage: string = 'Are you sure you want to change status?';
  public cancelClicked: boolean = false;
  cityForm = new FormControl();
  stateForm = new FormControl();
  countryForm = new FormControl();
  gridColumns = [{ grid_columns: "0000000000" }];

  constructor(
    public carriersService: CarriersService, public downloadExcelService: DownloadExcelService,
    public carrierService: CarrierService, public alertService: AlertService, private _fb: FormBuilder,
    public dialog: MatDialog, private cookieService: CookieService, private router: Router) {
    this.filterForm = this._fb.group({
      'keyWord': [null]
    });
  }
  operations = [{ 'operation_id': '1', 'operation_name': 'A-Z' },
  { 'operation_id': '2', 'operation_name': 'Z-A' },
  ]
  status = [{ 'status_id': '1', 'status_name': 'Active' },
  { 'status_id': '2', 'status_name': 'Inactive' }
  ]
  city = [{ 'city_id': '1', 'city_name': 'New York' },
  { 'city_id': '2', 'city_name': 'Toronto' },
  { 'city_id': '3', 'city_name': 'San Antonio' },
  { 'city_id': '4', 'city_name': 'Vancouver' }
  ]
  state = [{ 'state_id': '1', 'state_name': 'Alabama' },
  { 'state_id': '2', 'state_name': 'Quebec' },
  { 'state_id': '3', 'state_name': 'Colorado' },
  { 'state_id': '4', 'state_name': 'Ontario' }
  ]
  country = [{ 'country_id': '1', 'country_name': 'USA' },
  { 'country_id': '2', 'country_name': 'Canada' }
  ]
  filterForm: FormGroup;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') : '5');
  filterToggle: boolean;
  carrierList = [];
  carriersforexcel: any;
  excelDataCarrier = [];
  public allClients: any;
  paginationCarrierList = [];
  // pageSize = 10;
  currentPage = 0;
  totalSize = 0;
  dateToday: any;
  usingObject: any;
  public showEmpty: boolean = true;
  countries = [{ id: 38, value: "Canada" }, { id: 231, value: "USA" }];
  statesForCanadaAndUSa: any;
  nameControl = new FormControl();
  cityControl = new FormControl();
  public country_filter = "";
  public state_filter = "";
  clientAssending: boolean = false;
  emailAssending: boolean = false;
  phoneAssending: boolean = false;
  addressAssending: boolean = false;
  cityAssending: boolean = false;
  stateAssending: boolean = false;
  countryAssending: boolean = false;
  packageAssending: boolean = false;
  activeAssending: boolean = false;
  companyAssending: boolean = false;
  termsAssending: boolean = false;

  toggleFilter() {
    this.filterToggle = !this.filterToggle;
  }

  filterSearch() {
    let filterObj = {};
    if (this.nameControl.value) {
      filterObj['client_name'] = this.nameControl.value.trim();
    }
    if (this.cityControl.value) {
      filterObj['city'] = this.cityControl.value.trim();
    }
    if (this.country_filter) {
      filterObj['country_id'] = this.country_filter;
    }
    if (this.state_filter) {
      filterObj['state_id'] = this.state_filter;
    }
    this.usingObject = filterObj;
    this.getClients(filterObj);
    // this.getClients(filterObj);
  }


  clearFilters() {
    this.country_filter = '';
    this.state_filter = '';
    this.nameControl.setValue('');
    this.cityControl.setValue('');
    this.usingObject = {};
    this.getClients({});
    // this.allDrivers({});
  }

  ngOnInit() {
    this.getGridColumns({});
    this.dateToday = new Date();
    this.getClients({});
    this.getClients({ 'from': 1 });
    this.getSelecteStateDropdown({});
    this.carrierList = [
      { status: 1, country: 'USA', state: 'Alabama', city: 'New York', 'id': 0, 'CarrierName': 'YRC worldwide', 'Type': 'Carrier', 'EmailID': 'YRC@gmail.com', 'Phone': '4589132557', 'AddressDetails': '495 King St. W., Hamilton, ON' },
      { status: 1, country: 'Canada', state: 'Quebec', city: 'Toronto', 'id': 1, 'CarrierName': 'con-way', 'Type': 'Carrier', 'EmailID': 'con-way@gmail.com', 'Phone': '1234567894', 'AddressDetails': '1 Ford Ave, St Catharines, ON' },
      { status: 0, country: 'USA', state: 'Colorado', city: 'San Antonio', 'id': 2, 'CarrierName': 'U.S. express', 'Type': 'Carrier', 'EmailID': 'express@gmail.com', 'Phone': '6587984561', 'AddressDetails': '95 Pine St.' },
      { status: 1, country: 'Canada', state: 'Ontario', city: 'Vancouver', 'id': 3, 'CarrierName': 'Crete ', 'Type': 'Carrier', 'EmailID': 'crete@gmail.com', 'Phone': '546541651', 'AddressDetails': '37 Concession 3, Niagara Falls' },
      { status: 0, country: 'Canada', state: 'Ontario', city: 'Montreal', 'id': 4, 'CarrierName': 'Stephen', 'Type': 'Carrier', 'EmailID': 'stephen@gmail.com', 'Phone': '564968465463', 'AddressDetails': '1 Ford Ave, St Catharines' },
      { status: 1, country: 'USA', state: 'Iowa', city: 'Charlotte', 'id': 5, 'CarrierName': 'Runway', 'Type': 'Carrier', 'EmailID': 'runway@gmail.com', 'Phone': '88469465465', 'AddressDetails': 'Road no 12, James bay, ON' },
      { status: 1, country: 'USA', state: 'Alabama', city: 'New York', 'id': 6, 'CarrierName': 'Oldtruck', 'Type': 'Carrier', 'EmailID': 'oldtruck@gmail.com', 'Phone': '8748464615', 'AddressDetails': '3 lane , Rob colony, ON' },
      { status: 1, country: 'USA', state: 'Iowa', city: 'Charlotte', 'id': 7, 'CarrierName': 'Jonh trucks', 'Type': 'Carrier', 'EmailID': 'jonh trucks@gmail.com', 'Phone': '9645645165516', 'AddressDetails': '1 Ford Avenue, St Cane street, ON' },
    ];
    if (this.carrierList != null && this.carrierList.length >= 0) {
      this.paginationCarrierList = this.carrierList.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
    }
    this.totalSize = this.carrierList != null ? this.carrierList.length : 0;

  }

  CompanyClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.company_name, titleB = b.company_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.company_name, titleB = a.company_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  ClientClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.carrier_name, titleB = b.carrier_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.carrier_name, titleB = a.carrier_name;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  EmailClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.carrier_email, titleB = b.carrier_email;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.carrier_email, titleB = a.carrier_email;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  PhoneClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.carrier_phone, titleB = b.carrier_phone;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.carrier_phone, titleB = a.carrier_phone;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  AddressClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.carrier_address, titleB = b.carrier_address;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.carrier_address, titleB = a.carrier_address;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  CityClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.city, titleB = b.city;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.city, titleB = a.city;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  StateClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.sortState, titleB = b.sortState;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.sortState, titleB = a.sortState;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  CountryClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.sortCountry, titleB = b.sortCountry;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.sortCountry, titleB = a.sortCountry;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  PackageClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var titleA = a.sortPackage, titleB = b.sortPackage;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var titleA = b.sortPackage, titleB = a.sortPackage;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }

  }

  TermsClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        var dateA = new Date(a.terms_and_conditions_acceptance_date).valueOf(), dateB = new Date(b.terms_and_conditions_acceptance_date).valueOf();
        return dateA - dateB;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        var dateA = new Date(a.terms_and_conditions_acceptance_date).valueOf(), dateB = new Date(b.terms_and_conditions_acceptance_date).valueOf();
        return dateB - dateA;
      });
    }

  }

  ActiveClicked(order) {
    if (order) {
      this.allClients.sort(function (a, b) {
        return a.is_active - b.is_active;
      });
    }
    else {
      this.allClients.sort(function (a, b) {
        return b.is_active - a.is_active;
      });
    }

  }

  getSelecteStateDropdown(filter) {
    this.carriersService.getSelectedStateDropDown(filter).then(data => {
      if (data.success) {
        this.statesForCanadaAndUSa = data.results;
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }

  dowloadBulkUploadAssetTemplate() {

    this.carriersforexcel.forEach(element => {
      console.log(element);
      if (!element.request_from && !element.conversion_token) {
        this.excelDataCarrier.push({
          'Client Name': element.carrier_name,
          'Email ID': element.carrier_email,
          'Phone': element.carrier_phone,
          'Address': element.carrier_address,
          'City': element.city,
          'State': element.trs_tbl_state.state_name,
          'Country': element.trs_tbl_country.country_name,
          'Status': element.is_active ? 'Active' : 'Inactive',
          'Payment Status': 'Paid',
        });
      }
      if (element.request_from) {
        this.excelDataCarrier.push({
          'Client Name': element.carrier_name,
          'Email ID': element.carrier_email,
          'Phone': element.carrier_phone,
          'Address': element.carrier_address,
          'City': element.city,
          'State': element.trs_tbl_state.state_name,
          'Country': element.trs_tbl_country.country_name,
          'Status': element.is_active ? 'Active' : 'Inactive',
          'Payment Status': 'Free-Tier',
        });
      }
      if (!element.request_from && element.conversion_token) {
        this.excelDataCarrier.push({
          'Client Name': element.carrier_name,
          'Email ID': element.carrier_email,
          'Phone': element.carrier_phone,
          'Address': element.carrier_address,
          'City': element.city,
          'State': element.trs_tbl_state.state_name,
          'Country': element.trs_tbl_country.country_name,
          'Status': element.is_active ? 'Active' : 'Inactive',
          'Payment Status': 'Processing',
        });
      }
    });
    this.downloadExcelService.exportAsExcelFile(this.excelDataCarrier, 'Clients');
    this.excelDataCarrier = [];
    //this._downloadExcelService.exportAsExcelFileForAssetTemplate(this.excelData, fileName,'Enter Details')
  }

  // sendEmail(carrierDetails) {
  //   this.carrierService.convertClientIntoSubscriber(carrierDetails).then(data => {
  //     if(data.success) {
  //       this.alertService.createAlert("Email has been sent to the client to make payment",1);
  //       if(this.usingObject)
  //       this.getClients(this.usingObject);
  //       else 
  //       this.getClients({});
  //       this.getClients({'from':1});
  //     }
  //     else {
  //       this.alertService.createAlert(data.message,0);
  //     }
  //   })
  // }

  sendEmail(carrierDetails) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: carrierDetails,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(item => {
      if (item != null && item !== undefined) {
        this.carrierService.convertClientIntoSubscriber(item).then(data => {
          if (data.success) {
            this.alertService.createAlert("Email has been sent to the client to make payment", 1);
            if (this.usingObject)
              this.getClients(this.usingObject);
            else
              this.getClients({});
            this.getClients({ 'from': 1 });
          }
          else {
            this.alertService.createAlert(data.message, 0);
          }
        })
      }

    })
  }

  public getGridColumns(filter) {
    this.carrierService.getGridColumnsForClientsScreen(filter).then(data => {
      if (data.success) {
        this.gridColumns = data.results;
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    })
  }

  openGridColumnsDialog(stat) {
    let dialogRef = this.dialog.open(GridColumnsForClientsScreenComponent, {
      data: stat,
      height: 'auto',
      width: '600px',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(item => {
      if (item == 'save') {
        this.getGridColumns({})
      }
    })
  }

  public getClients(filters) {
    if (filters.from) {
      filters['from'] = 1;
    }
    filters['per_page'] = this.pageSize;
    filters['page'] = this.currentPage;
    if (sessionStorage.getItem("RemovingItem")) {
      filters['package_id'] = sessionStorage.getItem("RemovingItem");
    }
    console.log(filters);
    this.carrierService.getAllClients(filters).then(data => {
      if (data.success) {
        if (data.count) {
          if (filters.from) {
            this.carriersforexcel = data.results;
          }
          else {
            for (let i = 0; i < data.results.length; i++) {
              data.results[i]['sortCountry'] = data.results[i].trs_tbl_country.country_name;
              data.results[i]['sortState'] = data.results[i].trs_tbl_state.state_name;
              data.results[i]['sortPackage'] = parseInt(data.results[i].trs_tbl_package.package_level.split('L')[1]);
            }
            this.allClients = data.results;
            this.totalSize = data.count;
            this.showEmpty = false;
          }
        }
        else {
          this.allClients = [];
          this.totalSize = 0;
          this.showEmpty = true;
        }
        sessionStorage.removeItem("RemovingItem");
      }
      else {
        this.alertService.createAlert(data.message, 0);
        sessionStorage.removeItem("RemovingItem");
      }
    })
  }

  updateCarrier(id, status, value) {
    let finalObj = {};
    finalObj['carrier_id'] = id;
    if (value == 'delete') {
      finalObj['is_deleted'] = status;
    }
    if (value == 'active') {
      finalObj['is_active'] = status;
    }
    this.carrierService.updateClientInAdmin(finalObj).then(data => {
      if (data.success) {
        if (value == 'active')
          this.alertService.createAlert("Client " + (status ? 'activated' : 'deactivated') + ' successfully', 1);
        if (value == 'delete')
          this.alertService.createAlert("Client deleted successfully", 1);
        if (this.usingObject)
          this.getClients(this.usingObject);
        else
          this.getClients({});
        this.getClients({ 'from': 1 });
      }
      else {
        this.alertService.createAlert(data.message, 0);
      }
    });
  }

  openPackageDialog(carrier) {
    let dialogRef = this.dialog.open(UpdatePackageDialogComponent, {
      data: carrier,
      height: 'auto',
      width: '600px',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data == 'save') {
        if (this.usingObject) {
          this.getClients(this.usingObject);
          this.getClients({ 'from': 1 });
        }
        else {
          this.getClients({});
          this.getClients({ 'from': 1 });
        }
      }
    })
  }

  public addCarrierListing(status) {
    const dialogRef = this.dialog.open(AddCarrierListingComponent, {
      data: status,
      height: 'auto',
      width: '600px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data == 'save') {
        if (this.usingObject)
          this.getClients(this.usingObject);
        else
          this.getClients({});
      }
    });
  }

  openDeleteDialog() {
    let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: null,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(prospects => {

    });
  }

  filterBy(formValues) {
    const events = this.carrierList;
    if (events != null) {
      const filteredEvents = events.filter(x =>
        (formValues.keyWord == null || JSON.stringify(x).toLowerCase().includes(formValues.keyWord.toLowerCase()))
      );

      this.carrierList = filteredEvents;
      // tslint:disable-next-line: max-line-length
      this.paginationCarrierList = this.carrierList.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
      this.totalSize = filteredEvents.length;
      this.handlePage({ pageIndex: 0, pageSize: this.pageSize });
      this.currentPage = 0;
    }

  }

  resetFilter() {
    this.currentPage = 0;
    this.pageSize = 10;
    // this.getScopeList();
    this.ngOnInit();
    this.filterForm.reset();
  }

  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    if (this.usingObject)
      this.getClients(this.usingObject);
    else
      this.getClients({});
    // tslint:disable-next-line: max-line-length
    // this.paginationCarrierList = this.carrierList.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
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
      if (type == 'city') {
        let temp = [];
        for (let i = 0; i < this.city.length; i++) {
          temp.push(this.city[i]['city_id']);
        }
        this.cityForm.setValue(temp);
      }
      if (type == 'country') {
        let temp = [];
        for (let i = 0; i < this.country.length; i++) {
          temp.push(this.country[i]['country_id']);
        }
        this.countryForm.setValue(temp);
      }
      if (type == 'state') {
        let temp = [];
        for (let i = 0; i < this.state.length; i++) {
          temp.push(this.state[i]['state_id']);
        }
        this.stateForm.setValue(temp);
      }
      ev._selected = true;
    }
    if (ev._selected == false) {
      if (type == 'status')
        this.statu.setValue([]);

      if (type == 'city')
        this.cityForm.setValue([]);
      if (type == 'state')
        this.stateForm.setValue([]);
      if (type == 'country')
        this.countryForm.setValue([]);
    }
  }
  selectOne(ev, type) {
    if (type == 'status') {
      ((this.status.length <= this.statu.value.length) && !ev._selected) ? ev.select() : ev.deselect();
    }
    if (type == 'city') {
      ((this.city.length <= this.cityForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
    }
    if (type == 'state') {
      ((this.state.length <= this.stateForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
    }
    if (type == 'country') {
      ((this.country.length <= this.countryForm.value.length) && !ev._selected) ? ev.select() : ev.deselect();
    }
  }

  shadowLogin(email) {
    // await localStorage.setItem('shadowlogin', email);
    // await this.cookieService.set('shadowlogin', email);
    // let storageEmail = await this.cookieService.get('shadowlogin')
    localStorage.setItem('shadowlogin', email);
    let storageEmail = localStorage.getItem('shadowlogin')
    if (storageEmail) {
      let url = window.location.origin + '/#/login?email=' + email;
      window.open(url, "_blank");

    }
  }


}
