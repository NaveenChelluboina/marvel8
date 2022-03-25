import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { products } from './dashboard.data';
import { GoogleMapsAPIWrapper, AgmMap, LatLngBounds, LatLngBoundsLiteral} from '@agm/core';
import { AlertService } from '../shared/services/alert.service';
import { CarrierService } from '../carrier/carrier.service';
import { ActivatedRoute } from '@angular/router';
declare var google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  @ViewChild('AgmMap') OppAgmMap: AgmMap;
  @ViewChild('AgmMap') PropAgmMap: AgmMap;
  @ViewChild('resizedDiv') resizedDiv: ElementRef;
  public previousWidthOfResizedDiv: number = 0;
  public showLegend = false;
  public gradient = true;
  information:any;
  subscribers:any;
  fleets:any;
  lat = 51.213890;
  lng = -102.462776;
  public colorScheme = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B', '#0096A6', '#F47B00', '#606060']
  };
  public showLabels = true;
  public explodeSlices = false;
  public doughnut = false;
  public zoomControlOptions: any = {
    style: google.maps.ControlPosition.small,
    position: google.maps.ControlPosition.TOP_LEFT,
  };
  
  constructor(public route:ActivatedRoute,private alertService: AlertService, public carrierService:CarrierService,) { }

  ngOnInit() {
    this.getDashboardCardData();
    this.getDashboardSubData();
    this.getDashboardFleetData();
    this.getDashboardLineData();
  }

  getDashboardCardData() {
    let data= this.route.snapshot.data['carriesresolver']['superAdmin']; 
    this.information = data.results;
    console.log(this.information);
  }

  getDashboardSubData() {
    let filterObj = {};
    this.carrierService.getDashboardSubscribersData(filterObj).then( data => {
      if(data.success) {
        this.subscribers = data.results;
      } else {
        this.alertService.createAlert(data.message,0)
      }
    });
  }

  getDashboardFleetData() {
    let filterObj = {};
    this.carrierService.getDashboardFleetsData(filterObj).then( data => {
      if(data.success) {
        this.fleets = data.results;
      } else {
        this.alertService.createAlert(data.message,0)
      }
    });
  }
  
  getDashboardLineData() {
    let filterObj = {};
    this.carrierService.getDashboardLineData(filterObj).then( data => {
      if(data.success) {
        
        console.log(data.results);
      } else {
        this.alertService.createAlert(data.message,0)
      }
    });
  }

  onMouseOver(infoWindow, gm) {
    /* if (gm.lastOpen != null) {
        gm.lastOpen.close();
    } */
    gm.lastOpen = infoWindow;
    infoWindow.open();
  }

  onMouseOut(infoWindow, gm) {
    if (gm.lastOpen != null) {
      gm.lastOpen.close();
    }
  }
}
