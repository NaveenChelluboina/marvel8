import { Injectable } from '@angular/core';
import { Request, XHRBackend, BrowserXhr, ResponseOptions, XSRFStrategy, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Router } from "@angular/router";
import { LoaderService } from '../../shared/services/loader.service';
import {MatDialog} from '@angular/material';

@Injectable()
export class AppInterceptorService extends XHRBackend {
  private isLoaderActive: boolean;
  private loader: boolean = false;
  constructor(private router: Router,
    _browserXhr: BrowserXhr,
    private dialogRef: MatDialog,
    _baseResponseOptions: ResponseOptions,
    private loaderService: LoaderService,
    _xsrfStrategy: XSRFStrategy) {
    super(_browserXhr, _baseResponseOptions, _xsrfStrategy);
  }

  createConnection(request: Request) {
    this.isLoaderActive = true;
    this.addLoader();
    var port = 6500;
    let iAdd = window.location.hostname;
    if (request.url.startsWith('/') && iAdd != 'localhost') {
      request.url = 'https://' + window.location.hostname + '/api/v1' + request.url;     // prefix base url
    } else if(request.url.startsWith('/') && iAdd == 'localhost') {
      request.url = 'http://' + window.location.hostname + ':' +port + request.url;     // prefix base url
    }
    let xhrConnection = super.createConnection(request);
    xhrConnection.response = xhrConnection.response.map((res: Response) => {
      this.removeLoader();
      return res;
    }).catch((error: Response) => {
      this.removeLoader();
      if (error.status == 500 || error.status == 401) {
        this.dialogRef.closeAll();
        sessionStorage.removeItem('sg_user_info');
        this.router.navigate(['/login']);
      }
      return Observable.throw(error);
    })
    return xhrConnection;
  }

  public removeLoader() {
    this.loaderService.hideLoader();
    this.loader = false;
    this.isLoaderActive = false;
  }

  public handleSuccess(res) {
    this.removeLoader();
  }
  
  public addLoader() {
    if (!this.loader) {
      if (this.isLoaderActive) {
        this.loaderService.showLoader();
        this.loader = true;
      }
    }
  }
}
