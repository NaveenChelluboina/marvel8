import { Injectable } from '@angular/core';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';

@Injectable()
export class AlertService {

private toasterService: ToasterService;

constructor(toasterService: ToasterService) {
this.toasterService = toasterService;
}

createAlert(msg: string, type: number): void {
if (type == 1) {
this.toasterService.pop('success', msg, '');
} else if (type == 0) {
this.toasterService.pop('error', msg, '');
}
}
}