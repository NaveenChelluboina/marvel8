import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrsGuard implements CanActivate {
  constructor(private router : Router) { }
  canActivate(next: ActivatedRouteSnapshot,state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    var userdata = JSON.parse(sessionStorage.getItem('trs_user_info'));
    let permissionId = next.data["permissionId"];
    if(userdata.user_permissions[permissionId].permission_type.split('')[1] != 0)
      return true;
    else 
      return false;

    
      
  }
}
