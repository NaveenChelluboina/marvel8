import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../shared/shared.module';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { UsersComponent } from './users.component';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { PermissionsComponent } from './permissions/permissions.component'

export const routes = [
  { path: '', component: UsersComponent, pathMatch: 'full', data: { breadcrumb: 'Users' }},
  { path: 'permissions/:userId', component: PermissionsComponent, pathMatch: 'full', data: { breadcrumb: 'Permissions' }}
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    SharedModule,
    PipesModule,ConfirmationPopoverModule
  ],
  declarations: [
    UsersComponent,
    UserDialogComponent,
    PermissionsComponent
  ],
  entryComponents:[
    UserDialogComponent
  ]
})
export class UsersModule { }
