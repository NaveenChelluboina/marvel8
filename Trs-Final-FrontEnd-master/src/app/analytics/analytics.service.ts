import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {

  public headers: any;
  getdashboardcardsdataurl = '/getdashboardcardsdata';
  getdashboardpiedataurl = '/getdashboardpiedata';
  getdashboardlinedataurl = '/getdashboardlinedata';
  getdashboardmapdataurl = '/getdashboardmapdata';
  getanalyticsopportunitiesurl = '/getanalyticsopportunities';
  getanalyticsprospectsurl = '/getanalyticsprospects'

  getToken() {
    if (sessionStorage.getItem('sg_user_info')) {
      let currentUser = JSON.parse(sessionStorage.getItem('sg_user_info'));
      return currentUser.token;
    } else {
      return " ";
    }
  }

  constructor(public http:Http) { }

  getDashboardCardsData(data) {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });

    return this.http.post(this.getdashboardcardsdataurl, JSON.stringify(data),{headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getDashboardPieData(data) {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });

    return this.http.post(this.getdashboardpiedataurl, JSON.stringify(data),{headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getDashboardLineData(data) {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });

    return this.http.post(this.getdashboardlinedataurl, JSON.stringify(data),{headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getDashboardMapData(data) {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });

    return this.http.post(this.getdashboardmapdataurl, JSON.stringify(data),{headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getAnalyticsOpportunities(opportunity) {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });

    return this.http.post(this.getanalyticsopportunitiesurl, JSON.stringify(opportunity),{headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getAnalyticsProspects(prospect) {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });

    return this.http.post(this.getanalyticsprospectsurl, JSON.stringify(prospect),{headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  private extractData(res :Response) { 
    let body = res.json();
    return body || {};
  }

  private handleErrorPromise(error : Response | any) {
    return Promise.reject(error.message ||error );
  }

}
