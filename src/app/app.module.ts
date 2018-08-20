import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
//gauges
import { GaugesModule } from 'ng-canvas-gauges/lib';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BluetoothPage } from './../pages/bluetooth/bluetooth';
//nuevas paginas
import { SeleccionSkinPage } from './../pages/seleccion-skin/seleccion-skin';
import { SkinDigitalUnoPage } from './../pages/skin-digital-uno/skin-digital-uno';
//nuevo servicio
import { ComunicacionService } from '../app/Servicios/ComunicacionService';

@NgModule({
  declarations: [
    MyApp,
    SeleccionSkinPage,
    BluetoothPage,
    SkinDigitalUnoPage
  ],
  imports: [
    BrowserModule,
    GaugesModule,
    IonicModule.forRoot(MyApp, {
      preloadModules: true
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SeleccionSkinPage,
    BluetoothPage,
    SkinDigitalUnoPage
  ],
  providers: [
    BluetoothSerial,
    BluetoothPage,
    StatusBar,
    SplashScreen,
    ComunicacionService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
