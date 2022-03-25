import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { DragulaService } from 'ng2-dragula';
import { DataTableModule } from 'primeng/primeng';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { AddColorcodeDialogComponent } from '../shared/add-colorcode-dialog/add-colorcode-dialog.component';
export const routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', loadChildren: './users/users.module#UsersModule',
  data: { breadcrumb: 'Users'} }
];

@NgModule({
  imports: [ 
    CommonModule,  SharedModule, ConfirmationPopoverModule,
    RouterModule.forChild(routes), DataTableModule, FormsModule, ReactiveFormsModule, TableModule,
    SharedModule, OwlDateTimeModule, OwlNativeDateTimeModule
  ], providers: [DragulaService],
  declarations: [
  ],
  entryComponents: [
    AddColorcodeDialogComponent 
  ]
})
export class AdminModule { }
