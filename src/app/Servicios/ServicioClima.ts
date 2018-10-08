import { Injectable, Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { AppSettings } from '../AppSettings';
import { Observable } from 'rxjs/Observable';

import { NavParams, Platform } from 'ionic-angular';
//import { NativeGeocoder } from '@ionic-native/native-geocoder';

import 'rxjs/add/operator/map';

@Injectable()
export class ServicioClima {
    proxy: 'https://cors-anywhere.herokuapp.com/';
    climaUrl: string = 'https://api.darksky.net/forecast/df4a8842bbc6b36a1f5245683a954606/';
    current;
    icon;
    climaActual;
    location;
    lat;
    long;

    constructor(private http: Http,
        private platform: Platform,
        public navParams: NavParams) {


    }
    getCurrentForecast(lat, lon) {

        let location = lat + "," + lon;
        let urlClima = 'https://cors-anywhere.herokuapp.com/' + this.climaUrl + location + '?lang=es&units=ca';


        return this.http.get(urlClima, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        })
            .map(res => {
                this.current = res.json().currently;
                //respuesta
                /*
                https://darksky.net/dev/docs

                */

                return this.current;

            });

    }

    getForecastIcon() {

        this.lat = localStorage.getItem("lat");
        this.long = localStorage.getItem("lng");

        let location = this.lat + "," + this.long;
        let urlClima = this.climaUrl + location;

        return this.http.get(urlClima, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        })
            .map(res => {

                //<i class="{{ icon }} iconClima"></i>
                this.icon = res.json().currently.icon;
                return this.icon;

            });

    }




}