import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { defineCustomElements as pwaElements } from '@ionic/pwa-elements/loader';
import { IonicStorageModule } from '@ionic/storage-angular';

import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DbStorageService } from './shared/services/database/db-storage.service';
import { DbnameVersionService } from './shared/services/database/dbname-version.service';
import { InitializeAppService } from './shared/services/database/initialize.app.service';
import { SQLiteService } from './shared/services/database/sqlite.service';
import { SharedModule } from './shared/shared.module';

// Above only required if you want to use a web platform <--
export function initializeFactory(init: InitializeAppService) {
  return () => init.initializeApp();
}

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
// }
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md',
    }),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: HttpLoaderFactory,
    //     deps: [HttpClient],
    //   },
    // }),
  ],
  providers: [
    SQLiteService,
    InitializeAppService,
    DbStorageService,
    DbnameVersionService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFactory,
      deps: [InitializeAppService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  platform: string = '';

  constructor() {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      // Web platform
      // required for toast component in Browser
      pwaElements(window);

      // required for jeep-sqlite Stencil component
      // to use a SQLite database in Browser
      jeepSqlite(window);

      window.addEventListener('DOMContentLoaded', async () => {
        const jeepEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepEl);
        await customElements.whenDefined('jeep-sqlite');
        jeepEl.autoSave = true;
      });
    }
  }
}
