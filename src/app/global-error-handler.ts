import {ErrorHandler, Injectable, Injector} from "@angular/core";
import {ToastController} from "@ionic/angular";
import {HttpErrorResponse} from "@angular/common/http";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    toastController = this.injector.get(ToastController);

    constructor(private injector: Injector) {
    }

    async handleError(error: Error | HttpErrorResponse | any) {
        if (error.promise && error.rejection) {
            // When errors in promises are thrown, zone.js wraps them and we need to unwrap them here.
            error = error.rejection;
        }

        const message = error.error?.message ?? error.message ?? error.status ?? 'Unknown error 😞';

        this.toastController.create({
            message,
            duration: 2000,
            color: 'danger',
            cssClass: 'toast'
        }).then(toast => toast.present());

        console.error(error); // TODO rethrow?
    }

}
