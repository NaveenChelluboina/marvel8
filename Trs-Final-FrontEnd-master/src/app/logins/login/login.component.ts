import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { AlertService } from '../../shared/services/alert.service';
import { LoginService } from '../login.service';
import { CookieService } from 'ngx-cookie-service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  public form: FormGroup;
  public settings: Settings;
  shadowLoginEmail: any;
  public moduleUrls: any = {
    "Home": "/transreport/carriers/home",
    "Corporate": "/transreport/carriers/corporate",
    "Drivers": "/transreport/carriers/driver",
    "Fleet": "/transreport/carriers/fleet",
    "Assets": "/transreport/carriers/asset",
    "IRP": "/transreport/carriers/irp",
    "IFTA": "/transreport/carriers/ifta",
    "IRS": "/transreport/carriers/irs",
    "Roles": "/transreport/carriers/admin/roles",
    "Users": "/transreport/carriers/admin/users",
    "Settings": "/transreport/carriers/admin/settings",
    "Dashboard": "/transreport/dashboard",
    "Asset-Types": "/transreport/carriers/admin/assettypes",
    "Asset-Make": "/transreport/carriers/admin/assetmake",
    "Clients": "/transreport/carrier/carrier-listing",
    "Pricing": "/transreport/carrier/package",
    "Subscriptions": "/transreport/carrier/subscriptions",
    "Admin-Settings": "/transreport/carrier/settings",
    // "Subscriptions":"/transreport/carriers/subscriptions"
  };
  constructor(
    public loginService: LoginService, public alertService: AlertService,
    public appSettings: AppSettings, public fb: FormBuilder, public router: Router,
    private cookieService: CookieService, private location: Location, public route: ActivatedRoute) {
    this.settings = this.appSettings.settings;
    this.form = this.fb.group({
      'email': [null, Validators.compose([Validators.required, emailValidator])],
      'password': [null, Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  ngOnInit() {

    this.route.queryParamMap
      .subscribe(params => {
        const paramsObject = { ...params.keys, ...params };
        console.log(paramsObject['params'].email);
        this.shadowLoginEmail = paramsObject['params'].email;
        this.location.replaceState("/login");
        if (this.shadowLoginEmail) {
          let value = {
            email: this.shadowLoginEmail,
            password: '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'
          }
          this.onSubmit(value);
        } else if (localStorage.getItem('trs_user_info')) {
          var currentUser = JSON.parse(localStorage.getItem('trs_user_info'));
          sessionStorage.setItem('trs_user_info', JSON.stringify(currentUser))
          if (localStorage.getItem('userType')) {
            sessionStorage.setItem('userType', localStorage.getItem('userType'))
          }
          if (localStorage.getItem('checkForAdminCreation')) {
            sessionStorage.setItem('checkForAdminCreation', localStorage.getItem('checkForAdminCreation'))
          }
          if (localStorage.getItem('settings')) {
            sessionStorage.setItem('settings', localStorage.getItem('settings'))
          }

          let token = currentUser.token;
          this.loginService.checkSessionAlive(token).then(res => {
            if (res.success) {
              this.router.navigate([currentUser.landing_url]);
            }
          });
        }
      }
      );

  }

  public onSubmit(values) {
    if (this.form.valid || values) {
      this.loginService.loginCheck(values.email, values.password).then(data => {
        if (data.auth) {
          let per_data = data;
          let flag = true;
          for (let k = 0; (k < per_data.user_permissions.length) && (flag == true); k++) {
            if (per_data.user_permissions[k].permission_type.split('')[1] !== '0') {
              if (sessionStorage.getItem('trs_user_info')) {
                sessionStorage.removeItem('trs_user_info');
                sessionStorage.removeItem('trs_user_info');
              }
              sessionStorage.removeItem('sort');
              sessionStorage.removeItem('checkForAdminCreation');
              if (per_data.userType == 2) {
                sessionStorage.setItem('trs_user_info', JSON.stringify({ user_id: data.user_id, carrier_id: data.carrierId, name: data.name, role: data.role_name, token: data.auth_token, user_permissions: data.user_permissions, phone: data.phone, email: data.email, landing_url: this.moduleUrls[per_data.user_permissions[k].right_master_name] }));
                if (!this.shadowLoginEmail) {
                  localStorage.setItem('trs_user_info', JSON.stringify({ user_id: data.user_id, carrier_id: data.carrierId, name: data.name, role: data.role_name, token: data.auth_token, user_permissions: data.user_permissions, phone: data.phone, email: data.email, landing_url: this.moduleUrls[per_data.user_permissions[k].right_master_name] }));
                  localStorage.setItem('userType', 'carrier');
                  localStorage.setItem('checkForAdminCreation', data.carrierRequest);
                }

                this.getSettings(per_data.user_permissions[k].right_master_name);
                sessionStorage.setItem('userType', 'carrier');
                sessionStorage.setItem('checkForAdminCreation', data.carrierRequest);

                flag = false;

                this.router.navigate([this.moduleUrls[per_data.user_permissions[k].right_master_name]]);
              }
              else {
                sessionStorage.setItem('trs_user_info', JSON.stringify({ user_id: data.user_id, carrier_id: data.carrierId, name: data.name, role: data.role_name, token: data.auth_token, user_permissions: data.user_permissions, phone: data.phone, email: data.email, landing_url: this.moduleUrls[per_data.user_permissions[13].right_master_name] }));
                if (!this.shadowLoginEmail) {
                  localStorage.setItem('trs_user_info', JSON.stringify({ user_id: data.user_id, carrier_id: data.carrierId, name: data.name, role: data.role_name, token: data.auth_token, user_permissions: data.user_permissions, phone: data.phone, email: data.email, landing_url: this.moduleUrls[per_data.user_permissions[k].right_master_name] }));
                  localStorage.setItem('userType', 'admin');
                  localStorage.setItem('checkForAdminCreation', data.carrierRequest);
                }
                sessionStorage.setItem('userType', 'admin');
                this.getAdminSettings();
                sessionStorage.setItem('checkForAdminCreation', data.carrierRequest);
                flag = false;

                this.router.navigate([this.moduleUrls[per_data.user_permissions[13].right_master_name]]);
              }
              this.alertService.createAlert(data.message, 1);
              break;
            }
          }
          if (flag) {
            this.alertService.createAlert("You don't have any permissions. Please contact admin", 0);
          }
        }
        else {
          this.alertService.createAlert(data.message, 0);
        }
      });
    }
    // if (this.form.valid && values.email == "admin@transreport.com") {
    //   sessionStorage.setItem('userType', 'admin');
    //   this.router.navigate(['/transreport/dashboard']);
    // } else if (this.form.valid && values.email == "carrier@transreport.com") {
    //   sessionStorage.setItem('userType', 'carrier');
    //   this.router.navigate(['/transreport/carriers']);
    // } else {
    //   sessionStorage.setItem('userType', '');
    // }

    //  this.router.navigate(['/']);
  }
  getSettings(key) {
    let filterObj = {};
    filterObj['page'] = 0;
    filterObj['per_page'] = 100;
    filterObj['carrier_id'] = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
    this.loginService.getSettings(filterObj)
      .then(data => {
        if (data.success) {
          console.log(data)
          sessionStorage.setItem('settings', data.results[0]['setting_value']);
          localStorage.setItem('settings', data.results[0]['setting_value']);
          this.router.navigate([this.moduleUrls[key]]);
        }
      }
      );
  }
  //adminsettings
  getAdminSettings() {
    let filterObj = {};
    this.loginService.getAdminSettings(filterObj).then(data => {
      if (data.success) {
        for (let i in data.results) {
          if (data.results[i].name == "Grid Length") {
            sessionStorage.setItem('settings', data.results[i].setting_value);
            localStorage.setItem('settings', data.results[i].setting_value);
          }
        }
      } else {
        this.alertService.createAlert(data.message, 0);
      }
    });
  }

  ngAfterViewInit() {
    this.settings.loadingSpinner = false;
    sessionStorage.setItem('userType', '');

  }
}