import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CarrierService } from '../carrier.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private alertService: AlertService, public carrierService:CarrierService, private changeDetectorRefs: ChangeDetectorRef) { }
  tableList: any;
  showEmpty: boolean = true;
  public popoverStatusTitle: string = 'Confirm Save Change';
  public popoverStatusMessage: string = 'Are you sure you want to save changes?';
  public cancelClicked: boolean = false;

  ngOnInit() {
    this.getSettings();
  }

  getSettings() {
    let filterObj = {};
    this.carrierService.getSettings(filterObj).then( data => {
      if(data.success) {
        console.log(data.results)
        this.tableList = data.results;
        data.count ? this.showEmpty = false : this.showEmpty = true;
        this.changeDetectorRefs.detectChanges();
        
      } else {
        this.tableList = [];
        this.showEmpty = true;
        this.alertService.createAlert(data.message, 0);
      }
    });
  }

  saveSettings(item) {
    if(!item.new_value)
    return;
    this.carrierService.updateSettings(item).then( data => {
      if(data.success) {
        if(item.name == 'Grid Length') {
          sessionStorage.setItem('settings', item.new_value);
          localStorage.setItem('settings', item.new_value);
        }
        this.getSettings();
        this.alertService.createAlert("Settings saved successfully", 1);
      } else {
        this.getSettings();
        this.alertService.createAlert(data.message, 0);
      }
    });
  }
  

  checkEmail(email) {
    /* let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/; */
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])/;
    if (reg.test(email) == false) {
      return false;
    } else {
      return true;
    }
  }
  allow_only_numbers(event) {
    var k;
    k=event.charCode;
    return ((k > 47 && k < 58));
  }
}
