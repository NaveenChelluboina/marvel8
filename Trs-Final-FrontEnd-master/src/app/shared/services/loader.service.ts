import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
@Injectable()

export class LoaderService {
    private loaderState = new Subject<any>();
    message$: Observable<any> = this.loaderState.asObservable();

    showLoader() {
           this.loaderState.next(true);
    }
    
    hideLoader() {
        this.loaderState.next(false);
    }
    
}
