import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorporateInformationComponent } from './corporate-information/corporate-information.component';
import { DriverInformationComponent } from './driver-information/driver-information.component';
import { AssetInformationComponent } from './asset-information/asset-information.component';
import { IrpInformationComponent } from './irp-information/irp-information.component';
import { IftaInformationComponent } from './ifta-information/ifta-information.component';
import { IrsInformationComponent } from './irs-information/irs-information.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { DriverDialogComponent } from './driver-information/driver-dialog/driver-dialog.component';
import { AssetDialogComponent } from './asset-information/asset-dialog/asset-dialog.component';
import { UploadDocsDialogComponent } from './asset-information/upload-docs-dialog/upload-docs-dialog.component';
import { IrsDocsDialogComponent } from './irs-information/irs-docs-dialog/irs-docs-dialog.component';
import { TreeModule } from 'primeng/primeng';
import { ContextMenuModule, ContextMenu, MenuItem, MenuModule } from 'primeng/primeng';
import { FleetDialogComponent } from './irp-information/fleet-dialog/fleet-dialog.component';
import { YearDialogComponent } from './irp-information/year-dialog/year-dialog.component';
import { DocumentDialogComponent } from './irp-information/document-dialog/document-dialog.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TabsModule } from 'ngx-bootstrap';
import { IftaDialogComponent } from './ifta-information/ifta-dialog/ifta-dialog.component';
import { CalendarModule } from 'primeng/calendar';
// import { BsDatepickerModule } from 'ngx-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TrsGuard } from '../sales.guard';
import { CarrierResolverService } from './carrier-resolver.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SettingsComponent } from './settings/settings.component';
import { DeleteConfirmDialogComponent } from '../shared/delete-confirm-dialog/delete-confirm-dialog.component';
import { ImgDialogComponent } from './home/img-dialog/img-dialog.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { UsersComponent } from './settings/users/users.component';
import { AdduserDialogComponent } from './settings/users/adduser-dialog/adduser-dialog.component';
import { FleetInformationComponent } from './fleet-information/fleet-information.component';
import { AddfleetDialogComponent } from './fleet-information/addfleet-dialog/addfleet-dialog.component';
import { PermissionsComponent } from './settings/users/permissions/permissions.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { UploadAssetsComponent } from './irs-information/upload-assets/upload-assets.component';
import { DriverCommentDialogComponent } from './driver-information/driver-comment-dialog/driver-comment-dialog.component';
import { AssetsCommentsDialogComponent } from './asset-information/assets-comments-dialog/assets-comments-dialog.component';
import { IftaCommentsDialogComponent } from './ifta-information/ifta-comments-dialog/ifta-comments-dialog.component';
import { AddNewDriverdocumentComponent } from './driver-information/add-new-driverdocument/add-new-driverdocument.component';
import { FleetCommentsComponent } from './fleet-information/fleet-comments/fleet-comments.component';
import { AddnewassetdocumentComponent } from './asset-information/addnewassetdocument/addnewassetdocument.component';
import { IftaDocumentComponent } from './ifta-information/ifta-document/ifta-document.component';
import { GridColumnsForDriverComponent } from './driver-information/grid-columns-for-driver/grid-columns-for-driver.component';
import { GridColumnsForAssetComponent } from './asset-information/grid-columns-for-asset/grid-columns-for-asset.component';
import { DocumentCommentsComponent } from './corporate-information/document-comments/document-comments.component';
import { PaymentPageComponent } from './carrier-admin/payment-page/payment-page.component';
import { NgxStripeModule } from 'ngx-stripe';
import { AddCouponComponent } from './carrier-admin/payment-page/add-coupon/add-coupon.component';
import { ConfirmSendLinkDialogComponent } from './driver-information/confirm-send-link-dialog/confirm-send-link-dialog.component';
import { UpgrateSubscriptionConfirmationDialogComponent } from './subscriptions/upgrate-subscription-confirmation-dialog/upgrate-subscription-confirmation-dialog.component';

