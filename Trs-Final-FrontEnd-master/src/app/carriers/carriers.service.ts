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
export class CarriersService {
  
  public headers : any;
  getrolesurl = '/getroles';
  getrolesdropdownurl = '/getrolesdropdown';
  getrolepermissionsurl = '/getrolepermissions/';
  updateuserpermissionurl = '/updateuserpermissions';
  addroleurl = '/addroles';
  updateroleurl = '/updaterole';
  getassettypesurl = '/getassettypes';
  updateassettypesurl = '/updateassettypes';
  addassettypeurl = '/addassettype';
  getassetmakesurl = '/getassetmakes';
  updateassetmakesurl = '/updateassetmakes';
  addassetmakeurl = '/addassetmake';
  adduserurl = "/adduser";
  getallusersurl = '/getallusers';
  updateuserurl = '/updateuser';
  getsettingsurl = "/getsettings";
  updatesettingsurl = '/updatesettings';
  getstatesdropdownurl = '/getstatesdropdown';
  addcorpinfourl = '/addcorpinfo';
  adddriverurl = '/adddriver';
  getdriversurl = '/getdrivers';
  updatedriverurl = '/updatedriver';
  addnewdriverdocxurl = '/addnewdriverdocx';
  getcorporateinfourl = '/getcorporateinfo';
  updatecorporateinfourl = '/updatecorporateinfo'
  addfleeturl = '/addfleet'
  getfleeturl = '/getfleet'
  updatefleeturl = '/updatefleet'
  getassettypedropdownurl = '/getsssettypedropdown'
  getmakesdropdownurl = '/getassetmakesdropdown'
  addassetsurl = '/addassets'
  getassetsurl = '/getassets'
  addassetdocurl = '/addnewassets'
  updateassetsurl = '/updateassets'
  updatedocumentsurl = '/updatedocuments'
  updatedriverdocumentsurl = '/updatedriverdocuments'
  deletecoroperatedocurl = '/deletecoroperatedoc'
  getfleetdropdownurl = '/getfleetdropdown'
  addnewdriverdocumentsurl = '/addnewdriverdocuments'
  // updatecorporateinfourl = '/updatecorporateinfo';
  // addfleeturl = '/addfleet';
  // getfleeturl = '/getfleet';
  // updatefleeturl = '/updatefleet';
  updatedriverdocumenturl = '/updatedriverdocument';
  getalldriversurl = '/getalldrivers';
  addbulkdriversurl = '/addbulkdrivers';
  getallassetsurl = '/getallassets';
  getstatesforcanadaandusaurl = '/getstatesforcanadaandusa';
  updatecorporatedocumentinfourl = '/updatecorporatedocumentinfo';
  getallassettypesurl = '/getallassettypes';
  getallassetmakesurl = '/getallassetmakes';
  getallfleetsurl = '/getallfleets';
  addbulkassetsurl = '/addbulkassets';
  addyearinirsurl = '/addyearinirs';
  getallirsurl = '/getallirs';
  adddocumentsinirsforassetsurl = '/adddocumentsinirsforassets';
  getassetsdropdownurl = '/getassetsdropdown';
  getassetswithdocumentsdropdownurl = '/getassetswithdocumentsdropdown';
  updateassetdocumentstatusurl = '/updateassetdocumentstatus';
  getdocumentsforassetpageurl = '/getdocumentsforassetpage';
  updatedocumentinirsurl = '/updatedocumentinirs';
  addirpweightgroupurl = '/addirpweightgroup';
  addirpyearurl = '/addirpyear';
  getirpyeardropdownurl = '/getirpyeardropdown';
  addirpdocumenturl = '/addirpdocument';
  getirpurl = '/getirp';
  deleterecordurl = '/deleterecord';
  deleteirsyearurl = '/deleteyearinirs';
  updatecalendarinirsurl = '/updatecalendarinirs';
  getselectedstatedropdownurl = '/getselectedstatesdropdown'
  addiftayearurl = '/addiftayear'
  getiftayearurl = '/getiftayear'
  updateiftayearurl = '/updateiftayear'
  deleteiftayeardocurl = '/deleteiftayeardoc'
  addiftaassetsurl = '/addiftaassets'
  getiftaassetsurl = '/getiftaassets'
  updateiftaassetsurl = '/updateiftaassets'
  addbulkiftaassetsurl = '/addbulkiftaassets'
  changepasswordurl = "/changepassword";
  getcorporateinfoinhomeurl = '/getcorporateinfoinhome';
  getdriverdocsinhomeurl = '/getdriverdocsinhome';
  updateiftadocurl = '/updateiftayeardoc';
  updategridcolumnsindriverurl = '/updategridcolumnsindriver';
  getgridcolumnsindriverurl = '/getgridcolumnsindriver';
  updategridcolumnsinasseturl = '/updategridcolumnsinasset';
  getgridcolumnsinasseturl = '/getgridcolumnsinasset';
  getalliftaassetsurl = '/getalliftaassets';
  drivercommentsurl = '/updatedrivercomments';
  assetcommentsurl = '/updateassetcomments';
  getpackageamounturl = '/getpackageamount';
  makepaymentforpackageurl = '/makepayment';
  deleteasseturl = '/deleteasset';
  getmaxassetsurl = '/getmaxassets';
  getsinglesubscriptionurl = '/getsinglesubscription';
  getupgradingpackagesurl = '/getupgradingpackages';
  upgradeaplanurl = '/upgradeaplan';
  updatealertstatusurl = '/updatealertstatus';
  unsubscribepackageurl = '/unsubscribepackage';
  checkurlstatusofcarrier = '/checkurlstatusofcarrier';
  makepaymentforpackageforclienturl = '/makepaymentforpackageforclient';
  getdocssharehistoryurl = '/getdocssharehistory';
  getassethistoryurl = '/getassethistory';
  senddriverpasswordlinkurl = '/senddriverpasswordlink';
  downgradeplanurl = '/downgradeplan';

