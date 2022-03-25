import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { TrsGuard } from './sales.guard';
import { LayoutComponent } from './layout/layout.component';
import { CarrierResolverService } from './carriers/carrier-resolver.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PaymentPageComponent } from './carriers/carrier-admin/payment-page/payment-page.component';

export const routes: Routes = [
    {
        path: 'transreport',
        component: LayoutComponent, children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent, data: { breadcrumb: 'Dashboard',  permissionId:13 }, canActivate:[TrsGuard],resolve:{carriesresolver : CarrierResolverService} },
            { path: 'carrier', loadChildren: './carrier/carrier.module#CarrierModule', data: { breadcrumb: 'Carriers' } },
            { path: 'carriers', loadChildren: './carriers/carriers.module#CarriersModule', data: { breadcrumb: 'Carriers' } },
        ]
    },
    { path: '', loadChildren: './logins/logins.module#LoginsModule', data: { breadcrumb: 'Login' } },
    { path: 'paymentpage/:packageId', component: PaymentPageComponent, data: { breadcrumb: 'Login' } },
    { path: '**', component: NotFoundComponent, data: { breadcrumb: 'Not found' } }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,  // <- comment this line for activate lazy load
    // useHash: true
});