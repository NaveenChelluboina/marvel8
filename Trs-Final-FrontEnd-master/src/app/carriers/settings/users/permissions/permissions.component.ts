
import { Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/shared/services/alert.service';


@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.scss'],
    providers: [AlertService]
  })
  export class PermissionsComponent implements OnInit {
      constructor(private location:Location, private alertService: AlertService) {}
     
      public screens = [{"name":"Home","value1":"true","value2":"false","value3":"true","value4":"true"},{"name":"Corporate","value1":true,"value2":true,"value3":true,"value4":true},{"name":"Drivers","value1":true,"value2":true,"value3":true,"value4":true},{"name":"Fleet","value1":true,"value2":true,"value3":true,"value4":true},{"name":"Assets","value1":true,"value2":true,"value3":true,"value4":true},{"name":"IRP","value1":true,"value2":true,"value3":true,"value4":true},{"name":"IFTA","value1":true,"value2":true,"value3":true,"value4":true},{"name":"IRS","value1":true,"value2":true,"value3":true,"value4":true},{"name":"Settings","value1":true,"value2":true,"value3":true,"value4":true},{"name":"Users","value1":true,"value2":true,"value3":true,"value4":true}]

      ngOnInit() {

      }
      goBack() {
        this.location.back();
      }

      savePermissions() {
        this.alertService.createAlert('Successfully Saved.', 1);
      }
  }