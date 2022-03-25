import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Menu } from './menu.model';
//import { verticalMenuItems, horizontalMenuItems } from './menu';

@Injectable()
export class MenuService {

  verticalMenuItems: any;
  horizontalMenuItems: any;
  userType: any;
  constructor(private location: Location, private router: Router) {

    let permissions = [];
    let showMainMenus = { "admin": true };
    if (!localStorage.getItem('shadowlogin')) {
      this.userType = localStorage.getItem('userType');
      if (localStorage.getItem('trs_user_info')) {
        let temp = JSON.parse(localStorage.getItem('trs_user_info')).user_permissions;
        // if(temp[1]['permission_type'].split('')[1] === '0' && temp[0]['permission_type'].split('')[1] === '0') 
        //     showMainMenus['analytics'] = false;
        // if(temp[2]['permission_type'].split('')[1] === '0' && temp[3]['permission_type'].split('')[1] === '0' && temp[6]['permission_type'].split('')[1] === '0' && temp[7]['permission_type'].split('')[1] === '0') 
        //     showMainMenus['marketing'] = false;
        // if(temp[5]['permission_type'].split('')[1] === '0' && temp[4]['permission_type'].split('')[1] === '0') 
        //     showMainMenus['sales'] = false;
        if (temp[8]['permission_type'].split('')[1] === '0' && temp[9]['permission_type'].split('')[1] === '0' && temp[10]['permission_type'].split('')[1] === '0' && temp[11]['permission_type'].split('')[1] === '0' && temp[12]['permission_type'].split('')[1] === '0')
          showMainMenus['admin'] = false;
        for (let i = 0; i < temp.length; i++) {
          permissions[i] = temp[i]['permission_type'].split('')[1] != '0' ? true : false;
        }
      }
    } else {
      this.userType = sessionStorage.getItem('userType');
      if (sessionStorage.getItem('trs_user_info')) {
        let temp = JSON.parse(sessionStorage.getItem('trs_user_info')).user_permissions;
        // if(temp[1]['permission_type'].split('')[1] === '0' && temp[0]['permission_type'].split('')[1] === '0') 
        //     showMainMenus['analytics'] = false;
        // if(temp[2]['permission_type'].split('')[1] === '0' && temp[3]['permission_type'].split('')[1] === '0' && temp[6]['permission_type'].split('')[1] === '0' && temp[7]['permission_type'].split('')[1] === '0') 
        //     showMainMenus['marketing'] = false;
        // if(temp[5]['permission_type'].split('')[1] === '0' && temp[4]['permission_type'].split('')[1] === '0') 
        //     showMainMenus['sales'] = false;
        if (temp[8]['permission_type'].split('')[1] === '0' && temp[9]['permission_type'].split('')[1] === '0' && temp[10]['permission_type'].split('')[1] === '0' && temp[11]['permission_type'].split('')[1] === '0' && temp[12]['permission_type'].split('')[1] === '0')
          showMainMenus['admin'] = false;
        for (let i = 0; i < temp.length; i++) {
          permissions[i] = temp[i]['permission_type'].split('')[1] != '0' ? true : false;
        }
      }
    }



    let temp = [];
    if (this.userType == 'admin') {
      temp.push(
        new Menu(1, 'Dashboard', '/transreport/dashboard', null, 'assessment', null, true, 0, "white", permissions[13]),
        new Menu(2, 'Clients', '/transreport/carrier/carrier-listing', null, 'business', null, true, 0, "white", permissions[14]),
        new Menu(3, 'Pricing', '/transreport/carrier/package', null, 'attach_money', null, true, 0, "white", permissions[15]),
        new Menu(4, 'Subscriptions', '/transreport/carrier/subscriptions', null, 'repeat', null, false, 0, "white", permissions[16]),
        new Menu(5, 'Settings', '/transreport/carrier/settings', null, 'settings_applications', null, false, 0, "white", permissions[17]),
        new Menu(13, 'Asset-Types', '/transreport/carriers/admin/assettypes', null, 'local_shipping', null, false, 0, "white", permissions[11]),
        new Menu(14, 'Asset-Make', '/transreport/carriers/admin/assetmake', null, 'perm_data_setting', null, false, 0, "white", permissions[12]),
      );
    } else if (this.userType == 'carrier') {
      temp.push(
        new Menu(1, 'Home', '/transreport/carriers/home', null, 'home', null, false, 0, "white", permissions[0]),
        new Menu(2, 'Corporate', '/transreport/carriers/corporate', null, 'business', null, false, 0, "white", permissions[1]),
        new Menu(3, 'Drivers', '/transreport/carriers/driver', null, 'supervised_user_circle', null, false, 0, "white", permissions[2]),
        new Menu(4, 'Fleet', '/transreport/carriers/fleet', null, 'group_work', null, false, 0, "white", permissions[3]),
        new Menu(5, 'Assets', '/transreport/carriers/asset', null, 'directions_bus', null, false, 0, "white", permissions[4]),
        new Menu(6, 'IRP', '/transreport/carriers/irp', null, 'collections_bookmark', null, false, 0, "white", permissions[5]),
        new Menu(7, 'IFTA', '/transreport/carriers/ifta', null, 'description', null, false, 0, "white", permissions[6]),
        new Menu(8, 'IRS (HVUT)', '/transreport/carriers/irs', null, 'library_books', null, false, 0, "white", permissions[7]),
        new Menu(9, 'Admin', '/transreport/carriers/admin', null, 'person', null, true, 0, "white", showMainMenus['admin']),
        new Menu(10, 'Settings', '/transreport/carriers/admin/settings', null, 'settings_applications', null, false, 9, "white", permissions[8]),
        new Menu(11, 'Users', '/transreport/carriers/admin/users', null, 'group_add', null, false, 9, "white", permissions[9]),
        new Menu(12, 'Roles & Permissions', '/transreport/carriers/admin/roles', null, 'people', null, false, 9, "white", permissions[10]),
        new Menu(15, 'History', '/transreport/carriers/admin/document-history', null, 'history', null, false, 9, "white", permissions[19]),
        // new Menu(13, 'Asset-Types', '/transreport/carriers/admin/assettypes', null, 'local_shipping', null, false, 9, "white", permissions[11]),
        // new Menu(14, 'Asset-Make', '/transreport/carriers/admin/assetmake', null, 'perm_data_setting', null, false, 9, "white", permissions[12]),
        //new Menu(12, 'Permissions', '/transreport/carriers/permissions', null, 'group_add', null, false, 9, "white", true),
        //new Menu(12, 'Permissions', '/transreport/carriers/permissions', null, 'fingerprint', null, false, 5, "white")
      );
    }

    this.verticalMenuItems = temp;
    this.horizontalMenuItems = temp;
  }

