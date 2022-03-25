import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import { getToken } from '@angular/router/src/utils/preactivation';
import { Header } from 'primeng/primeng';

@Injectable({
  providedIn: 'root'
})

export class CarrierService {
    public headers : any;
    getpricingdata = '/getpricingdata';
    getsubscriptionsurl = '/getsubscriptions';
    getclientsurl = '/getclients';
    getsettingsurl = "/admingetsettings";
    updatesettingsurl = '/adminupdatesettings';
    dashboardcardataurl = '/dashboardcartdata';
    dashboardsubscriberdataurl = '/dashboardsubscriberscartdata';
    dashboardfleetdataurl = '/dashboardfleetdata';
    dashboardlinecharturl = '/dashboardlinechartdata';
    addacarrierfromadminurl = '/addacarrierfromadmin';
    updateclientinadminurl = '/updateclientinadmin';
    convertclientintosuburl = '/convertclientintosub';
    getsingleclientdeturl = '/getsingleclientdet';
    updategridcolumnsforclientsscreenurl = '/updategridcolumnsforclientsscreen';
    getgridcolumnsforclientsscreenurl = '/getgridcolumnsforclientsscreen';

    getToken() {
        if (sessionStorage.getItem('trs_user_info')) {
          let currentUser = JSON.parse(sessionStorage.getItem('trs_user_info'));
          return currentUser.token;
        } else {
          return " ";
        }
      }
      constructor( public http: Http ) { }
      
//API'pricing screen
      getPricingData(filter): Promise<any> {
        this.headers = new Headers({
          'Content-Type' : 'application/json',
          'Accept' : 'application/json',
          'Authorization' : 'Bearer ' + this.getToken()
        });
        return this.http.post(this.getpricingdata, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise)
      }

      getAllSubscriptions(filter): Promise<any> {
        this.headers = new Headers({
          'Content-Type' : 'application/json',
          'Accept' : 'application/json',
          'Authorization' : 'Bearer ' + this.getToken()
        });
        return this.http.post(this.getsubscriptionsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise)
      }

      getAllClients(filter): Promise<any> {
        this.headers = new Headers({
          'Content-Type' : 'application/json',
          'Accept' : 'application/json',
          'Authorization' : 'Bearer ' + this.getToken()
        });
        return this.http.post(this.getclientsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise)
      }
//APIS for settings
      getSettings(filter) : Promise <any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.post(this.getsettingsurl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }
      
      updateSettings(Obj) : Promise<any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.put(this.updatesettingsurl ,JSON.stringify(Obj), {headers:this.headers, withCredentials:true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }

//Dashboard api's:-
     getDashboardCardData(filter) : Promise <any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.post(this.dashboardcardataurl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }
      getDashboardSubscribersData(filter) : Promise <any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.post(this.dashboardsubscriberdataurl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }
     getDashboardFleetsData(filter) : Promise <any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.post(this.dashboardfleetdataurl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }

      getDashboardLineData(filter) : Promise <any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.post(this.dashboardlinecharturl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }

      addNewCarrierFromAdmin(filter) : Promise <any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.post(this.addacarrierfromadminurl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }

      updateClientInAdmin(Obj) : Promise<any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.put(this.updateclientinadminurl ,JSON.stringify(Obj), {headers:this.headers, withCredentials:true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }

      convertClientIntoSubscriber(Obj) : Promise<any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.put(this.convertclientintosuburl ,JSON.stringify(Obj), {headers:this.headers, withCredentials:true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }

      getSingleClientDetailsForPayment(filter) : Promise <any> {
        this.headers = new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.getToken()
        });
        return this.http.post(this.getsingleclientdeturl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise);
      }

      updateGridColumnsForClientsScreen(filter): Promise<any> {
        this.headers = new Headers({
          'Content-Type' : 'application/json',
          'Accept' : 'application/json',
          'Authorization' : 'Bearer ' + this.getToken()
        });
        return this.http.post(this.updategridcolumnsforclientsscreenurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise)
      }

      getGridColumnsForClientsScreen(filter): Promise<any> {
        this.headers = new Headers({
          'Content-Type' : 'application/json',
          'Accept' : 'application/json',
          'Authorization' : 'Bearer ' + this.getToken()
        });
        return this.http.post(this.getgridcolumnsforclientsscreenurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
        .then(this.extractData)
        .catch(this.handleErrorPromise)
      }


      private extractData(res :Response) { 
        let body = res.json();
        return body || {};
      }
      
      private handleErrorPromise(error : Response | any) {
        return Promise.reject(error.message ||error );
      }
}