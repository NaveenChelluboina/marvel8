import { Component } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, UrlSegment, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {

    public pageTitle: string;
    public moduleTitle: string;
    public subTitle: string = 'test';
    public description: {};
    public breadcrumbs: {
        name: string;
        url: string
    }[] = [];

    public settings: Settings;
    constructor(public appSettings: AppSettings,
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public title: Title) {
        this.settings = this.appSettings.settings;
        this.description = {
            'Subscription': 'Subscription details can be managed  from here.',
            'Clients': ' All the client details can be listed and managed from this screen.',
            'Pricing': 'All the subscription pricing details for fleet can be listed and managed from this screen.',
            'Driver Information': 'This section contains a listing of active and inactive drivers.',
            'Fleet Information': 'The Fleet Information can be managed from here.',
            'Asset Information': 'This section contains a database of your active and inactive vehicles and trailers (assets).',
            'IRP Information': 'This screen contains information and documentation relevant to enrollment in the International Registration Plan. Use it to store your IRP cab cards and renewal applications here!',
            'IFTA Information': 'This section contains an electronic copy of your current and previous years IFTA license as well as decal assignment listing. The license and decal valid from Jan 1st to Dec 31st each year',
            'IRS (HVUT) Information': 'This area contains Form 2290 Heavy Vehicle Use Tax Returns and IRS Equipment Schedules for highway motor vehicles that have a taxable gross weight of 55,000 pounds or more. The tax year is July 1st to June 30th each year.',
            'Corporate Information': 'This section contains all corporate-level Information Including account numbers and a document repository of licence, permits and authorities.',
            'Subscriptions': 'All the subscriptions for clients and be managed from this screen.',
            'Settings': 'Here the default settings can be managed for the whole of the application.',
            "Users":"This page is used to manage users",
            'Dashboard': 'Interactive insights of the of PermiShare trends can be seen here .',
            "Home": "This is a summary dashboard of the entire organization and alerts for the various documents",
            'Permissions':'This page is used to manage permissions for each role',
            'Upload-Assets':'This page contains all information and documents to submit for vehicles.',
            "Admin": {
                "Users":"This page is used to manage users",
                'Settings': 'Here the default settings can be managed for the whole of the application.',
                "Roles":"All the permissions for various levels of the roles in the application can be assigned and managed from this screen",
                "Asset-Types":"This screen is used to add and manage the asset type viz., vehicles",
                "Asset-Make":"This screen is used to add and manage the Make for which user need  to select the asset type for adding the make",
                "Document History":"This screen provides the view of all the documents that has been shared by drivers via mobile application",
                "Asset History":"This screen provides the overview of assets history which reads the Active and Inactive time of all the assets in the mobile application"
            }
        };
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.breadcrumbs = [];
                this.parseRoute(this.router.routerState.snapshot.root);
                this.pageTitle = '';
                this.breadcrumbs.forEach(breadcrumb => {
                    this.pageTitle += ' | ' + breadcrumb.name;
                })
                this.pageTitle ? null : this.pageTitle = ' | Dashboard';
                var temp = this.pageTitle.split(' | ');
                if (temp.length > 4) {
                    this.subTitle = temp.pop();
                    this.moduleTitle = temp[temp.length - 1];
                } else if (temp.length > 3) {
                    this.subTitle = temp.pop();
                    this.moduleTitle = temp[temp.length - 1];
                } else {
                    this.moduleTitle = temp.pop();
                }
                if (this.subTitle === 'Permissions') {
                    this.moduleTitle = 'Permissions';
                    this.subTitle = 'test';
                }
                this.title.setTitle(this.settings.name + this.pageTitle);
            }
        })
    }

    private parseRoute(node: ActivatedRouteSnapshot) {
        if (node.data['breadcrumb']) {
            if (node.url.length) {
                let urlSegments: UrlSegment[] = [];
                node.pathFromRoot.forEach(routerState => {
                    urlSegments = urlSegments.concat(routerState.url);
                });
                let url = urlSegments.map(urlSegment => {
                    return urlSegment.path;
                }).join('/');
                this.breadcrumbs.push({
                    name: node.data['breadcrumb'],
                    url: '/' + url
                })
            }
        }
        if (node.firstChild) {
            this.parseRoute(node.firstChild);
        }
    }

    public closeSubMenus() {
        let menu = document.querySelector('.sidenav-menu-outer');
        if (menu) {
            for (let i = 0; i < menu.children[0].children.length; i++) {
                let child = menu.children[0].children[i];
                if (child) {
                    if (child.children[0].classList.contains('expanded')) {
                        child.children[0].classList.remove('expanded');
                        child.children[1].classList.remove('show');
                    }
                }
            }
        }
    }
}


