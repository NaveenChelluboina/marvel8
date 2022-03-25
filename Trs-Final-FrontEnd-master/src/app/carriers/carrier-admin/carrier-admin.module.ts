import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarrierAdminComponent } from './carrier-admin.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { DragulaService } from 'ng2-dragula';
import { DataTableModule } from 'primeng/primeng';
import { TrsGuard } from '../../sales.guard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TableModule } from 'primeng/table';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { AlertService } from '../../shared/services/alert.service';
import { AddUserComponent } from './users/add-user/add-user.component';
import { PermissionsComponent } from './users/permissions/permissions.component';
import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { AssetTypeComponent } from './asset-type/asset-type.component';
import { AssetMakeComponent } from './asset-make/asset-make.component';
import { RolePermissionsComponent } from './roles-and-permissions/role-permissions/role-permissions.component';
import { AddRolePermissionsComponent } from './roles-and-permissions/add-role-permissions/add-role-permissions.component';
import { AddAssetTypeComponent } from './asset-type/add-asset-type/add-asset-type.component';
import { AddAssetMakeComponent } from './asset-make/add-asset-make/add-asset-make.component';
import { AddCouponComponent } from './payment-page/add-coupon/add-coupon.component';
import { DriverDocumentsHistoryComponent } from './driver-documents-history/driver-documents-history.component';
import { AssetHistoryComponent } from './asset-history/asset-history.component';
import { AssetHistoryDialogComponent } from './asset-history/asset-history-dialog/asset-history-dialog.component';
import { TermsAndConditionsComponent } from './payment-page/terms-and-conditions/terms-and-conditions.component';
// import { PaymentPageComponent } from './payment-page/payment-page.component';

export const routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component:UsersComponent, data: { breadcrumb: 'Users' , permissionId:9 } , canActivate:[TrsGuard] },
  { path: 'roles/rolepermissions/:roleId', component:RolePermissionsComponent, data: { breadcrumb: 'Permissions' , permissionId:10 } , canActivate:[TrsGuard] },
  { path: 'settings', component:SettingsComponent, data: { breadcrumb: 'Settings' , permissionId:8 } , canActivate:[TrsGuard] },
  { path: 'roles', component:RolesAndPermissionsComponent, data: { breadcrumb: 'Roles' , permissionId:10 } , canActivate:[TrsGuard] },
  { path: 'assettypes', component:AssetTypeComponent, data: { breadcrumb: 'Asset-Types' , permissionId:11 } , canActivate:[TrsGuard] },
  { path: 'assetmake', component:AssetMakeComponent, data: { breadcrumb: 'Asset-Make' , permissionId:12 } , canActivate:[TrsGuard] },
  { path: 'document-history', component:DriverDocumentsHistoryComponent, data: { breadcrumb: 'Document History', permissionId:19 } , canActivate:[TrsGuard] },
  { path: 'asset-history', component:AssetHistoryComponent, data: { breadcrumb: 'Asset History', permissionId:19 } , canActivate:[TrsGuard] },
];

@NgModule({
  declarations: [CarrierAdminComponent, SettingsComponent, UsersComponent, AddUserComponent, PermissionsComponent, RolesAndPermissionsComponent, AssetTypeComponent, AssetMakeComponent, RolePermissionsComponent, AddRolePermissionsComponent, AddAssetTypeComponent, AddAssetMakeComponent, DriverDocumentsHistoryComponent, AssetHistoryComponent, AssetHistoryDialogComponent],
  imports: [
    CommonModule, ModalModule, SharedModule, ConfirmationPopoverModule.forRoot({confirmButtonType:'danger'}),OwlDateTimeModule, OwlNativeDateTimeModule,
    RouterModule.forChild(routes), DataTableModule, FormsModule, ReactiveFormsModule, TableModule,
    SharedModule
  ],
  entryComponents:[AssetHistoryDialogComponent,AddUserComponent,AddRolePermissionsComponent,AddAssetTypeComponent,AddAssetMakeComponent]
})
export class CarrierAdminModule { }
