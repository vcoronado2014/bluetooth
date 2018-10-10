import { Component, Injectable } from '@angular/core';
import { IonicPage, Platform, ToastController, AlertController, Refresher, NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
//servicio
import { ComunicacionService } from '../../app/Servicios/ComunicacionService';
//paginas
import { SeleccionSkinPage } from '../../pages/seleccion-skin/seleccion-skin';


@Injectable()
@Component({
  selector: 'bluetooth-page',
  templateUrl: 'bluetooth.html'
})
export class BluetoothPage {

  devices: Array<any> = [];
  mostrarSpiner = true;
  mensaje: string = "";
  conexion: ISubscription;
  conexionMensajes: ISubscription;
  reader: Observable<any>;
  rawListener;
  //variables nuevas
  conectadoA: string = "";
  dataSalida: Array<any> = [];
  estaConectado = false;
  //variables de hex
  //responsePIDS;
  modeRealTime = "01";
  modeRequestDTC = "03";
  modeClearDTC = "04";
  modeVin = "09";

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetoothSerial: BluetoothSerial,
    public blueService: ComunicacionService,
    public navCtrl: NavController,
  ) { 
    //contenido del cosntructor

  }
  siguiente(){
    //abrir la pagina siguiente a la conexión, cambiar esto despues
    /*
    if (this.estaConectado){
      this.navCtrl.push(SeleccionSkinPage, { usuario: this.estaConectado });
    }
    else{
      this.presentToast('No puede seguir, debe conectarse a un dispositivo bluetooth.');
    }
    */
   this.navCtrl.push(SeleccionSkinPage, { estaConectado: this.estaConectado, operacion: 'OBD' });
  }
  iniciarIntervalo() {
    var sms = "010D";
    Observable.interval(5000).subscribe(() => {
      this.enviarMensajesI(sms);
    });
  }
  /**
   * Al entrar en la ventana ejecuta la función para buscar dispositivos bluetooth.
   */
  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.buscarBluetooth().then((success: Array<Object>) => {
        this.devices = success;
        this.mostrarSpiner = false;
      }, fail => {
        this.presentToast(fail);
        this.mostrarSpiner = false;
      });
    });
  }
  /**
   * Al cerrar la aplicación se asegura de que se cierre la conexión bluetooth.
   */
  public ngOnDestroy() {
    this.desconectar();
  }
  /**
   * Busca los dispositivos bluetooth disponibles, evalúa si es posible usar la funcionalidad
   * bluetooth en el dispositivo.
   * @return {Promise<any>} Regresa una lista de los dispositivos que se localizaron.
   */
  buscarBluetooth(): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isEnabled().then(success =>{
        this.bluetoothSerial.discoverUnpaired().then(success => {
          if (success.length > 0) {
            resolve(success);
          } else {
            reject('No se encontraron dispositivos');
          }
        }).catch((error) => {
          console.log(`[1] Error: ${JSON.stringify(error)}`);
          reject('Bluetooth no disponible en esta plataforma');
        });
        //ahora los pareados
        

      }, fail => {
        console.log(`[2] Error: ${JSON.stringify(fail)}`);
        reject('El bluetooth no está disponible o está apagado');
      });
    });
  }
  /**
   * Busca los dispositivos bluetooth dispositivos al arrastrar la pantalla hacia abajo.
   * @param refresher
   */
  refreshBluetooth(refresher: Refresher) {
    console.log(refresher);
    if (refresher) {
      this.buscarBluetooth().then((successMessage: Array<Object>) => {
        this.devices = [];
        this.devices = successMessage;
        refresher.complete();
      }, fail => {
        this.presentToast(fail);
        refresher.complete();
      });
    }
  }
  /**
   * Verifica si ya se encuentra conectado a un dispositivo bluetooth o no.
   * @param seleccion Son los datos del elemento seleccionado  de la lista
   */
  revisarConexion(seleccion) {
    this.bluetoothSerial.isConnected().then(
      isConnected => {
        let alert = this.alertCtrl.create({
          title: 'Reconectar',
          message: '¿Desea reconectar a este dispositivo?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Aceptar',
              handler: () => {
                this.desconectar();
                this.conectar(seleccion.id).then(success => {
                  this.conectadoA = seleccion.name;
                  this.presentToast(success);
                }, fail => {
                  this.conectadoA = "No hay dispositivo";
                  this.estaConectado = true;
                  this.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
      }, notConnected => {
        let alert = this.alertCtrl.create({
          title: 'Conectar',
          message: '¿Desea conectar el dispositivo?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Aceptar',
              handler: () => {
                this.conectar(seleccion.id).then(success => {
                  this.conectadoA = seleccion.name;
                  this.estaConectado = true;
                  this.presentToast(success);
                }, fail => {
                  this.conectadoA = "No hay dispositivo";
                  this.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
    });
  }
  /**
   * Se conceta a un dispostitivo bluetooth por su id.
   * @param id Es la id del dispositivo al que se desea conectarse
   * @return {Promise<any>} Regresa un mensaje para indicar si se conectó exitosamente o no.
   */
  conectar(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.conexion = this.bluetoothSerial.connect(id).subscribe((data: Observable<any>) => {
        //lo vamos a comentar por mientras
        //this.enviarMensajes();
        resolve("Conectado");
      }, fail => {
        console.log(`[3] Error conexión: ${JSON.stringify(fail)}`);
        reject("No se logro conectar");
      });
    });
  }
  /**
   * Cierra el socket para la conexión con un dispositivo bluetooth.
   */
  desconectar() {
    if (this.conexionMensajes) {
      this.conexionMensajes.unsubscribe();
    }
    if (this.conexion) {
      this.conexion.unsubscribe();
    }
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
          this.dataSalida.push(entidad);
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
      this.mensaje = "";
    });
  }

  /**
   * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
   */

   /*
  enviarMensajes() {
    var sms = this.mensaje + '\r';
    this.presentToast('Enviando mensaje: ' + sms);
    this.conexionMensajes = this.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var obj = this.parseObdCommand(data);
        if (obj.name && obj.name.length > 0) {
          //this.dataSalida.push(entidad);
          var entidad = {
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
          this.dataSalida.push(entidad);
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          this.presentToast('console log:' + entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      this.mensaje = "";
    });
  }
*/
    /**
   * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
   */
  enviarMensajes() {
    var sms = this.mensaje + '\r';
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
          this.dataSalida.push(entidad);
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
      this.mensaje = "";
    });
  }

  /**
 * Presenta un cuadro de mensaje.
 * @param {string} text Mensaje a mostrar.
 */
  private presentToast(text: string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 6000
    });
    toast.present();
  }
  limpiarMensajes(){
    this.dataSalida = [];
  }
  


}
