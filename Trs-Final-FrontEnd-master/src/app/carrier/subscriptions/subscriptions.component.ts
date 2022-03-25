import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { CarrierService } from '../carrier.service';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  cityForm = new FormControl();
  stateForm = new FormControl();
  statu = new FormControl();
  clientAssending : boolean = false;
  numberAssending : boolean = false;
  packageAssending : boolean = false;
  monthAssending : boolean = false;
  validFromAssending : boolean = false;
  validToAssending : boolean = false;
  transactionAssending : boolean = false;
  paymentAssending : boolean = false;
  subscriptionAssending : boolean = false;
  actionAssending : boolean = false;
  
  constructor(public alertService:AlertService,public carrierService:CarrierService,private _fb: FormBuilder) {
    this.filterForm = this._fb.group({
      'keyWord': [null]
    });
  }
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  filterForm: FormGroup;
  public subscriptions :any;
  filterToggle: boolean;
  subscriptionList = [];
  packageLevels:any;
  public status_filter = "";
  TransRef = new FormControl();
  paginationSubscriptionList = [];
  // pageSize = 10;
  public showEmpty : boolean = true;
  currentPage = 0;
  totalSize = 0;
  public usingObject = {};
  status = [{'status_id':'1','status_name':'Paid'},
  {'status_id':'2','status_name':'Declined'},
  {'status_id':'3','status_name':'Pending'}
]
city = [{'city_id':'1','city_name':'L1'},
{'city_id':'2','city_name':'L2'},
{'city_id':'3','city_name':'L3'},
{'city_id':'4','city_name':'L4'}
]
state = [{'state_id':'1','state_name':'0 - 1'},
{'state_id':'2','state_name':'2 - 5'},
{'state_id':'3','state_name':'6 - 10'},
{'state_id':'4','state_name':'11 - 15'}
]
toggleFilter() {
  this.filterToggle = !this.filterToggle;
}

filterSearch() {
  let filterObj = {};
  if(this.TransRef.value) {
    filterObj['invoice_number'] = this.TransRef.value.trim();
  }
  
  if(this.status_filter) {
    filterObj['package_id'] = this.status_filter;
  }
  
  this.usingObject = filterObj;
  this.getSubscriptions(filterObj);
  // this.getSubscriptions(filterObj);
}

public getPackages() {
  this.carrierService.getPricingData({}).then(data => {
    if(data.success) {
      this.packageLevels = data.results;
    }
    else {
      this.alertService.createAlert(data.message,0);
    }
  })
}

clearFilters() {
  this.status_filter = '';
  this.TransRef.setValue('');
  this.usingObject = {};
  this.getSubscriptions({});
}

ngOnInit() {
  this.getSubscriptions({});
  this.getPackages();
  this.subscriptionList = [
    { 'id': 0, 'CarrierName': 'YRC Worldwide', 'CarrierSize': '2-5', 'Package': 'L1', 'Amount': '$5698', 'ValidFrom': '22-08-2019', 'ValidTo': '22-07-2020', 'TransactionRef': 'TP4354353FSDF546', 'PaymentDate': '22-08-2019', 'Status': 'Paid' },
    { 'id': 1, 'CarrierName': 'U.S. Xpress', 'CarrierSize': '6-10', 'Package': 'L8', 'Amount': '$9698', 'ValidFrom': '12-02-2019', 'ValidTo': '12-01-2020', 'TransactionRef': 'TP34534SDFF6456', 'PaymentDate': '15-02-2019', 'Status': 'Paid' },
    { 'id': 2, 'CarrierName': 'Alex Matthews', 'CarrierSize': '16-25', 'Package': 'L5', 'Amount': '$1298', 'ValidFrom': '09-09-2019', 'ValidTo': '08-08-2020', 'TransactionRef': 'TP58654SDFF6456', 'PaymentDate': '18-09-2019', 'Status': 'Paid' },
    { 'id': 3, 'CarrierName': 'Brendon John', 'CarrierSize': '11-15', 'Package': 'L6', 'Amount': '$1698', 'ValidFrom': '22-03-2019', 'ValidTo': '22-02-2020', 'TransactionRef': 'TP25654SDFF6456', 'PaymentDate': '25-03-2019', 'Status': 'Declined' },
    { 'id': 4, 'CarrierName': 'HMCS Bonaventure', 'CarrierSize': '16-25', 'Package': 'L3', 'Amount': '$6698', 'ValidFrom': '22-08-2019', 'ValidTo': '22-08-2020', 'TransactionRef': 'TP25654SDFF6456', 'PaymentDate': '29-08-2019', 'Status': 'Pending' },
    { 'id': 5, 'CarrierName': 'USS Enterprise(CVN‑65)', 'CarrierSize': '26-50', 'Package': 'L2', 'Amount': '$5000', 'ValidFrom': '25-08-2019', 'ValidTo': '25-07-2020', 'TransactionRef': 'TP256999DFF6456', 'PaymentDate': '25-08-2019', 'Status': 'Paid' },
    { 'id': 6, 'CarrierName': 'USS Gerald R.Ford', 'CarrierSize': '301-350', 'Package': 'L1', 'Amount': '$5698', 'ValidFrom': '22-08-2019', 'ValidTo': '22-08-2020', 'TransactionRef': 'TP25774SDFF6456', 'PaymentDate': '22-08-2019', 'Status': 'Pending' },
    { 'id': 7, 'CarrierName': 'USS Enterprise', 'CarrierSize': '6-10', 'Package': 'L1', 'Amount': '$7798', 'ValidFrom': '22-01-2020', 'ValidTo': '22-02-2021', 'TransactionRef': 'AG25654SDFF6456', 'PaymentDate': '22-01-2020', 'Status': 'Declined' },
  ];
  if (this.subscriptionList != null && this.subscriptionList.length >= 0) {
    this.paginationSubscriptionList = this.subscriptionList.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
  }
  this.totalSize = this.subscriptionList != null ? this.subscriptionList.length : 0;
  
}

