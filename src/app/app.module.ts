import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
  //import { Http } from '@angular/http';
  import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
//gauges
import { GaugesModule } from 'ng-canvas-gauges/lib';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { BluetoothPage } from './../pages/bluetooth/bluetooth';
//nuevas paginas
import { SeleccionSkinPage } from './../pages/seleccion-skin/seleccion-skin';
import { SkinDigitalUnoPage } from './../pages/skin-digital-uno/skin-digital-uno';
import { SkinDigitalDosPage } from './../pages/skin-digital-dos/skin-digital-dos';
//nuevo servicio
import { ComunicacionService } from '../app/Servicios/ComunicacionService';
//weather
//import { OpenWeatherMapModule, OpenWeatherMap } from 'ionic-openweathermap';
//import { OpenWeatherMapProvider } from 'ionic-openweathermap/dist/src/providers/openweathermap-provider';

@NgModule({
  declarations: [
    MyApp,
    SeleccionSkinPage,
    BluetoothPage,
    SkinDigitalUnoPage,
    SkinDigitalDosPage
  ],
  imports: [
    BrowserModule,
    GaugesModule,
    //OpenWeatherMapModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      preloadModules: true
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SeleccionSkinPage,
    BluetoothPage,
    SkinDigitalUnoPage,
    SkinDigitalDosPage
  ],
  providers: [
    BluetoothSerial,
    BluetoothPage,
    StatusBar,
    SplashScreen,
    ComunicacionService,
    Geolocation,
    //OpenWeatherMapProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
