import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { analytics } from '../dashboard.data';
import { AlertService } from '../../shared/services/alert.service';
import { CarrierService } from '../../carrier/carrier.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styles:['.year-dropdown {width:110px;float:right;}']
})
export class AnalyticsComponent implements OnInit {
  
  public analytics: any[];
  yearOptions = [2022,2021,2020,2019,2018];
  toppingsYear = new FormControl();
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = false;
  public showXAxisLabel = false;
  public xAxisLabel = 'Year';
  public showYAxisLabel = false;
  public yAxisLabel = 'Profit';
  public colorScheme = {
    domain: ['#283593', '#039BE5', '#FF5252']
  }; 
  public autoScale = true;
  public roundDomains = true;
  @ViewChild('resizedDiv') resizedDiv:ElementRef;
  public previousWidthOfResizedDiv:number = 0; 
  
  constructor(private alertService: AlertService, public carrierService:CarrierService) { }
  
  ngOnInit() {
    this.getDashboardLineData({});
    // this.analytics = analytics; 
  }
  
  onSelect(event) {
  }
  
  filterDashboard() {
    let filters = {};
    if(this.toppingsYear.value)
    filters['created_date'] = this.toppingsYear.value;
    this.getDashboardLineData(filters);
  }
  
  clearFilters() {
    this.toppingsYear.setValue('');
    this.getDashboardLineData({});
  }
  
  getDashboardLineData(filterObj) {
    // let filterObj = {};
    this.carrierService.getDashboardLineData(filterObj).then( data => {
      if(data.success) {
        this.analytics = [{name: 'Subscribed', series: data.results}];
        console.log(data.results);
      } else {
        this.alertService.createAlert(data.message,0)
      }
    });
  }
  
  ngAfterViewChecked() {    
    if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
      // this.analytics = [...analytics];
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }
  
}