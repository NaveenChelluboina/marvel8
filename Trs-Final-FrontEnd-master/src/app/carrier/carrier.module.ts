import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingComponent } from './pricing/pricing.component';
import { RouterModule } from '@angular/router';
import { PackageComponent } from './package/package.component';
import { SettingsComponent } from './settings/settings.component';
import { CarrierListingComponent } from './carrier-listing/carrier-listing.component';
import { ModalModule } from 'ngx-bootstrap';
import { DataTableModule } from 'primeng/primeng';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TrsGuard } from '../sales.guard';
import { SharedModule } from '../shared/shared.module';
import { AddPackageComponent } from './package/add-package/add-package.component';
import { AddCarrierListingComponent } from './carrier-listing/add-carrier-listing/add-carrier-listing.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { DeleteConfirmDialogComponent } from '../shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { UpdatePackageDialogComponent } from './carrier-listing/update-package-dialog/update-package-dialog.component';
import { GridColumnsForClientsScreenComponent } from './carrier-listing/grid-columns-for-clients-screen/grid-columns-for-clients-screen.component';

export const routes = [
  { path: '', redirectTo: 'pricing', pathMatch: 'full' },
  { path: 'carrier-listing', component: CarrierListingComponent, data: { breadcrumb: 'Clients' , permissionId:14 } , canActivate:[TrsGuard] },
  { path: 'package', component: PackageComponent, data: { breadcrumb: 'Pricing' , permissionId:15 } , canActivate:[TrsGuard] },
  { path: 'subscriptions', component: SubscriptionsComponent, data: { breadcrumb: 'Subscriptions' , permissionId:16 } , canActivate:[TrsGuard] },
  { path: 'settings', component: SettingsComponent, data: { breadcrumb: 'Settings' , permissionId:17 } , canActivate:[TrsGuard] },
  // { path: 'users', component: UsersComponent, data: { breadcrumb: 'users' } }
];

@NgModule({
  declarations: [PricingComponent, SubscriptionsComponent, PackageComponent, SettingsComponent,CarrierListingComponent, AddPackageComponent, AddCarrierListingComponent, UpdatePackageDialogComponent, GridColumnsForClientsScreenComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ModalModule,
    SharedModule,
    ConfirmationPopoverModule,
    DataTableModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule
  ],
  entryComponents: [GridColumnsForClientsScreenComponent,AddCarrierListingComponent, AddPackageComponent,DeleteConfirmDialogComponent,UpdatePackageDialogComponent]
})
export class CarrierModule { }
