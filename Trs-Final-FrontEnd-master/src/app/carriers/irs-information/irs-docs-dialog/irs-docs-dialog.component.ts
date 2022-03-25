import { Component, OnInit, ViewEncapsulation,Inject } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material';
import { analytics } from 'src/app/dashboard/dashboard.data';

@Component({
  selector: 'app-irs-docs-dialog',
  templateUrl: './irs-docs-dialog.component.html',
  styleUrls: ['./irs-docs-dialog.component.scss']
})
export class IrsDocsDialogComponent implements OnInit {
     
  constructor( @Inject(MAT_DIALOG_DATA) public lead: any,public dialogRef: MatDialogRef<IrsDocsDialogComponent>) { }
  operations =[{'operation_id' : '1','operation_name':'TR187982323'},
  {'operation_id' : '2','operation_name':'TR987982324'},
  {'operation_id' : '2','operation_name':'TR987982254'},
 ]

  ngOnInit() {
    // states = [
    //   'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    //   'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    //   'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    //   'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    //   'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    //   'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    //   'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    // ];
  }

  close(): void {
    this.dialogRef.close();
  }
  
}
