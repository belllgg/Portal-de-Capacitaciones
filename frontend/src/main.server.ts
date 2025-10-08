// src/main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Debe ser una función exportada nombrada, no default
export function bootstrap() {
  return bootstrapApplication(AppComponent, config);
}
