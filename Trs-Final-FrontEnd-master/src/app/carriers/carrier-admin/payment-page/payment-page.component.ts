import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarriersService } from '../../carriers.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CarrierService } from '../../../carrier/carrier.service';
import { formArrayNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { AddCouponComponent } from './add-coupon/add-coupon.component';
import { MatDialog } from '@angular/material';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.scss']
})
export class PaymentPageComponent implements OnInit {
  userId: string;
  accesToken: string;
  states:any;
  paymentDetails:FormGroup;
  packageID : any;
  amountToPay:any;
  numberOfAssets:any;
  tokenGenerated : any;
  validation:boolean = false;
  
  constructor(public dialog: MatDialog,private carrService:CarrierService,private activatedRoute: ActivatedRoute,public router:Router,public fb:FormBuilder,public carrierService:CarriersService, public alertService: AlertService,public route:ActivatedRoute) {
    this.createPaymentDetails();
    this.activatedRoute.queryParams.subscribe(params => { 
      this.userId = params.cid;
      this.accesToken = params.activationToken;
    });
  }
  
  ngOnInit() {
    this.packageID = this.route.snapshot.paramMap.get('packageId');
    console.log(this.packageID);
    console.log(this.userId);
    console.log(this.accesToken);
    if(this.accesToken) {
      this.getCarrierDetails(this.userId);
      console.log("here");
      let finalObj = {};
      finalObj['carrierId'] = this.userId;
      finalObj['accessToken'] = this.accesToken;
      this.carrierService.urlStatusCheck(finalObj).then(res => {
        if (!res.success) {
          this.alertService.createAlert('The URL is no longer valid.', 0);
          this.router.navigate(['/login']);
        } else {
          this.validation = true;
        }
      }).catch(e => {
        console.log(e)
      });
    }
    this.getPackageAmount({});
    this.loadStripe();
  }
  
