import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
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
  conexionMensajes: ISubscription;
  //variable para mostrar la velocidad
  velocidadActual: 0;
  temperaturaActual: 0;
  rpmActual: 0;
  flujoAireActual: 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private bluetoothSerial: BluetoothSerial,
    public blueService: ComunicacionService,
    private platform: Platform
  ) {
    this.estaConectado = navParams.get('estaConectado');
    this.platform.ready().then(() => {
      //iniciamos
      this.iniciarIntervalo();
    });
  }
  iniciarIntervalo() {
    var sms = "010D";
    var smsT = "0105";
    var smsR = "010C";
    Observable.interval(500).subscribe(() => {
      this.enviarMensajesI(sms);
    });
    Observable.interval(3000).subscribe(() => {
      this.enviarMensajesT(smsT);
    });
    Observable.interval(600).subscribe(() => {
      this.enviarMensajesR(smsR);
    });
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
          var entidad = {
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
          this.velocidadActual = entidad.Valor;
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
    //this.presentToast('Enviando mensaje: ' + sms);
    this.conexionMensajes =this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var obj = this.blueService.parseObdCommand(data);
        if (obj.name && obj.name.length > 0) {
          //this.dataSalida.push(entidad);
          var entidad = {
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
          this.rpmActual = entidad.Valor;
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
