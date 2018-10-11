import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/filter';
import { AppSettings } from "../AppSettings";

export interface ITrackerDatas {
    latitude: number;
    longitude: number;
    speed: number
}
@Injectable()
export class LocationTrackerService {
    public watch: any;
    public tracker: ITrackerDatas;

    constructor(
        private backgroundGeolocation: BackgroundGeolocation,
        private geolocation: Geolocation,
        private _ngZone: NgZone
    ) {
    }

    startTracking(): Observable<any> {
        return Observable.create((observer) => {
            // Background Tracking
            let config: BackgroundGeolocationConfig = {
                desiredAccuracy: 0,
                stationaryRadius: 20,
                distanceFilter: 10,
                debug: true,
                interval: 2000
            };
            this.backgroundGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {
                console.log('BackgroundGeolocation:  ', location);
                this._ngZone.run(() => {
                    let data: ITrackerDatas = {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        speed: location.speed | 0
                    }
                    observer.next({ type: AppSettings.START_BG_TRACKING_SUCCESS, payload: data })
                })
            }, (err) => {
                //console.log(err);
                observer.next({ type: AppSettings.START_BG_TRACKING_FAILED, payload: err })
            });
            // Turn ON the background-geolocation system.
            this.backgroundGeolocation.start();

        })
    }

    trackLocation() {
        return Observable.create((observer) => {
            // Foreground Tracking
            let options = {
                frequency: 3000,
                enableHighAccuracy: true
            };

            this.watch = this.geolocation.watchPosition(options)
                .filter((p: any) => p.code === undefined)
                .subscribe((position: Geoposition) => {
                    console.log('geolocation', position.coords);
                    this._ngZone.run(() => {
                        let data: ITrackerDatas = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            speed: position.coords.speed | 0
                        }
                        observer.next({ type: AppSettings.GET_TRACKER_DATA_SUCCESS, payload: data })
                    })
                });
        })
    }

    stopTracking() {
        console.log('stopTracking');
        this.backgroundGeolocation.finish();
        this.watch.unsubscribe();
    }

}