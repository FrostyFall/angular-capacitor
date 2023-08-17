import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { loggingInterceptor } from './shared/interceptors/logging.interceptor';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor])),
    provideRouter(routes),
    importProvidersFrom(SocketIoModule.forRoot(config)),
  ],
};
