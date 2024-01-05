import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  return authService.user.pipe(
    take(1),
    exhaustMap((user) => {
      if (!user || !user.token) {
        return next(req);
      }
      const newReq = req.clone({
        setHeaders: { Authorization: `Bearer ${user.token}` },
      });
      return next(newReq);
    })
  );
};