export const routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, data: { breadcrumb: 'Home' , permissionId:0 } , canActivate:[TrsGuard] , resolve:{carriesresolver : CarrierResolverService} },
  { path: 'corporate', component: CorporateInformationComponent, data: { breadcrumb: 'Corporate Information' , permissionId:1 } , canActivate:[TrsGuard] },
  { path: 'driver', component: DriverInformationComponent, data: { breadcrumb: 'Driver Information' , permissionId:2 } , canActivate:[TrsGuard] , resolve:{carriesresolver : CarrierResolverService} },
  { path: 'fleet', component: FleetInformationComponent, data: { breadcrumb: 'Fleet Information' , permissionId:3 } , canActivate:[TrsGuard] },
  { path: 'asset', component: AssetInformationComponent, data: { breadcrumb: 'Asset Information' , permissionId:4 } , canActivate:[TrsGuard] , resolve:{carriesresolver : CarrierResolverService} },
  { path: 'irp', component: IrpInformationComponent, data: { breadcrumb: 'IRP Information' , permissionId:5 } , canActivate:[TrsGuard] },
  { path: 'ifta', component: IftaInformationComponent, data: { breadcrumb: 'IFTA Information' , permissionId:6 } , canActivate:[TrsGuard] },
  { path: 'irs', component: IrsInformationComponent, data: { breadcrumb: 'IRS (HVUT) Information' , permissionId:7 } , canActivate:[TrsGuard] },
  // { path: 'payments', component: PaymentStripeComponent, data: { breadcrumb: 'IRS (HVUT) Information' } },
  // { path: 'settings', component: SettingsComponent, data: { breadcrumb: 'Settings' , permissionId:8 } , canActivate:[TrsGuard] },
  { path: 'subscriptions', component: SubscriptionsComponent, data: { breadcrumb: 'Subscription' , permissionId:18 } , canActivate:[TrsGuard] , resolve:{carriesresolver : CarrierResolverService} },
  // { path: 'users', component: UsersComponent, data: { breadcrumb: 'Users' , permissionId:9 } , canActivate:[TrsGuard] },
  // { path: 'users/permissions', component: PermissionsComponent, data: { breadcrumb: 'Permissions' , permissionId:10 } , canActivate:[TrsGuard] },
  { path: 'irs/upload-assets/:irsId/:isYear', component: UploadAssetsComponent, data: { breadcrumb: 'Upload-Assets' , permissionId:7 } , canActivate:[TrsGuard] },
  { path: 'admin', loadChildren:"./carrier-admin/carrier-admin.module#CarrierAdminModule", data: { breadcrumb: 'Admin' } }
];

@NgModule({
  declarations: [
    CorporateInformationComponent,
    DriverInformationComponent,
    AssetInformationComponent,
    IrpInformationComponent,
    IftaInformationComponent,
    IrsInformationComponent,
    HomeComponent,
    DriverDialogComponent,
    AssetDialogComponent,
    UploadDocsDialogComponent,
    IrsDocsDialogComponent,
    FleetDialogComponent,
    YearDialogComponent,
    DocumentDialogComponent,
    SettingsComponent,
    IftaDialogComponent,
    ImgDialogComponent,
    SubscriptionsComponent,
    UsersComponent,
    AdduserDialogComponent,
    FleetInformationComponent,
    AddfleetDialogComponent,
    PermissionsComponent,
    UploadAssetsComponent,
    DriverCommentDialogComponent,
    AssetsCommentsDialogComponent,
    IftaCommentsDialogComponent,
    AddNewDriverdocumentComponent,
    FleetCommentsComponent,
    AddnewassetdocumentComponent,
    IftaDocumentComponent,
    GridColumnsForDriverComponent,
    GridColumnsForAssetComponent,
    DocumentCommentsComponent,
    ConfirmSendLinkDialogComponent,
    UpgrateSubscriptionConfirmationDialogComponent,
    ],
  imports: [
    NgMultiSelectDropDownModule.forRoot(),
    CommonModule,
    CalendarModule,
    ConfirmationPopoverModule,
    // BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    TreeModule, ContextMenuModule, MenuModule,
    OwlDateTimeModule, OwlNativeDateTimeModule,
    TabsModule.forRoot(),
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxStripeModule.forRoot('pk_live_R1YQ4FPNkC7xwpQqiszUdqGe00I3R4i4nK'),
  ],
  providers:[CarrierResolverService],
  entryComponents: [UpgrateSubscriptionConfirmationDialogComponent,ConfirmSendLinkDialogComponent,DriverDialogComponent, AssetDialogComponent, UploadDocsDialogComponent,AddNewDriverdocumentComponent,
    IrsDocsDialogComponent, FleetDialogComponent, YearDialogComponent, DocumentDialogComponent, IftaDialogComponent,
    DeleteConfirmDialogComponent, DocumentCommentsComponent,ImgDialogComponent,AdduserDialogComponent,AddfleetDialogComponent,DriverCommentDialogComponent,AssetsCommentsDialogComponent,IftaCommentsDialogComponent,FleetCommentsComponent,AddnewassetdocumentComponent,IftaDocumentComponent,GridColumnsForDriverComponent,GridColumnsForAssetComponent]
})
export class CarriersModule { }
