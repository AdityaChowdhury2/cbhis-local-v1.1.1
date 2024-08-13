import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import * as storage from '../utils/storage';
import { ToastService } from 'src/app/shared/services/toast.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private toatr: ToastService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const idToken = 'Jl7Fl8Ee64w=';

    if (idToken) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', 'bearer ' + idToken),
      });

      return next.handle(cloned);
    } else {
      return next.handle(request);
    }
  }
}