  public getVerticalMenuItems(): Array<Menu> {
    return this.verticalMenuItems;
  }

  public getHorizontalMenuItems(): Array<Menu> {
    return this.horizontalMenuItems;
  }

  public expandActiveSubMenu(menu: Array<Menu>) {
    let url = this.location.path();
    let routerLink = url; // url.substring(1, url.length);
    let activeMenuItem = menu.filter(item => item.routerLink === routerLink);
    if (activeMenuItem[0]) {
      let menuItem = activeMenuItem[0];
      while (menuItem.parentId != 0) {
        let parentMenuItem = menu.filter(item => item.id == menuItem.parentId)[0];
        menuItem = parentMenuItem;
        this.toggleMenuItem(menuItem.id);
      }
    }
  }

  public toggleMenuItem(menuId) {
    let menuItem = document.getElementById('menu-item-' + menuId);
    let subMenu = document.getElementById('sub-menu-' + menuId);
    if (subMenu) {
      if (subMenu.classList.contains('show')) {
        subMenu.classList.remove('show');
        menuItem.classList.remove('expanded');
      }
      else {
        subMenu.classList.add('show');
        menuItem.classList.add('expanded');
      }
    }
  }

  public closeOtherSubMenus(menu: Array<Menu>, menuId) {
    let currentMenuItem = menu.filter(item => item.id == menuId)[0];
    if (currentMenuItem.parentId == 0 && !currentMenuItem.target) {
      menu.forEach(item => {
        if (item.id != menuId) {
          let subMenu = document.getElementById('sub-menu-' + item.id);
          let menuItem = document.getElementById('menu-item-' + item.id);
          if (subMenu) {
            if (subMenu.classList.contains('show')) {
              subMenu.classList.remove('show');
              menuItem.classList.remove('expanded');
            }
          }
        }
      });
    }
  }


}
