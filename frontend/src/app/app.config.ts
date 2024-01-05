import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideToastr({
      closeButton: true,
      positionClass: 'toast-bottom-right',
      progressBar: true,
      timeOut: 4000,
      preventDuplicates: true,
    }),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
