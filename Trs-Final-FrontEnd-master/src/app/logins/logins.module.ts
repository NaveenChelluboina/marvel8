import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component'; 
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { UserActivateComponent } from './useractivate/useractivate.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import {TooltipModule} from "ngx-tooltip";
import { DriveractivateComponent } from './driveractivate/driveractivate.component';
import { ResetDriverPasswordComponent } from './reset-driver-password/reset-driver-password.component';

export const routes = [
  {path:'', redirectTo:'login', pathMatch:'full'},
  {path:'login', component:LoginComponent, data: { breadcrumb: 'Login' } },
  {path:'forgotpassword' , component: ForgotpasswordComponent },
  {path:'resetpassword', component: ResetpasswordComponent},
  {path:'userverification', component: UserActivateComponent},
  {path:'driververification', component: DriveractivateComponent},
  {path:'resetdriverpassword', component: ResetDriverPasswordComponent},
]

@NgModule({
  declarations: [ForgotpasswordComponent, ResetpasswordComponent, LoginComponent, UserActivateComponent, DriveractivateComponent, ResetDriverPasswordComponent],
  imports: [
    CommonModule,
    TooltipModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule
  ]
})
export class LoginsModule { }