  getToken() {
    if (sessionStorage.getItem('trs_user_info')) {
      let currentUser = JSON.parse(sessionStorage.getItem('trs_user_info'));
      return currentUser.token;
    } else {
      return " ";
    }
  }
  
  constructor( public http: Http ) { }

  changePassword(item): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.put(this.changepasswordurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  getDriverDocsShareHistory(item): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getdocssharehistoryurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  getAssetHistory(item): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getassethistoryurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  sendDriverPasswordLink(Obj) : Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.put(this.senddriverpasswordlinkurl ,JSON.stringify(Obj), {headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  urlStatusCheck(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
    return this.http.post(this.checkurlstatusofcarrier, JSON.stringify(filter), { headers: this.headers }).toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }
  
  getRoles(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getrolesurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getRolePermissions(roleId): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.get(this.getrolepermissionsurl+roleId, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  updateUserPermissions(finalObj) : Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.post(this.updateuserpermissionurl ,JSON.stringify(finalObj), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  addRole(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addroleurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  updateRole(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.put(this.updateroleurl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getAssetTypes(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getassettypesurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getAssetTypesdropdown(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getassettypedropdownurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  updateAssetType(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.put(this.updateassettypesurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addAssetType(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addassettypeurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getAssetMakes(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getassetmakesurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getCorporateInformationInHome(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getcorporateinfoinhomeurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getAssetMakesdropdown(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getmakesdropdownurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getSelectedStateDropDown(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getselectedstatedropdownurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  updateAssetMake(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.put(this.updateassetmakesurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addAssetMake(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addassetmakeurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  addUser(item) : Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.post(this.adduserurl, JSON.stringify(item), {headers:this.headers, withCredentials:true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getRolesDropdown(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getrolesdropdownurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getAllUsers(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getallusersurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  updateUser(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.put(this.updateuserurl, JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
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
  
  getStatedDropdown(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getstatesdropdownurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getStatedForCanadaAndUsa(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getstatesforcanadaandusaurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  addCorporateInfo(filter): Promise<any> {
    this.headers = new Headers({
      // 'Content-Type' : 'application/json',
      // 'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addcorpinfourl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  updateCorporateDocumentInfo(filter): Promise<any> {
    this.headers = new Headers({
      // 'Content-Type' : 'application/json',
      // 'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.updatecorporatedocumentinfourl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addDriver(filter): Promise<any> {
    this.headers = new Headers({
      // 'Content-Type' : 'application/json',
      // 'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.adddriverurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getDrivers(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getdriversurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getAllDrivers(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getalldriversurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getAllAssets(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getallassetsurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  updateDriver(filter): Promise<any> {
    this.headers = new Headers({
      // 'Content-Type' : 'application/json',
      // 'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.updatedriverurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }

  updateDriverComments(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.drivercommentsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }

  updateDriverDocuments(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.updatedriverdocumentsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addNewDriverDocx(filter): Promise<any> {
    this.headers = new Headers({
      // 'Content-Type' : 'application/json',
      // 'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addnewdriverdocxurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addNewDriverDocuments(filter): Promise<any> {
    this.headers = new Headers({
      // 'Content-Type' : 'application/json',
      // 'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addnewdriverdocumentsurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getAllAssetTypes(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getallassettypesurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getCorporateInformation(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getcorporateinfourl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  updateCorporateInfo(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.put(this.updatecorporateinfourl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  deleteCoroperateDoc(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.deletecoroperatedocurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addFleet(Obj): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addfleeturl, JSON.stringify(Obj), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getFleet(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.getfleeturl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  getAllAssetMakes(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.getallassetmakesurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getAllFleet(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.getallfleetsurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getFleetDropDown(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.getfleetdropdownurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  updateFleet(item): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken()
    });
    return this.http.post(this.updatefleeturl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  
  
  addAssets(filter): Promise<any> {
    this.headers = new Headers({
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addassetsurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addNewAssetsDocx(filter): Promise<any> {
    this.headers = new Headers({
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addassetdocurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getAssets(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getassetsurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }
  updateAssetComments(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.assetcommentsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  updateAssets(filter): Promise<any> {
    this.headers = new Headers({
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.updateassetsurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  updateDocuments(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.updatedocumentsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  addBulkDrivers(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addbulkdriversurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  addBulkAssets(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addbulkassetsurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  addYearInIrs(filter) : Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.addyearinirsurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getAllIRS(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.getallirsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }
  
  getAssetsDropDown(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.getassetsdropdownurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  addDocumentsInIrsForAssets(filter): Promise<any> {
    this.headers = new Headers({
      // 'Content-Type' : 'application/json',
      // 'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.post(this.adddocumentsinirsforassetsurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }

  getAssetsWithDocuments(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.getassetswithdocumentsdropdownurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  updateAssetDocumentStatus(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.updateassetdocumentstatusurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  getDocumentsForUpdatePage(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.getToken(),
    });
    return this.http.post(this.getdocumentsforassetpageurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

  updateDocumentInIrs(filter): Promise<any> {
    this.headers = new Headers({
      'Content-Type' : 'application/json',
      'Accept' : 'application/json',
      'Authorization' : 'Bearer ' + this.getToken()
    });
    return this.http.put(this.updatedocumentinirsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise)
  }

  //IRP API's 
addIrpWeightGroup(Obj): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.addirpweightgroupurl, JSON.stringify(Obj), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

addIrpYear(Obj): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.addirpyearurl, JSON.stringify(Obj), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

getIrpYearDropDown(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken(),
  });
  return this.http.post(this.getirpyeardropdownurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

addIrpDocument(filter): Promise<any> {
  this.headers = new Headers({
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.addirpdocumenturl, filter, {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

getIrp(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken(),
  });
  return this.http.post(this.getirpurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

deleteRecord(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.deleterecordurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

deleteIrsYearRecord(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.put(this.deleteirsyearurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

updateCalendarInIrs(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.put(this.updatecalendarinirsurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

//IFTA Api's
addIftaYear(filter): Promise<any> {
  this.headers = new Headers({
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.addiftayearurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

updateIftaYearDoc(filter): Promise<any> {
  this.headers = new Headers({
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.updateiftadocurl, filter, {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}
getIftaYear(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken(),
  });
  return this.http.post(this.getiftayearurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

updateIftaYear(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.updateiftayearurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

delteIftaYearDoc(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.deleteiftayeardocurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

addIftaAssets(Obj): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.addiftaassetsurl, JSON.stringify(Obj), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}
updateIftaAssets(Obj): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.updateiftaassetsurl, JSON.stringify(Obj), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}
getIftaAssets(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken(),
  });
  return this.http.post(this.getiftaassetsurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

getAllIftaAssets(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken(),
  });
  return this.http.post(this.getalliftaassetsurl, JSON.stringify(filter), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

addBulkIftaAssets(filter) : Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.addbulkiftaassetsurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

getDriverDocumentsInHome(filter) : Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.getdriverdocsinhomeurl,JSON.stringify(filter),{headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

updateGridColumnsInDrivers(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.put(this.updategridcolumnsindriverurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

getGridColumnsForDrivers(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.getgridcolumnsindriverurl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

updateGridColumnsInAssets(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.put(this.updategridcolumnsinasseturl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

getGridColumnsForAssets(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.getgridcolumnsinasseturl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

getPackageAmount(finalObj) : Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.getpackageamounturl ,JSON.stringify(finalObj), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

makePaymentForPackage(finalObj) : Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.makepaymentforpackageurl ,JSON.stringify(finalObj), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

makePaymentForPackageForClient(finalObj) : Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.post(this.makepaymentforpackageforclienturl ,JSON.stringify(finalObj), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

deleteAssetInAssets(item): Promise<any> {
  this.headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + this.getToken()
  });
  return this.http.put(this.deleteasseturl, JSON.stringify(item), { headers: this.headers, withCredentials: true }).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise);
}

getMaxAssetSize(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.getmaxassetsurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

getCarrierSubscription(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.getsinglesubscriptionurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

getUpgradingPackages(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.getupgradingpackagesurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

upgradeAPlan(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.upgradeaplanurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

downgradePlan(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.downgradeplanurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

updateAlertStatus(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.put(this.updatealertstatusurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
  .then(this.extractData)
  .catch(this.handleErrorPromise)
}

unsubscribePackage(filter): Promise<any> {
  this.headers = new Headers({
    'Content-Type' : 'application/json',
    'Accept' : 'application/json',
    'Authorization' : 'Bearer ' + this.getToken()
  });
  return this.http.post(this.unsubscribepackageurl, JSON.stringify(filter), {headers:this.headers, withCredentials: true}).toPromise()
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
