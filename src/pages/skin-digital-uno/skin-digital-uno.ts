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
 * Generated class for the SkinDigitalUnoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-skin-digital-uno',
  templateUrl: 'skin-digital-uno.html',
})
export class SkinDigitalUnoPage {
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
    this.velocidadActual = 0;
    this.temperaturaActual = 0;
    this.rpmActual = 0;
    this.flujoAireActual = 0;
    this.throttleposActual = 0;

    this.platform.ready().then(() => {
      //iniciamos
      //this.iniciarIntervalo();
      this.iniciarIntervaloDos();
      //this.getMultiValueObservableVel();
    });
  }
  //nuevos observables
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
  getMultiValueObservableVel() {
    var smsVel = "010D\r";
    this.conexionMensajes =this.blueService.dataInOutVel(smsVel).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        //var obj = this.blueService.parseObdCommand(data);
        this.blueService.parseObdCommand(data);
        this.velocidadActual = this.blueService.velocidadActual.Valor;
      }
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
    });
  }

  //******************** */
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
          this.velocidadActual = parseInt(this.blueService.velocidadActual.Valor.toString());
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
          this.temperaturaActual = parseInt(this.blueService.tempActual.Valor.toString());
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
  iniciarIntervalo() {
    var smsVel = "010D\r";
    var smsTemp = "0105\r";
    var smsRpm = "010C\r";
    //consulta a la velocidad
    Observable.interval(500).subscribe(() => {
      this.conexionMensajes =this.blueService.dataInOut(smsVel).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.velocidadActual = this.blueService.velocidadActual.Valor;
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajes.unsubscribe();
        }
      });
    });
    //consulta rpm
    Observable.interval(501).subscribe(() => {
      this.conexionMensajesT = this.blueService.dataInOut(smsRpm).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.rpmActual = this.blueService.rpmActual.Valor;
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesT.unsubscribe();
        }
      });
    });
    //consulta temp
    Observable.interval(600).subscribe(() => {
      this.conexionMensajesR = this.blueService.dataInOut(smsTemp).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.temperaturaActual = this.blueService.tempActual.Valor;
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesR.unsubscribe();
        }
      });
    });
    /*
    Observable.interval(3000).subscribe(() => {
      this.conexionMensajesT =this.blueService.dataInOut(smsT).subscribe(dataT => {
        let entrada = dataT.substr(0, dataT.length - 1);
        //this.presentToast('data:' + data);
        if (dataT && dataT.length > 0) {
          var obj = this.blueService.parseObdCommand(dataT);
          if (obj.name && obj.name.length > 0) {
            //this.dataSalida.push(entidad);
            var retorno = {
              Mensaje: sms,
              Modo: obj.mode,
              Pid: obj.pid,
              Nombre: obj.name,
              Descripcion: obj.description,
              Valor: obj.value,
              Minimo: obj.min,
              Maximo: obj.max,
              Unidad: obj.unit,
              Fecha: new Date()
            };
            this.temperaturaActual = retorno.Valor;
          }
          
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesT.unsubscribe();
        }
      });
    });
    
    Observable.interval(600).subscribe(() => {
      this.enviarMensajesI(smsR);
      this.flujoAireActual = = this.entidadConsultar.Valor;
    });
    */
  }
  enviarMensajesI(sms) {
    sms = sms + '\r';
    //this.presentToast('Enviando mensaje: ' + sms);
    this.conexionMensajes =this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var obj = this.blueService.parseObdCommand(data);
        if (obj.name && obj.name.length > 0) {
          //this.dataSalida.push(entidad);
          var retorno = {
            Mensaje: sms,
            Modo: obj.mode,
            Pid: obj.pid,
            Nombre: obj.name,
            Descripcion: obj.description,
            Valor: obj.value,
            Minimo: obj.min,
            Maximo: obj.max,
            Unidad: obj.unit,
            Fecha: new Date()
          };
          return retorno;
          //this.velocidadActual = entidad.Valor;
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      //this.mensaje = "";
    });
  }
  enviarMensajesR(sms) {
    sms = sms + '\r';
    this.conexionMensajes = this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        return data;
      }
    });
  }
  enviarMensajesT(sms) {
    sms = sms + '\r';
    //this.presentToast('Enviando mensaje: ' + sms);
    this.conexionMensajes =this.blueService.dataInOut(sms).subscribe(dataT => {
      let entrada = dataT.substr(0, dataT.length - 1);
      //this.presentToast('data:' + data);
      if (dataT && dataT.length > 0) {
        var objT = this.blueService.parseObdCommand(dataT);
        if (objT.name && objT.name.length > 0) {
          //this.dataSalida.push(entidad);
          var entidadT = {
            Mensaje: sms,
            Modo: objT.mode,
            Pid: objT.pid,
            Nombre: objT.name,
            Descripcion: objT.description,
            Valor: objT.value,
            Minimo: objT.min,
            Maximo: objT.max,
            Unidad: objT.unit,
            Fecha: new Date()
          };
          this.temperaturaActual = entidadT.Valor;
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      //this.mensaje = "";
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SkinDigitalUnoPage');
  }

}
