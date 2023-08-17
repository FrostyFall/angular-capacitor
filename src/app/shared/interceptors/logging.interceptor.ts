import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[LOGGING] Request: ', req.headers, req.body);

  return next(req).pipe(tap((res) => console.log('[LOGGING] Response: ', res)));
};
