import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Headers } from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class LocationAPIService {
    headers = new HttpHeaders({
        'Content-Type': 'application/json'
    });
    constructor(public http: HttpClient) { }
    public BATTUTA_KEY : String = "4af155a1ae240a5f76c69d2bc2e3bc6d";

    getCountryList() {
        var getCountryListURL = "https://battuta.medunes.net/api/country/all/?key="+this.BATTUTA_KEY+"&callback=?";
        return this.http.jsonp<any>(getCountryListURL,'callback');
    }

    getStatesList(country : String) {
        var getStatesListURL = "https://battuta.medunes.net/api/region/" +country+"/all/?key="+this.BATTUTA_KEY+"&callback=?";
        return this.http.jsonp(getStatesListURL,'callback');
    }

    getCitysList(country : String, state : String) {
        var getCitysListURL = "https://battuta.medunes.net/api/city/"+country+"/search/?region="+state+"&key="+this.BATTUTA_KEY+"&callback=?";
        return this.http.jsonp(getCitysListURL,'callback');
    }
} 