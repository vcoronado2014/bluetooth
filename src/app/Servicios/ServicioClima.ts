import { Injectable, Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AppSettings } from '../AppSettings';
import { Observable } from 'rxjs/Observable';

import { NavParams, Platform } from 'ionic-angular';
//import { NativeGeocoder } from '@ionic-native/native-geocoder';

import 'rxjs/add/operator/map';
import { environment } from '../../environments/environments'

@Injectable()
export class ServicioClima {
    current;
    icon;
    climaActual;
    location;
    lat;
    long;
    daily;

    constructor(private http: Http,
        private platform: Platform,
        public navParams: NavParams) {


    }
    getCurrentForecast(lat, lon) {

        let location = lat + "," + lon;
        let urlClima = environment.PROXY_CLIMA_URL + environment.CLIMA_URL + location + '?lang=es&units=ca';


        return this.http.get(urlClima, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        })
            .map(res => {
                this.current = res.json().currently;
                this.current.temperature = parseInt(this.current.temperature);
                var humedad = this.current.humidity * 100; 
                this.current.humidity = parseInt(humedad.toString());
                this.current.visibility = parseInt(this.current.visibility);
                var prec = this.current.precipProbability * 100;
                this.current.precipProbability = parseInt(prec.toString());
                this.current.daily = res.json().daily;
                return this.current;

            });

    }
}