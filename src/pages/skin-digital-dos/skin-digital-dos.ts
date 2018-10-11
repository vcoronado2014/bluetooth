import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, Platform, ToastController, LoadingController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion';
import { BackgroundGeolocation} from '@ionic-native/background-geolocation';
//nuevos
import { of } from 'rxjs/observable/of';
import { interval } from 'rxjs/observable/interval';
import { delay } from 'rxjs/operators';
//geolocation
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
//weather
import { OpenWeatherMapModule } from 'ionic-openweathermap';

//servicio
import { ComunicacionService } from '../../app/Servicios/ComunicacionService';
import { ServicioClima } from '../../app/Servicios/ServicioClima';
//import { OpenWeatherMapProvider } from 'ionic-openweathermap/dist/src/providers/openweathermap-provider';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environments';
//import { EILSEQ } from 'constants';
//import { promises } from 'fs';


/**
 * Generated class for the SkinDigitalDosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-skin-digital-dos',
  templateUrl: 'skin-digital-dos.html',
  providers: [ServicioClima]
})
export class SkinDigitalDosPage {
  estaConectado = false;
  colorBlue = 'danger';
  conexionMensajes: ISubscription;
  conexionMensajesT: ISubscription;
  conexionMensajesR: ISubscription;
  conexionMensajesF: ISubscription;
  conexionMensajesTHR: ISubscription;
  //variable para mostrar la velocidad
  velocidadActual: number;
  temperaturaActual: number;
  rpmActual: number;
  flujoAireActual: number;
  throttleposActual: number;
  interval: any;
  intervalRpm: any;
  intervalTmp: any;
  intervalFlujo: any;
  intervalThrottlepos: any;
  //estilos alertas
  estiloAlertaVelocidad: any;
  estiloAlertaTemperatura: any;
  //nuevas variables de objetos completos
  objVelocidadActual = {
    Mensaje: '',
    Modo: '',
    Pid: '',
    Nombre: '',
    Descripcion: '',
    Valor: 0,
    Minimo: 0,
    Maximo: 0,
    Unidad: '',
    Fecha: new Date()
  };
  objRpmActual = {
    Mensaje: '',
    Modo: '',
    Pid: '',
    Nombre: '',
    Descripcion: '',
    Valor: 0,
    Minimo: 0,
    Maximo: 0,
    Unidad: '',
    Fecha: new Date()
  };
  objTempActual = {
    Mensaje: '',
    Modo: '',
    Pid: '',
    Nombre: '',
    Descripcion: '',
    Valor: 0,
    Minimo: 0,
    Maximo: 0,
    Unidad: '',
    Fecha: new Date()
  };
  objFlujoAireActual = {
    Mensaje: '',
    Modo: '',
    Pid: '',
    Nombre: '',
    Descripcion: '',
    Valor: 0,
    Minimo: 0,
    Maximo: 0,
    Unidad: '',
    Fecha: new Date()
  };
  //throttlepos
  objThrottleposActual = {
    Mensaje: '',
    Modo: '',
    Pid: '',
    Nombre: '',
    Descripcion: '',
    Valor: 0,
    Minimo: 0,
    Maximo: 0,
    Unidad: '',
    Fecha: new Date()
  };
  //geolocation
  latitud: any;
  longitud: any;
  data: any;
  weatherData: any={};
  public speed;
  public watch: any;
  public x;
  //clima
  icon;
  current;
  dailySummary;
  operacion;
  loading2;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private bluetoothSerial: BluetoothSerial,
    public blueService: ComunicacionService,
    private platform: Platform,
    private geolocation: Geolocation,
    private toastCtrl: ToastController,
    private clima:ServicioClima,
    public http: Http,
    private loadingCtrl: LoadingController,
    private deviceMotion: DeviceMotion,
    public backgroundGeolocation: BackgroundGeolocation,
    public zone: NgZone
    //private openweathermapProvider: OpenWeatherMapProvider
  ) {
    this.loading2 =  this.loadingCtrl.create({
      content: 'Espere mientras se carga info del clima'
    });
    
    this.estaConectado = navParams.get('estaConectado');
    this.operacion = navParams.get('operacion');
    if (this.estaConectado)
    {
      this.colorBlue = 'secondary';
    }
    else{
      this.colorBlue = 'danger';
    }
    //inicializacion
    //alertas
    this.estiloAlertaVelocidad = 'font-yellow';
    this.estiloAlertaTemperatura = 'font-yellow';
    this.velocidadActual = 0;
    this.temperaturaActual = 0;
    this.rpmActual = 0;
    this.flujoAireActual = 0;
    this.throttleposActual = 0;
    //seteo de los objetos
    this.objVelocidadActual = {
      Mensaje: '',
      Modo: '',
      Pid: '',
      Nombre: '',
      Descripcion: '',
      Valor: 0,
      Minimo: 0,
      Maximo: 0,
      Unidad: '',
      Fecha: new Date()
    };
    this.objRpmActual = {
      Mensaje: '',
      Modo: '',
      Pid: '',
      Nombre: '',
      Descripcion: '',
      Valor: 0,
      Minimo: 0,
      Maximo: 0,
      Unidad: '',
      Fecha: new Date()
    };
    this.objTempActual = {
      Mensaje: '',
      Modo: '',
      Pid: '',
      Nombre: '',
      Descripcion: '',
      Valor: 0,
      Minimo: 0,
      Maximo: 0,
      Unidad: '',
      Fecha: new Date()
    };
    this.objFlujoAireActual = {
      Mensaje: '',
      Modo: '',
      Pid: '',
      Nombre: '',
      Descripcion: '',
      Valor: 0,
      Minimo: 0,
      Maximo: 0,
      Unidad: '',
      Fecha: new Date()
    };
    //throttlepos
    this.objThrottleposActual = {
      Mensaje: '',
      Modo: '',
      Pid: '',
      Nombre: '',
      Descripcion: '',
      Valor: 0,
      Minimo: 0,
      Maximo: 0,
      Unidad: '',
      Fecha: new Date()
    };
    
    //clima
    this.current = {
      summary: 'N/I',
      temperature: '0',
      humidity: '0',
      visibility: '0',
      precipProbability: '0',
      uvIndex: '0',
      daily: {
        summary: ''
      }

    };
    this.dailySummary = '';
    this.icon = 'wi wi-day-cloudy';

    this.platform.ready().then(() => {
      //iniciamos
      //this.iniciarIntervalo();
      //aca limitamos el intervalo dependiendo de la operación
      if (this.operacion == 'OBD'){
        this.iniciarIntervaloDos();
      }
      else {
        //iniciar las mediciones con GPS
        // Get the device current acceleration
        //this.iniciarIntervaloGPS();
        //this.iniciarTrackSpeed();
        this.startTracking();
        
      }
      
      //iniciamos el clima cada 10 segundos
      this.iniciarCargaClimaNuevo();
      //this.cargarClimaSinLoading();
    });
  }

//nuevo codigo
  startTracking() {

    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 5,
      distanceFilter: 1,
      debug: true,
      interval: 1000
    };

    this.backgroundGeolocation.configure(config).subscribe((location) => {

      //console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
      //      console.log(this.lat ,      this.lng,      this.speed);

      this.zone.run(() => {
        this.latitud = location.latitude;
        this.longitud = location.longitude;
        this.speed = (location.speed * 3600) / 1000; // can be speed * 3.6 and should be round for 2 decimal
        //Math.round( number * 10 ) / 10;
        this.velocidadActual = this.speed;
        this.velocidadActual = Math.round( this.velocidadActual * 10 ) / 10;
        

      });

    }, (err) => {
      console.log(err);

    });

    this.backgroundGeolocation.start();

    let options = {
      frequency: 1000,
      enableHighAccuracy: true
    };

    this.watch = this.geolocation.watchPosition(options).filter((p) => p.coords !== undefined)
      .subscribe((position: Geoposition) => {

        //console.log(position);

        this.zone.run(() => {
          this.latitud = position.coords.latitude;
          this.longitud = position.coords.longitude;
          //this.presentToast(this.latitud);
          this.clima.getCurrentForecast(this.latitud, this.longitud).subscribe(
            data => {
              this.current = data;
              this.dailySummary = this.current.daily.summary;
              this.icon = data.icon;
              switch (this.icon) {
                case "partly-cloudy-day":
                  return this.icon = "wi wi-day-cloudy"
                case 'clear-day':
                  return this.icon = 'wi wi-day-sunny'
                case 'partly-cloudy-night':
                  return this.icon = 'wi wi-night-partly-cloudy'
                case 'clear-night':
                  return this.icon = 'wi-night-clear'
                case 'rain':
                  return this.icon = 'wi wi-rain'
                case 'snow':
                  return this.icon = 'wi wi-snow'
                case 'sleet':
                  return this.icon = 'wi wi-sleet'
                case 'wind':
                  return this.icon = 'wi wi-windy'
                case 'fog':
                  return this.icon = 'wi wi-fog'
                case 'cloudy':
                  return this.icon = 'wi wi-cloudy'
                default:
                  this.icon;
                  break;
              }
              this.presentToast("Clima cargado");
              
            },
            err => {
              
              console.error(err);
              this.presentToast(err);
            },
            () => {
              
              console.log('get clima completed')
            }
          );

        });

      });

  }
  stopTracking() {
    console.log('stopTracking');
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();

  }
  cargarClimaSinLoading(){

    this.clima.getCurrentForecast(this.latitud, this.longitud).subscribe(
      data => {
        this.current = data;
        this.dailySummary = this.current.daily.summary;
        this.icon = data.icon;
        switch (this.icon) {
          case "partly-cloudy-day":
            return this.icon = "wi wi-day-cloudy"
          case 'clear-day':
            return this.icon = 'wi wi-day-sunny'
          case 'partly-cloudy-night':
            return this.icon = 'wi wi-night-partly-cloudy'
          case 'clear-night':
            return this.icon = 'wi-night-clear'
          case 'rain':
            return this.icon = 'wi wi-rain'
          case 'snow':
            return this.icon = 'wi wi-snow'
          case 'sleet':
            return this.icon = 'wi wi-sleet'
          case 'wind':
            return this.icon = 'wi wi-windy'
          case 'fog':
            return this.icon = 'wi wi-fog'
          case 'cloudy':
            return this.icon = 'wi wi-cloudy'
          default:
            this.icon;
            break;
        }
        this.presentToast("Clima cargado");
        
      },
      err => {
        
        console.error(err);
        this.presentToast(err);
      },
      () => {
        
        console.log('get clima completed')
      }
    );
  }
  cargarClima(loading){
    loading.present();
    this.clima.getCurrentForecast(this.latitud, this.longitud).subscribe(
      data => {
        this.current = data;
        this.dailySummary = this.current.daily.summary;
        this.icon = data.icon;
        switch (this.icon) {
          case "partly-cloudy-day":
            return this.icon = "wi wi-day-cloudy"
          case 'clear-day':
            return this.icon = 'wi wi-day-sunny'
          case 'partly-cloudy-night':
            return this.icon = 'wi wi-night-partly-cloudy'
          case 'clear-night':
            return this.icon = 'wi-night-clear'
          case 'rain':
            return this.icon = 'wi wi-rain'
          case 'snow':
            return this.icon = 'wi wi-snow'
          case 'sleet':
            return this.icon = 'wi wi-sleet'
          case 'wind':
            return this.icon = 'wi wi-windy'
          case 'fog':
            return this.icon = 'wi wi-fog'
          case 'cloudy':
            return this.icon = 'wi wi-cloudy'
          default:
            this.icon;
            break;
        }
        loading.dismiss();
      },
      err => {
        loading.dismiss();
        console.error(err)
      },
      () => {
        loading.dismiss();
        console.log('get clima completed')
      }
    );
  }
  iniciarCargaClimaNuevo() {
    this.interval = setInterval(() => {
      //iniciar loading
      let loading = this.loadingCtrl.create({
        content: 'Espere mientras se carga info del clima'
      });

      loading.present();
      //iniciar geolocation
      this.cargarClima(loading);

    }, environment.TIEMPO_CARGA_CLIMA);
  }

//fin nuevo codigo




  iniciarTrackSpeed(){
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 5,
      distanceFilter: 1,
      debug: true,
      interval: 1000
    };

    this.backgroundGeolocation.configure(config).subscribe((location) => {
        this.presentToast(location.speed.toString() + location);
        this.velocidadActual = (location.speed * 3600)/1000 ; // can be speed * 3.6 and should be round for 2 decimal
    }, (err) => {
      console.log(err);
      this.presentToast(err);
    });

  }
  iniciarCargaClima() {
    //iniciar loading
    let loading = this.loadingCtrl.create({
      content: 'Espere mientras se carga info del clima'
    });

    loading.present();

    //iniciar geolocation
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitud = resp.coords.latitude;
      this.longitud = resp.coords.longitude;
      this.clima.getCurrentForecast(this.latitud, this.longitud).subscribe(
        data => {
          this.current = data;
          this.dailySummary = this.current.daily.summary;
          this.icon = data.icon;
          switch (this.icon) {
            case "partly-cloudy-day":
              return this.icon = "wi wi-day-cloudy"
            case 'clear-day':
              return this.icon = 'wi wi-day-sunny'
            case 'partly-cloudy-night':
              return this.icon = 'wi wi-night-partly-cloudy'
            case 'clear-night':
              return this.icon = 'wi-night-clear'
            case 'rain':
              return this.icon = 'wi wi-rain'
            case 'snow':
              return this.icon = 'wi wi-snow'
            case 'sleet':
              return this.icon = 'wi wi-sleet'
            case 'wind':
              return this.icon = 'wi wi-windy'
            case 'fog':
              return this.icon = 'wi wi-fog'
            case 'cloudy':
              return this.icon = 'wi wi-cloudy'
            default:
              this.icon;
              break;
          }
          loading.dismiss();
        },
        err => {
          loading.dismiss();
          console.error(err)
        },
        () => {
          loading.dismiss();
          console.log('get clima completed')
        }
      );
    }).catch((error) => {
      console.log('Error getting location', error);
      this.presentToast(error);
      loading.dismiss();
    });

  }
  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.intervalRpm) {
      clearInterval(this.intervalRpm);
    }
    if (this.intervalTmp) {
      clearInterval(this.intervalTmp);
    }
    if (this.intervalFlujo) {
      clearInterval(this.intervalFlujo);
    }
    if (this.intervalThrottlepos) {
      clearInterval(this.intervalThrottlepos);
    }
  }

  iniciarIntervaloGPS(){
    this.interval = setInterval(() => {
      this.deviceMotion.getCurrentAcceleration().then(
        (acceleration: DeviceMotionAccelerationData) => {
          console.log(acceleration);
          this.velocidadActual = parseInt(acceleration.toString());
        },
        (error: any) => {
          console.log(error);
          this.presentToast(error);
        }
      );
    }, 500);
  }

  iniciarIntervaloDos() {
    var smsVel = "010D\r";
    var smsTemp = "0105\r";
    var smsRpm = "010C\r";
    var smsFlujo = "0110\r";
    var smsThr = "0111\r";

    this.interval = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajes = this.blueService.dataInOut(smsVel).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objVelocidadActual = this.blueService.velocidadActual;
          this.velocidadActual = parseInt(this.blueService.velocidadActual.Valor.toString());
          this.estiloAlertaVelocidad = this.blueService.porocesarAlertaSimple(this.velocidadActual, "vss");
          
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajes.unsubscribe();
        }
      });
    }, 500);

    this.intervalRpm = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesR = this.blueService.dataInOut(smsRpm).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objRpmActual = this.blueService.rpmActual;
          this.rpmActual = parseInt(this.blueService.rpmActual.Valor.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesR.unsubscribe();
        }
      });
    }, 550);

    this.intervalTmp = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesT = this.blueService.dataInOut(smsTemp).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objTempActual = this.blueService.tempActual;
          this.temperaturaActual = parseInt(this.blueService.tempActual.Valor.toString());
          this.estiloAlertaTemperatura = this.blueService.porocesarAlertaSimple(this.temperaturaActual, "temp");
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesT.unsubscribe();
        }
      });
    }, 650);

    this.intervalFlujo = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesF = this.blueService.dataInOut(smsFlujo).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objFlujoAireActual = this.blueService.flujoAireActual;
          this.flujoAireActual = parseInt(this.blueService.flujoAireActual.Valor.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesF.unsubscribe();
        }
      });
    }, 650);

    this.intervalThrottlepos = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesTHR = this.blueService.dataInOut(smsThr).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objThrottleposActual = this.blueService.throttleposActual;
          this.throttleposActual = parseInt(this.blueService.throttleposActual.Valor.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesTHR.unsubscribe();
        }
      });
    }, 650);
  }

  goBack() {
    //this.backgroundGeolocation.finish();
    this.navCtrl.pop();
    //console.log('Click on button Test Console Log');
 }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SkinDigitalDosPage');
  }
  private presentToast(text: string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 6000
    });
    toast.present();
  }

}
