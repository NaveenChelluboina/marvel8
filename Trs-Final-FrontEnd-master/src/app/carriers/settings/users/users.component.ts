import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AdduserDialogComponent } from './adduser-dialog/adduser-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/shared/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public pageSize = 10;
  public currentPage = 0;
  public totalSize = 0;
  filterToggle: boolean;
  operations =[{'operation_id' : '1','operation_name':'Active'},
  {'operation_id' : '2','operation_name':'Inactive'},
 ]
  constructor( public dialog: MatDialog) { }
  Users = [
  { status: 1,'id': 0, 'userType':'Admin','CarrierName': 'Laura', 'Permissions': '25/25','EmailID': 'laura@gmail.com', 'Phone': '4589132557'},
  { status: 1,'id': 1, 'userType':'Admin','CarrierName': 'Nicol', 'Permissions': '18/25','EmailID': 'nicol@gmail.com', 'Phone': '4589132558'},
  { status: 0,'id': 2, 'userType':'Carrier','CarrierName': 'Jolinka', 'Permissions': '23/25','EmailID': 'jolinka@gmail.com', 'Phone': '4589132559'},
  { status: 0,'id': 3,'userType':'Admin' ,'CarrierName': 'Stefanie', 'Permissions': '16/25','EmailID': 'stefanie@gmail.com', 'Phone': '4589132587'},
  { status: 1,'id': 4, 'userType':'Carrier','CarrierName': 'Grieve', 'Permissions': '22/25','EmailID': 'grieve@gmail.com', 'Phone': '4589132577'},
]
  ngOnInit() {
  }
  public handlePage(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
}

 public openUserDialog(status) {
        let dialogRef = this.dialog.open(AdduserDialogComponent, {
            data:status,
            height: 'auto',
            width: '600px',
            autoFocus: false,
            panelClass: 'my-dialog'
        });
        dialogRef.afterClosed().subscribe(data => {
        });
    }
    openDeleteDialog() {
      let dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: null,
        height: 'auto',
        width: 'auto',
        autoFocus: false
      });
  
      dialogRef.afterClosed().subscribe(prospects => {
  
      });
    }
}