  getCarrierDetails(id) {
    let finalObj = {};
    finalObj['carrier_id'] = id;
    this.carrService.getSingleClientDetailsForPayment(finalObj).then(data => {
      if(data.success) {
        // this.getStatesDropdown(data.results.country_id);
        this.paymentDetails.controls['companylegalName'].setValue(data.results.company_name);
        this.paymentDetails.controls['clientName'].setValue(data.results.carrier_name);
        this.paymentDetails.controls['emailID'].setValue(data.results.carrier_email);
        this.paymentDetails.controls['phone'].setValue(data.results.carrier_phone);
        this.paymentDetails.controls['address'].setValue(data.results.carrier_address);
        this.paymentDetails.controls['country'].setValue(data.results.country_id);
        this.paymentDetails.controls['state'].setValue(data.results.state_id);
        this.paymentDetails.controls['city'].setValue(data.results.city);
        this.paymentDetails.controls['zip'].setValue(data.results.zip);
        this.paymentDetails.controls['companylegalName'].disable();
        this.paymentDetails.controls['clientName'].disable();
        this.paymentDetails.controls['emailID'].disable();
        this.paymentDetails.controls['phone'].disable();
        this.paymentDetails.controls['address'].disable();
        this.paymentDetails.controls['country'].disable();
        this.paymentDetails.controls['state'].disable();
        this.paymentDetails.controls['city'].disable();
        this.paymentDetails.controls['zip'].disable();
        
        console.log(data.results);
        this.getStatesDropdown(data.results.country_id);
      }
      else {
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  payhere(couponCode) {
    console.log(couponCode);
    let dialogRef = this.dialog.open(AddCouponComponent, {
      data: couponCode,
      height: 'auto',
      width: '450px',
      autoFocus:false
    });
    dialogRef.afterClosed().subscribe(data => {
      if(data == 'save') {
       
      }
    });
  }
  
  createPaymentDetails() {
    this.paymentDetails = this.fb.group({
      companylegalName : new FormControl('',[Validators.required,this.noWhiteSpaceValidator]),
      clientName : new FormControl('',[Validators.required,this.noWhiteSpaceValidator]),
      emailID : new FormControl('',[Validators.required,this.noWhiteSpaceValidator]),
      phone : new FormControl('',[Validators.required,this.noWhiteSpaceValidator]),
      address : new FormControl('',[Validators.required,this.noWhiteSpaceValidator]),
      country : new FormControl('' , [Validators.required]),
      state : new FormControl('' , [Validators.required]),
      coupon : new FormControl('',[Validators.maxLength(20)]),
      city : new FormControl('' , [Validators.maxLength(25) , Validators.required , this.noWhiteSpaceValidator]),
      zip : new FormControl('' , [Validators.maxLength(10) , Validators.required , this.noWhiteSpaceValidator]),
      termsAndConditions : new FormControl(''),
    });
  }
  
  get clientName() { return this.paymentDetails.get('clientName'); }

  get companylegalName() { return this.paymentDetails.get('companylegalName'); }
  
  get emailID() { return this.paymentDetails.get('emailID'); }
  
  get phone() { return this.paymentDetails.get('phone'); }
  
  get address() { return this.paymentDetails.get('address'); }
  
  get country() { return this.paymentDetails.get('country'); }
  
  get state() { return this.paymentDetails.get('state'); }
  
  get city() { return this.paymentDetails.get('city'); }
  
  get zip() { return this.paymentDetails.get('zip'); }
  
  get coupon() { return this.paymentDetails.get('coupon'); }

  get termsAndConditions() { return this.paymentDetails.get('termsAndConditions'); }
  
  getStatesDropdown(country_id) {
    let obj = {'country_id':country_id};
    this.carrierService.getStatedDropdown(obj).then(data => {
      if(data.success) {
        console.log(data.results);
        this.states = data.results;
      }
      else { 
        this.alertService.createAlert(data.message,0);
      }
    })
  }
  
  public getPackageAmount(filter) {
    filter['package_id'] = this.packageID;
    this.carrierService.getPackageAmount(filter).then(data => {
      if(data.success) {
        this.amountToPay = data.results[0].monthly_price.split('$')[1];
        this.numberOfAssets = data.results[0].number_of_fleets;
        console.log(this.amountToPay);
      }
      else {
        this.alertService.createAlert(data.message,0)
      }
    })
  }
  
  noWhiteSpaceValidator(control:FormControl) {
    let isWhiteSpace = (control.value || '').trim().length === 0;
    let isValid=!isWhiteSpace;
    return isValid ? null : {'whitespace':true};
  }
  
  handler:any = null;
  
  pay(amount) {
    let finalObj = {};
    let tempObj = {};
    tempObj['company_name'] = this.paymentDetails.value.companylegalName;
    tempObj['carrier_name'] = this.paymentDetails.value.clientName;
    tempObj['carrier_email'] = this.paymentDetails.value.emailID;
    tempObj['carrier_phone'] = this.paymentDetails.value.phone;
    tempObj['carrier_address'] = this.paymentDetails.value.address;
    tempObj['country_id'] = this.paymentDetails.value.country;
    tempObj['state_id'] = this.paymentDetails.value.state;
    tempObj['city'] = this.paymentDetails.value.city;
    tempObj['zip'] = this.paymentDetails.value.zip;
    var handler =  (<any>window).StripeCheckout.configure({
      key: 'pk_live_R1YQ4FPNkC7xwpQqiszUdqGe00I3R4i4nK',
      locale: 'auto',
      token:  (token: any) => {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        console.log(token);
        this.tokenGenerated = token;
        finalObj['token'] = token.id;
        finalObj['package_id'] = this.packageID;
        finalObj['carrier_details'] = tempObj;
        if(!this.accesToken) {
          
          this.carrierService.makePaymentForPackage(finalObj).then(data => {
            if(data.success) {
              this.alertService.createAlert(data.message,1);
              this.router.navigate(['/login']);
            }
            else {
              this.alertService.createAlert(data.message + ". Any amount debited will be refunded within 5-7 business days",0);
            }
          })
        }
        if(this.accesToken) {
          finalObj['carrier_id'] = this.userId;
          console.log(finalObj);
          this.carrierService.makePaymentForPackageForClient(finalObj).then(data => {
            if(data.success) {
              this.alertService.createAlert(data.message,1);
              this.router.navigate(['/login']);
            }
            else {
              this.alertService.createAlert(data.message + ". Any amount debited will be refunded within 5-7 business days",0);
            }
          })
        }
        
        // console.log(finalObj);
        // alert('Token Created!!');
      }
    });
    
    handler.open({
      name: 'PermiShare',
      description: this.numberOfAssets + " Assets",
      amount: amount * 100
    });
  }

  openTermsAndConditionsModalPopup(couponCode) {
    let dialogRef = this.dialog.open(TermsAndConditionsComponent, {
      data: couponCode,
      height: 'auto',
      width: 'auto',
      autoFocus:false
    });
    dialogRef.afterClosed().subscribe(data => {
      if(data == 'save') {
       
      }
    });
  }
  
  // pays(amount) {
  //   let filter = {};
  //   filter['amount'] = this.amountToPay
  //   this.carrierService.makePaymentForPackage(filter).then(data => {
  //     if(data.success) {
  //       console.log(data);
  //     }
  //     else {
  //       this.alertService.createAlert(data,0);
  //     }
  //   })
  // }
  
  loadStripe() {
    
    if(!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://checkout.stripe.com/checkout.js";
      s.onload = () => {
        this.handler = (<any>window).StripeCheckout.configure({
          key: 'pk_live_R1YQ4FPNkC7xwpQqiszUdqGe00I3R4i4nK',
          locale: 'auto',
          token: function (token: any) {
            // You can access the token ID with `token.id`.
            // Get the token ID to your server-side code for use.
            console.log(token);
            // console.log("herte");
            alert('Payment Success!!');
          }
        });
      }
      
      window.document.body.appendChild(s);
    }
  }
  
  
  
}
