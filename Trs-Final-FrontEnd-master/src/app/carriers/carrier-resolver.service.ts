import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { CarriersService } from './carriers.service';
import { CarrierService } from '../carrier/carrier.service';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarrierResolverService implements Resolve<any> {
  
  session: any;
  public carrierData:any;
  constructor(private carrierService: CarriersService, private carrService:CarrierService) { 
  //  this.carrierData = JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id;
  //  console.log(this.carrierData);
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return forkJoin([
      this.carrierService.getCorporateInformationInHome({'carrier_id':JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id}),
      this.carrierService.getGridColumnsForAssets({'carrier_id':JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id}),
      this.carrierService.getGridColumnsForDrivers({'carrier_id':JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id}),
      this.carrierService.getCarrierSubscription({'carrier_id':JSON.parse(sessionStorage.getItem('trs_user_info')).carrier_id}),
      this.carrService.getDashboardCardData({})
    ]).map(result => {
      return {
        homeInfo: result[0],
        gridColumnsInAssetsFromResolver:result[1],
        gridColumnsInDriversFromResolver:result[2],
        subscriptionDetails:result[3],
        superAdmin:result[4]
      };
    });
  };
  
}
