import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { AddPackageComponent } from './add-package/add-package.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { FormControl } from '@angular/forms';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarrierService } from '../carrier.service';
@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})

export class PackageComponent implements OnInit {
  
  public totalPricing: any;
  public pageSize = parseInt(sessionStorage.getItem('settings') ? sessionStorage.getItem('settings') :'5');
  public currentPage = 0;
  public totalSize = 0;
  public pricingList = [];
  showEmpty: boolean = true;
  filterToggle: boolean;
  public package_filter = "";
  public fleet_filter = "";
  monthlyForm = new FormControl();
  subAssending : boolean = false;
  packageAssending : boolean = false;
  fleetnumberAssending : boolean = false;
  monthlyAssending : boolean = false;
  annualAssending : boolean = false;
  
  constructor(public carrierService:CarrierService, public alertService: AlertService) {}
  
  ngOnInit() {
    this.getPricingData({});
  } 
  
  packages = [{'package':'L1'},{'package':'L2'},{'package':'L3'},{'package':'L4'},{'package':'L5'},{'package':'L6'},{'package':'L7'}];
  fleets = [{'fleet':'1-2'},{'fleet':'3-6'},{'fleet':'7-14'},{'fleet':'15-25'},{'fleet':'26-60'},{'fleet':'51-75'},{'fleet':'76-100'}];
  
  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.getPricingData({});
  }
  
  getPricingData(filters) {
    this.carrierService.getPricingData(filters).then(data => {
      if (data.success) {
        for(let i = 0 ; i < data.results.length ; i++) {
          data.results[i]['annual_price'] = parseInt(data.results[i].monthly_price.split('$')[1]) * 12;
          data.results[i]['monthPrice'] = parseInt(data.results[i].monthly_price.split('$')[1]);
          data.results[i]['packageL'] = parseInt(data.results[i].package_level.split('L')[1]);
          data.results[i]['carrierCount'] = data.results[i].trs_tbl_carriers.length;
          data.results[i]['fleetLength'] = parseInt(data.results[i].number_of_fleets.split('-')[0]);
        }
        this.totalPricing = data.results;
        console.log(data.results);
        this.pricingList = this.totalPricing.slice(this.currentPage * this.pageSize, (this.currentPage * this.pageSize) + this.pageSize);
        this.totalSize =  data.results.length;
        data.count ? this.showEmpty = false : this.showEmpty = true;
      }
      else {
        this.pricingList = [];
        this.showEmpty = true;
        this.alertService.createAlert(data.message, 0);
      }
    })
  }
  
  goOntoLocal(yes) {
    console.log(yes);
    sessionStorage.setItem("RemovingItem",yes);
  }
  
  fliterSearch() {
    let filters = {};
    if (this.package_filter){
      filters['package_level'] = this.package_filter;
    } 
    if (this.fleet_filter){
      filters['number_of_fleets'] = this.fleet_filter;
    }
    if (this.monthlyForm.value){
      filters['monthly_price'] = this.monthlyForm.value.trim();
    } 
    this.getPricingData(filters);
  }
  
  clearFilters() {
    this.package_filter = '';
    this.fleet_filter = '';
    this.monthlyForm.setValue('');
    this.getPricingData({});
  }
  
  PackageClicked(order) {
    if(order) {
      this.pricingList.sort(function(a, b) {
        var titleA = a.packageL, titleB = b.packageL;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.pricingList.sort(function(a, b) {
        var titleA = b.packageL, titleB = a.packageL;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  FleetNumberClicked(order) {
    if(order) {
      this.pricingList.sort(function(a, b) {
        var titleA = a.fleetLength, titleB = b.fleetLength;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.pricingList.sort(function(a, b) {
        var titleA = b.fleetLength, titleB = a.fleetLength;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  MonthlyClicked(order) {
    if(order) {
      this.pricingList.sort(function(a, b) {
        var titleA = a.monthPrice, titleB = b.monthPrice;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.pricingList.sort(function(a, b) {
        var titleA = b.monthPrice, titleB = a.monthPrice;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  AnnuallyClicked(order) {
    if(order) {
      this.pricingList.sort(function(a, b) {
        var titleA = a.annual_price, titleB = b.annual_price;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    else {
      this.pricingList.sort(function(a, b) {
        var titleA = b.annual_price, titleB = a.annual_price;
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
    }
    
  }
  
  SubscribersClicked(order) {
    if(order) {
      this.pricingList.sort(function(a, b) {
        return a.carrierCount - b.carrierCount;
      });
    }
    else {
      this.pricingList.sort(function(a, b) {
        return b.carrierCount - a.carrierCount;
      });
    }
  }
  
}