public getSubscriptions(filter) {
  filter['per_page'] = this.pageSize;
  filter['page'] = this.currentPage;
  this.carrierService.getAllSubscriptions(filter).then(data => {
    if(data.success) {
      if(data.results.length) {
        for(let i = 0 ; i < data.results.length; i++) {
          data.results[i]['NoOfAssets'] = parseInt(data.results[i].trs_tbl_package.number_of_fleets.split('-')[0]);
          data.results[i]['Package'] = parseInt(data.results[i].trs_tbl_package.package_level.split('L')[1]);
          data.results[i]['Amount'] = parseInt(data.results[i].trs_tbl_package.monthly_price.split('$')[1]);
        }
        this.subscriptions = data.results;
        this.totalSize = data.count;
        this.showEmpty = false;
      }
      else {
        this.subscriptions = [];
        this.totalSize = 0;
        this.showEmpty = true;
      }
      console.log(data.results);
    }
    else {
      this.alertService.createAlert(data.message,0)
    }
  })
}

ClientClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var titleA = a.carrier_name, titleB = b.carrier_name;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var titleA = b.carrier_name, titleB = a.carrier_name;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

NumberFleetsClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var titleA = a.NoOfAssets, titleB = b.NoOfAssets;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var titleA = b.NoOfAssets, titleB = a.NoOfAssets;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

ValidFromClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.start_date).valueOf(), dateB = new Date(b.start_date).valueOf();
      return dateA - dateB;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.start_date).valueOf(), dateB = new Date(b.start_date).valueOf();
      return dateB - dateA;
    });
  }
  
}

ValidToClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.end_date).valueOf(), dateB = new Date(b.end_date).valueOf();
      return dateA - dateB;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.end_date).valueOf(), dateB = new Date(b.end_date).valueOf();
      return dateB - dateA;
    });
  }
  
}

PaymentClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.start_date).valueOf(), dateB = new Date(b.start_date).valueOf();
      return dateA - dateB;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.start_date).valueOf(), dateB = new Date(b.start_date).valueOf();
      return dateB - dateA;
    });
  }
  
}

SubscriptionClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.subscription_end_date).valueOf(), dateB = new Date(b.subscription_end_date).valueOf();
      return dateA - dateB;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var dateA = new Date(a.subscription_end_date).valueOf(), dateB = new Date(b.subscription_end_date).valueOf();
      return dateB - dateA;
    });
  }
  
}

TransactionClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var titleA = a.invoice_number, titleB = b.invoice_number;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var titleA = b.invoice_number, titleB = a.invoice_number;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

PackageLevelClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var titleA = a.Package, titleB = b.Package;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var titleA = b.Package, titleB = a.Package;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

MonthlyClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      var titleA = a.Amount, titleB = b.Amount;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      var titleA = b.Amount, titleB = a.Amount;
      if (titleA < titleB) return -1;
      if (titleA > titleB) return 1;
      return 0;
    });
  }
  
}

ActiveClicked(order) {
  if(order) {
    this.subscriptions.sort(function(a, b) {
      return a.is_active - b.is_active;
    });
  }
  else {
    this.subscriptions.sort(function(a, b) {
      return b.is_active - a.is_active;
    });
  }
  
}

filterBy(formValues) {
  const events = this.subscriptionList;
  if (events != null) {
    const filteredEvents = events.filter(x =>
      (formValues.keyWord == null || JSON.stringify(x).toLowerCase().includes(formValues.keyWord.toLowerCase()))
      );
      
      this.subscriptionList = filteredEvents;
      // tslint:disable-next-line: max-line-length
      this.paginationSubscriptionList = this.subscriptionList.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
      this.totalSize = filteredEvents.length;
      // this.handlePage({ pageIndex: 0, pageSize: this.pageSize });
      this.currentPage = 0;
    }
    
  }
  
  resetFilter() {
    this.currentPage = 0;
    this.pageSize = 10;
    // this.getScopeList();
    this.filterForm.reset();
  }
  
  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    if(this.usingObject)
    this.getSubscriptions(this.usingObject);
    else 
    this.getSubscriptions({});
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
      if (type == 'city')
      this.cityForm.setValue([]);
      if (type == 'state')
      this.stateForm.setValue([]);
      if (type == 'status')
      this.statu.setValue([]);
      
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
    
  }
  
}
