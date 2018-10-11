import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
@Injectable()

export class AppSettings{
  public static ALERTA_VELOCIDAD_RURAL = 50;
  public static ALERTA_VELOCIDAD_URBANA = 120;
  public static ALERTA_TEMPERATURA_MOTOR = 94;
  public static ALERTA_RPM = 9000;
  public static ALERTA_FLUJO_AIRE = 100;
  public static ALERTA_THROTTLE = 50;
  // Tracking Actions 
  static GET_TRACKER_DATA: string = 'GET_TRACKER_DATA';
  static GET_TRACKER_DATA_SUCCESS: string = 'GET_TRACKER_DATA_SUCCESS';
  static START_TRACKING:string = 'START_TRACKING';
  startTracking(){
    return <Action>{
        type: AppSettings.START_TRACKING,
        payload: null
    }
  }
  static START_BG_TRACKING_SUCCESS:string = 'START_BG_TRACKING_SUCCESS';
  static START_BG_TRACKING_FAILED:string = 'START_BG_TRACKING_FAILED';

  static ERROR_CLEAN:string = 'ERROR_CLEAN';
  errorClean(){
    return <Action>{
        type: AppSettings.ERROR_CLEAN,
        payload: null
    }
  }

  }