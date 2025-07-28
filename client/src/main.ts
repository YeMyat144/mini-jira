import { bootstrapApplication } from '@angular/platform-browser';
import { LayoutComponent } from './app/layout.component';
import { appConfig } from './app/app.config';

bootstrapApplication(LayoutComponent, {
  providers: appConfig,
}).catch(err => console.error(err));
