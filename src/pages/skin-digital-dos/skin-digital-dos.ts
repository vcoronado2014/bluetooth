import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
//nuevos
import { of } from 'rxjs/observable/of';
import { interval } from 'rxjs/observable/interval';
import { delay } from 'rxjs/operators';

//servicio
import { ComunicacionService } from '../../app/Servicios/ComunicacionService';

/**
 * Generated class for the SkinDigitalDosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-skin-digital-dos',
  templateUrl: 'skin-digital-dos.html',
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

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private bluetoothSerial: BluetoothSerial,
    public blueService: ComunicacionService,
    private platform: Platform
  ) {
    this.estaConectado = navParams.get('estaConectado');
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

    this.platform.ready().then(() => {
      //iniciamos
      //this.iniciarIntervalo();
      this.iniciarIntervaloDos();
      //this.getMultiValueObservableVel();
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
    this.navCtrl.pop();
    //console.log('Click on button Test Console Log');
 }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SkinDigitalDosPage');
  }

}
