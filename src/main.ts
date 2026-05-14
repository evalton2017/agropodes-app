import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import {ApplicationConfig} from '@angular/core';
import {provideNgxMask} from 'ngx-mask';

const serverConfig: ApplicationConfig = {
  providers: [
    provideNgxMask()
  ]
};

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
