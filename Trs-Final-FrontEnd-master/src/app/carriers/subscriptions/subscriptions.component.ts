import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CarriersService } from '../carriers.service';
import { AlertService } from '../../shared/services/alert.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { UpgrateSubscriptionConfirmationDialogComponent } from './upgrate-subscription-confirmation-dialog/upgrate-subscription-confirmation-dialog.component';
import { DeleteConfirmDialogComponent } from '../../shared/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  
  constructor(public dialog: MatDialog,private cdref: ChangeDetectorRef,public route:ActivatedRoute,public fb:FormBuilder,public carriersService:CarriersService,public alertService:AlertService) {
    this.getSubscription({});
    this.createSubscriptionForm();
    this.createDownGradeSubscriptionForm();
    
  }
  packages:any;
  downGradingPackages : any;
  information:any;
  updateSubscriptionForm: FormGroup;
  downGradeSubscriptionForm : FormGroup;
  selectedPlanId:any;
  selectedPackageid:any;
  changingVariable = 0;
  public canCreate : any;
  public canDelete : any;
  public canUpdate : any;
  currentAssetSize:any;
  public maxSize : any;
  
  ngOnInit() {
    // this.changingVariable = 0;
    this.updateSubscriptionForm.controls['assetSize'].setValue('-');
    this.updateSubscriptionForm.controls['price'].setValue('-');
    this.downGradeSubscriptionForm.controls['assetSizedown'].setValue('-');
    this.downGradeSubscriptionForm.controls['pricedown'].setValue('-');
    // this.updateSubscriptionForm.controls['subscriptionType'].setValue('-');
    // this.getSubscription({});
    this.getPackages({});
    this.getPackages({'from_package':1});
    this.getAssetsCurrentSize({});
    let userdata = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions[18];
    this.canCreate = parseInt(userdata.permission_type.split('')[0]);
    this.canUpdate = parseInt(userdata.permission_type.split('')[2]);
    this.canDelete = parseInt(userdata.permission_type.split('')[3]);
  }
  
  public getSubscription(filter) {
    if(this.changingVariable == 0 ) {
      let data= this.route.snapshot.data['carriesresolver']['subscriptionDetails'];
      if(data.success) {
        // this.cdref.detectChanges();  
        this.information = data.results;
        // this.cdref.detectChanges();
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    }
    else {
      let filterObj = {};
      filterObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      this.carriersService.getCarrierSubscription(filterObj).then(data => {
        if(data.success) {
          // this.cdref.detectChanges();  
          this.information = data.results;
          this.cdref.detectChanges();
          this.getPackages({});
          this.getPackages({'from_package':1});
        }
        else {
          this.alertService.createAlert(data.message,0)
        }
      })
    }
    
  }
  
  // public getMaxAssets() {
  //   let finalObj = {};
  //   finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  //   this.carriersService.getMaxAssetSize(finalObj).then(data => {
  //     if(data.success) {
  //       this.maxSize = data.results.max_asset_size;
  //     }
  //     else {
  //       this.alertService.createAlert(data.message,0);
  //     }
  //   });
  // }
  
  public getAssetsCurrentSize(finalObj) {
    finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.carriersService.getAllAssets(finalObj).then(data => { 
      if(data.success) {
        this.currentAssetSize = data.results.length;
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  public getPackages(filter) {
    filter['packageId'] = this.information.package_id;
    this.carriersService.getUpgradingPackages(filter).then(data => {
      if(data.success) {
        if(filter.from_package) {
          this.downGradingPackages = data.results;
          console.log(data.results);
          this.downGradeSubscriptionForm.controls['assetSizedown'].setValue('-');
          this.downGradeSubscriptionForm.controls['pricedown'].setValue('-');
          this.downGradeSubscriptionForm.controls['packageLeveldown'].setValue('');
          this.cdref.detectChanges();
        }
        else {
          this.packages = data.results;
          console.log(data.results);
          this.updateSubscriptionForm.controls['assetSize'].setValue('-');
          this.updateSubscriptionForm.controls['price'].setValue('-');
          this.updateSubscriptionForm.controls['packageLevel'].setValue('');
          this.cdref.detectChanges();
        }
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  unsubscribePackage(da) {
    let datz = {};
    datz['corporate_information_id'] = 1;
    let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: datz,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    
    dialogRef.afterClosed().subscribe(data => {
      if (data != null && data !== undefined) {
        let finalObj = {};
        finalObj['carrier_id'] = this.information.carrier_id;
        finalObj['stripe_subscription_id'] = this.information.stripe_subscription_id;
        this.carriersService.unsubscribePackage(finalObj).then(data => {
          if(data.success) {
            this.alertService.createAlert("Auto-Renewal cancelled successfully",1);
          }
          else {
            this.alertService.createAlert(data.message,0);
          }
        })
      }
    });
  }
  
  public getDetailsAsRequest(package_id) {
    for(let i = 0 ; i < this.packages.length ; i++) {
      if(package_id == this.packages[i].package_id) {
        this.updateSubscriptionForm.controls['assetSize'].setValue(this.packages[i].number_of_fleets);
        this.updateSubscriptionForm.controls['price'].setValue(this.packages[i].monthly_price);
        this.selectedPlanId = this.packages[i].stripe_plan_id;
        this.selectedPackageid = package_id;
      }
    }
    
  }
  
  public getDetailsAsRequestForDownGrade(package_id) {
    for(let i = 0 ; i < this.downGradingPackages.length ; i++) {
      if(package_id == this.downGradingPackages[i].package_id) {
        this.downGradeSubscriptionForm.controls['assetSizedown'].setValue(this.downGradingPackages[i].number_of_fleets);
        this.downGradeSubscriptionForm.controls['pricedown'].setValue(this.downGradingPackages[i].monthly_price);
        this.selectedPlanId = this.downGradingPackages[i].stripe_plan_id;
        this.selectedPackageid = package_id;
        this.maxSize = parseInt(this.downGradingPackages[i].number_of_fleets.split('-')[1]);
      }
    }
    
  }
  
  createSubscriptionForm() {
    this.updateSubscriptionForm = this.fb.group({
      packageLevel: new FormControl(''),
      assetSize: new FormControl(''),
      subscriptionType: new FormControl(''),
      price: new FormControl('')
    })
  }
  
  createDownGradeSubscriptionForm() {
    this.downGradeSubscriptionForm = this.fb.group({
      packageLeveldown: new FormControl(''),
      assetSizedown: new FormControl(''),
      subscriptionTypedown: new FormControl(''),
      pricedown: new FormControl('')
    })
  }
  
  
  
  upgradePlan() {
    let obj = {}
    let dialogRef = this.dialog.open(UpgrateSubscriptionConfirmationDialogComponent, {
      data: obj,
      height: 'auto',
      width: 'auto',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(item => {
      if (item != null && item !== undefined) {
        let finalObj = {};
        finalObj['stripe_subscription_id'] = this.information.stripe_subscription_id;
        finalObj['stripe_plan_id'] = this.selectedPlanId;
        finalObj['package_id'] = this.selectedPackageid
        finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
        console.log(finalObj);
        this.carriersService.upgradeAPlan(finalObj).then(data => {
          if(data.success) {
            this.changingVariable = 1;
            this.alertService.createAlert("Package upgraded successfully",1);
            this.getSubscription({});
            // this.getPackages({});
            
            // this.updateSubscriptionForm.controls[''].setValue('');
            // this.cdref.detectChanges();
          }
          else {
            this.alertService.createAlert(data.message,0);
          }
        })
      }
    });
  }
  
  downGradePlan() {
    if(this.maxSize  < this.currentAssetSize) {
      this.alertService.createAlert('The current number of assets in your account exceeds the allowable size of this package level. Please remove assets to downgrade your subscription',0);
      this.downGradeSubscriptionForm.controls['packageLeveldown'].setValue([]);
    }
    else {
      let finalObj = {};
      finalObj['stripe_subscription_id'] = this.information.stripe_subscription_id;
      finalObj['stripe_plan_id'] = this.selectedPlanId;
      finalObj['package_id'] = this.selectedPackageid
      finalObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
      console.log(finalObj);
      this.carriersService.upgradeAPlan(finalObj).then(data => {
        if(data.success) {
          this.changingVariable = 1;
          this.alertService.createAlert("Package downgraded successfully",1);
          this.getSubscription({});
          // this.getPackages({});
          
          // this.updateSubscriptionForm.controls[''].setValue('');
          // this.cdref.detectChanges();
        }
        else {
          this.alertService.createAlert(data.message,0);
        }
      })
    }
  }
  
}
