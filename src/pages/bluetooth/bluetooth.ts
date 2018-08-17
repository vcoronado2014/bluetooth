import { Component, Injectable } from '@angular/core';
import { IonicPage, Platform, ToastController, AlertController, Refresher } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";

/**
 * Esta clase maneja la conectividad bluetooth
 * @author Juan Lozoya <jlozoya1995@gmail.com>
 * @see [Bluetooth Serial](https://ionicframework.com/docs/native/bluetooth-serial/)
 */
@Injectable()
@IonicPage({
  name: 'BluetoothPage',
  priority: 'high'
})
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

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetoothSerial: BluetoothSerial
  ) { }
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
        this.enviarMensajes();
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
  /**
   * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
   */
  enviarMensajes() {
    var sms = this.mensaje + '\r';
    this.presentToast('Enviando mensaje: ' + sms);
    this.conexionMensajes = this.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var entidad = {
          Respuesta: data,
          Fecha: new Date()
        };
        this.dataSalida.push(entidad);
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
  /**
   * Establece el socket para las comunicaciones seriales después de conectarse con un dispositivo
   * bluetooth.
   * @param message Es el texto que se desea enviar.
   * @returns {Observable<any>} Regresa el texto que llegue vía seria a través de la conexión
   * bluetooth al dispositivo, en caso de no existir una conexión regresa un mensaje indicando que:
   * _No estas conectado a ningún dispositivo bluetooth_.
   */
  public dataInOut(message: string): Observable<any> {
    return Observable.create(observer => {
      this.bluetoothSerial.isConnected().then(isConnected => {
        this.reader = Observable.fromPromise(this.bluetoothSerial.write(message))
          .flatMap(() => {
            return this.bluetoothSerial.subscribeRawData()
          })
          .flatMap(() => {
            return this.bluetoothSerial.readUntil('\n');   // <= delimitador
          });
        this.reader.subscribe(data => {
          observer.next(data);
        });
      }, notConected => {
        observer.next("Estas desconectado");
        observer.complete();
      });
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
  //manejo de los pids y mensajes
  
 checkHex(n){
    return/^[0-9A-Fa-f]{1,64}$/.test(n);
}
 Hex2Bin(n){
    if(!this.checkHex(n)){
        return 0;
    }
    return this.zeroFill(parseInt(n,16).toString(2),4);
}
 zeroFill( number, width ){
  width -= number.toString().length;
  if ( width > 0 ){
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}
bitDecoder(byte) {
    return parseInt(byte, 2);
}
convertPIDSupported(byteA, byteB, byteC, byteD) {
    var hexstring = byteA + byteB + byteC + byteD;
    var pidHex = hexstring.split('');
    var pidStatus = [];
    pidHex.forEach(function(hex){
        var hexPerm = this.Hex2Bin(hex).split('');
        hexPerm.forEach(function(perm){
            pidStatus.push( perm === "1" ? true : false );
        });
    });
    return pidStatus;
}
convertFuelSystem(byteA, byteB){
    var reply = {system1: 0, system2: 0 };
    reply.system1 = this.bitDecoder(byteA);
    if( byteB ){
        reply.system2 = this.bitDecoder(byteB);
    }
    return reply;
}
convertDTCCheck(byteA, byteB, byteC, byteD) {
    //ByteB, ByteC and ByteD are not read. These bytes are for testing purposes, which is not supported in this module.
    var byteValue, mil, numberOfDTCs, reply;
    byteValue = parseInt(byteA, 16);
    if ((byteValue >> 7) === 1) {
        mil = 1;
    } else {
        mil = 0;
    }
    numberOfDTCs = byteValue % 128;
    reply = {};
    reply.numberOfErrors = numberOfDTCs;
    reply.mil = mil;
    return reply;
}
convertDTCRequest(byteA, byteB, byteC, byteD, byteE, byteF) {
    var reply = {errors: [] };
    reply.errors = [];

     let decodeDTCCode = function (byte1, byte2) {
        var codeString = "", firstChar;

        //If 00 00 --> No code.
        if ((byte1 === '00') && (byte2 === '00')) {
            return '-';
        }

        var firstByte = parseInt(byte1, 16);
        var firstCharBytes = firstByte >> 6;
        switch(firstCharBytes) {
            case 0:
                firstChar = 'P';
                break;
            case 1:
                firstChar = 'C';
                break;
            case 2:
                firstChar = 'B';
                break;
            case 3:
                firstChar = 'U';
                break;
            default:
                console.log('Error with DTC');
                break;
        }
        var secondChar = (firstByte >> 4) % 4;
        var thirdChar = firstByte % 16;
        codeString = firstChar + secondChar + thirdChar + byte2;
        return codeString;
    };

    reply.errors[0] = decodeDTCCode(byteA, byteB);
    reply.errors[1] = decodeDTCCode(byteC, byteD);
    reply.errors[2] = decodeDTCCode(byteE, byteF);
    return reply;
}
convertLoad(byte) {
    return parseInt(byte, 16) * (100 / 256);
}
convertTemp(byte) {
    return parseInt(byte, 16) - 40;
}
convertFuelTrim(byte) {
    return (parseInt(byte, 16) - 128) * (100 / 128);
}
convertFuelRailPressure(byte) {
    return parseInt(byte, 16) * 3;
}
convertIntakePressure(byte) {
    return parseInt(byte, 16);
}
convertRPM(byteA, byteB) {
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) / 4;
}
convertSpeed(byte) {
    return parseInt(byte, 16);
}
convertSparkAdvance(byte) {
    return (parseInt(byte, 16) / 2) - 64;
}
convertAirFlowRate(byteA, byteB) {
    return ((parseInt(byteA, 16) * 256.0) + parseInt(byteB, 16)) / 100;
}
convertThrottlePos(byte) {
    return (parseInt(byte, 16) * 100) / 255;
}
convertOxygenSensorOutput(byte) {
    return parseInt(byte, 16) * 0.005;
}
convertRuntime(byteA, byteB){
    return (parseInt(byteA, 16) * 256.0) + parseInt(byteB, 16);
}
convertfrpm(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) * 0.079;
}
convertfrpd(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) * 10
}
convertLambda(byteA, byteB, byteC, byteD){
    var reply = { ratio: 0, voltage: 0 };
    reply.ratio = ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) * 2 / 65535;
    reply.voltage = ((parseInt(byteC, 16) * 256) + parseInt(byteD, 16)) * 8 / 65535;
    return reply;
}
convertPercentA(byte){
    return parseInt(byte, 16) * 100 / 255;
}
convertPercentB(byte){
    return (parseInt(byte, 16) - 128) * 100 / 128;
}
convertDistanceSinceCodesCleared(byteA, byteB){
    return (parseInt(byteA, 16) * 256) + parseInt(byteB, 16);
}
convertLambda2(byteA, byteB, byteC, byteD){
    var reply = { ratio: 0, voltage: 0};
    reply.ratio = ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) / 32768;
    reply.voltage = ((parseInt(byteC, 16) * 256) + parseInt(byteD, 16)) / 256 - 128;
    return reply;
}
convertCatalystTemperature(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) / 10 - 40;
}
convertControlModuleVoltage(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) / 1000;
}
convertAbsoluteLoad(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) * 100 / 255;
}
convertLambda3(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) / 32768;
}
convertAmbientAirTemp(byte){
    return parseInt(byte, 16) - 40;
}
convertMinutes(byteA, byteB){
    return (parseInt(byteA, 16) * 256) + parseInt(byteB, 16);
}
convertExternalTestEquipment(byteA, byteB, byteC, byteD){
    var reply = {te1: 0, te2: 0, te3: 0, te4: 0};
    reply.te1 = this.bitDecoder(byteA);
    reply.te2 = this.bitDecoder(byteB);
    reply.te3 = this.bitDecoder(byteC);
    reply.te4 = this.bitDecoder(byteD) * 10;
    return reply;
}
convertExternalTestEquipment2(byteA, byteB, byteC, byteD){
  var reply = {te1: 0, te2: 0, te3: 0, te4: 0};
    reply.te1 = this.bitDecoder(byteA) * 10;
    reply.te2 = this.bitDecoder(byteB);
    reply.te3 = this.bitDecoder(byteC);
    reply.te4 = this.bitDecoder(byteD);
    return reply;
}
convertAbsoluteVaporPressure(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) / 200;   
}
convertSystemVaporPressure(byteA, byteB){
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) - 32767;   
}
convertShortOxygenSensorOutput(byteA, byteB){
    var reply = {bank1: 0, bank2: 0 };
    reply.bank1 = (parseInt(byteA, 16) - 128) * 100 / 128;
    reply.bank2 = (parseInt(byteB, 16) - 128) * 100 / 128;
    return reply;
}
convertFuelRailPressureAbs(byteA, byteB) {
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) * 10;
}
convertFuelInjectionTiming(byteA, byteB) {
    return (((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) - 26880) / 128;
}
convertEngineFuelRate(byteA, byteB) {
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) * 0.05;
}

convertEngineTorque(byte){
    return parseInt(byte, 16) - 125;
}

convertExhastGasTemperature(byteA, byteB){
    return (parseInt(byteA, 16) * 256 + parseInt(byteB, 16)) / 10 - 40;
}
//DTC
notSupported() {
   console.log("There is no answer. This should not be happening.");
   return;
}
//VIN
convertVIN_count(byte) {
    return byte;
}
convertVIN(byte) {
    byte = byte.split("");
    var tmp=[], vin="";
    for(var i in byte){
        tmp[i] = parseInt(byte[i]);
        tmp[i] = parseInt(tmp[i], 16);
        vin += String.fromCharCode(tmp[i]);
    }
    return vin;
}

//responsePIDS;
modeRealTime = "01";
modeRequestDTC = "03";
modeClearDTC = "04";
modeVin = "09";

responsePIDS = [
    //Realtime data
    {mode: this.modeRealTime, pid: "00", bytes: 4, name: "pidsupp0",     description: "PIDs supported 00-20", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.convertPIDSupported},
    {mode: this.modeRealTime, pid: "01", bytes: 4, name: "dtc_cnt",      description: "Monitor status since DTCs cleared", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.convertDTCCheck},
    {mode: this.modeRealTime, pid: "02", bytes: 2, name: "dtcfrzf",      description: "DTC that caused required freeze frame data storage", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "03", bytes: 2, name: "fuelsys",      description: "Fuel system 1 and 2 status", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.convertFuelSystem},
    {mode: this.modeRealTime, pid: "04", bytes: 1, name: "load_pct",     description: "Calculated LOAD Value", min: 0, max: 100, unit: "%", convertToUseful: this.convertLoad},
    {mode: this.modeRealTime, pid: "05", bytes: 1, name: "temp",         description: "Engine Coolant Temperature", min: -40, max: 215, unit: "Celsius", convertToUseful: this.convertTemp},
    {mode: this.modeRealTime, pid: "06", bytes: 1, name: "shrtft13",     description: "Short Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertFuelTrim},
    {mode: this.modeRealTime, pid: "07", bytes: 1, name: "longft13",     description: "Long Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertFuelTrim},
    {mode: this.modeRealTime, pid: "08", bytes: 1, name: "shrtft24",     description: "Short Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertFuelTrim},
    {mode: this.modeRealTime, pid: "09", bytes: 1, name: "longft24",     description: "Long Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertFuelTrim},
    {mode: this.modeRealTime, pid: "0A", bytes: 1, name: "frp",          description: "Fuel Pressure", min: 0, max: 765, unit: "kPa", convertToUseful: this.convertFuelRailPressure},
    {mode: this.modeRealTime, pid: "0B", bytes: 1, name: "map",          description: "Intake Manifold Absolute Pressure", min: 0, max: 255, unit: "kPa", convertToUseful: this.convertIntakePressure},
    {mode: this.modeRealTime, pid: "0C", bytes: 2, name: "rpm",          description: "Engine RPM", min: 0, max: 16383.75, unit: "rev/min", convertToUseful: this.convertRPM},
    {mode: this.modeRealTime, pid: "0D", bytes: 1, name: "vss",          description: "Vehicle Speed Sensor", min: 0, max: 255, unit: "km/h", convertToUseful: this.convertSpeed},
    {mode: this.modeRealTime, pid: "0E", bytes: 1, name: "sparkadv",     description: "Ignition Timing Advance for #1 Cylinder", min: -64, max: 63.5, unit: "degrees relative to #1 cylinder",  convertToUseful: this.convertSparkAdvance},
    {mode: this.modeRealTime, pid: "0F", bytes: 1, name: "iat",          description: "Intake Air Temperature", min: -40, max: 215, unit: "Celsius", convertToUseful: this.convertTemp},
    {mode: this.modeRealTime, pid: "10", bytes: 2, name: "maf",          description: "Air Flow Rate from Mass Air Flow Sensor", min: 0, max: 655.35, unit: "g/s", convertToUseful: this.convertAirFlowRate},
    {mode: this.modeRealTime, pid: "11", bytes: 1, name: "throttlepos",  description: "Absolute Throttle Position", min: 1, max: 100, unit: "%", convertToUseful: this.convertThrottlePos},
    {mode: this.modeRealTime, pid: "12", bytes: 1, name: "air_stat",     description: "Commanded Secondary Air Status", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "13", bytes: 1, name: "o2sloc",       description: "Location of Oxygen Sensors", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "14", bytes: 2, name: "o2s11",        description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "15", bytes: 2, name: "o2s12",        description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "16", bytes: 2, name: "o2s13",        description: "Bank 1 - Sensor 3/Bank 2 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "17", bytes: 2, name: "o2s14",        description: "Bank 1 - Sensor 4/Bank 2 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "18", bytes: 2, name: "o2s21",        description: "Bank 2 - Sensor 1/Bank 3 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "19", bytes: 2, name: "o2s22",        description: "Bank 2 - Sensor 2/Bank 3 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "1A", bytes: 2, name: "o2s23",        description: "Bank 2 - Sensor 3/Bank 4 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "1B", bytes: 2, name: "o2s24",        description: "Bank 2 - Sensor 4/Bank 4 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: this.convertOxygenSensorOutput}, 
    {mode: this.modeRealTime, pid: "1C", bytes: 1, name: "obdsup",       description: "OBD requirements to which vehicle is designed", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "1D", bytes: 1, name: "o2sloc2",      description: "Location of oxygen sensors", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "1E", bytes: 1, name: "pto_stat",     description: "Auxiliary Input Status", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "1F", bytes: 2, name: "runtm",        description: "Time Since Engine Start", min: 0, max: 65535, unit: "seconds", convertToUseful: this.convertRuntime},
    {mode: this.modeRealTime, pid: "20", bytes: 4, name: "piddsupp2",    description: "PIDs supported 21-40", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.convertPIDSupported},
    {mode: this.modeRealTime, pid: "21", bytes: 2, name: "mil_dist",     description: "Distance Travelled While MIL is Activated", min: 0, max: 65535, unit: "km", convertToUseful: this.convertRuntime},
    {mode: this.modeRealTime, pid: "22", bytes: 2, name: "frpm",         description: "Fuel Rail Pressure relative to manifold vacuum", min: 0, max: 5177.265, unit: "kPa", convertToUseful: this.convertfrpm},
    {mode: this.modeRealTime, pid: "23", bytes: 2, name: "frpd",         description: "Fuel Rail Pressure (diesel)", min: 0, max: 655350, unit: "kPa", convertToUseful: this.convertfrpd},
    {mode: this.modeRealTime, pid: "24", bytes: 4, name: "lambda11",     description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "25", bytes: 4, name: "lambda12",     description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "26", bytes: 4, name: "lambda13",     description: "Bank 1 - Sensor 3 /Bank 2 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "27", bytes: 4, name: "lambda14",     description: "Bank 1 - Sensor 4 /Bank 2 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "28", bytes: 4, name: "lambda21",     description: "Bank 2 - Sensor 1 /Bank 3 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "29", bytes: 4, name: "lambda22",     description: "Bank 2 - Sensor 2 /Bank 3 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "2A", bytes: 4, name: "lambda23",     description: "Bank 2 - Sensor 3 /Bank 4 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "2B", bytes: 4, name: "lambda24",     description: "Bank 2 - Sensor 4 /Bank 4 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda},
    {mode: this.modeRealTime, pid: "2C", bytes: 1, name: "egr_pct",      description: "Commanded EGR", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "2D", bytes: 1, name: "egr_err",      description: "EGR Error", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertPercentB},
    {mode: this.modeRealTime, pid: "2E", bytes: 1, name: "evap_pct",     description: "Commanded Evaporative Purge", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "2F", bytes: 1, name: "fli",          description: "Fuel Level Input", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "30", bytes: 1, name: "warm_ups",     description: "Number of warm-ups since diagnostic trouble codes cleared", min: 0, max: 255, unit: "", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "31", bytes: 2, name: "clr_dist",     description: "Distance since diagnostic trouble codes cleared", min: 0, max: 65535, unit: "km", convertToUseful: this.convertDistanceSinceCodesCleared},
    // <-- pending
    {mode: this.modeRealTime, pid: "32", bytes: 2, name: "evap_vp",      description: "Evap System Vapour Pressure", min: -8192, max: 8192, unit: "Pa", convertToUseful: this.bitDecoder},
    // pending -->
    {mode: this.modeRealTime, pid: "33", bytes: 1, name: "baro",         description: "Barometric Pressure", min: 0, max: 255, unit: "kPa", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "34", bytes: 4, name: "lambdac11",    description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "35", bytes: 4, name: "lambdac12",    description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "36", bytes: 4, name: "lambdac13",    description: "Bank 1 - Sensor 3/Bank 2 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "37", bytes: 4, name: "lambdac14",    description: "Bank 1 - Sensor 4/Bank 2 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "38", bytes: 4, name: "lambdac21",    description: "Bank 2 - Sensor 1/Bank 3 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "39", bytes: 4, name: "lambdac22",    description: "Bank 2 - Sensor 2/Bank 3 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "3A", bytes: 4, name: "lambdac23",    description: "Bank 2 - Sensor 3/Bank 4 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "3B", bytes: 4, name: "lambdac24",    description: "Bank 2 - Sensor 4/Bank 4 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda2},
    {mode: this.modeRealTime, pid: "3C", bytes: 2, name: "catemp11",     description: "Catalyst Temperature Bank 1 /  Sensor 1", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: this.convertCatalystTemperature},
    {mode: this.modeRealTime, pid: "3D", bytes: 2, name: "catemp21",     description: "Catalyst Temperature Bank 2 /  Sensor 1", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: this.convertCatalystTemperature},
    {mode: this.modeRealTime, pid: "3E", bytes: 2, name: "catemp12",     description: "Catalyst Temperature Bank 1 /  Sensor 2", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: this.convertCatalystTemperature},
    {mode: this.modeRealTime, pid: "3F", bytes: 2, name: "catemp22",     description: "Catalyst Temperature Bank 2 /  Sensor 2", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: this.convertCatalystTemperature},

    {mode: this.modeRealTime, pid: "40", bytes: 4, name: "piddsupp4",    description: "PIDs supported 41-60", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.convertPIDSupported},
    // <-- pending
    {mode: this.modeRealTime, pid: "41", bytes: 4, name: "monitorstat",  description: "Monitor status this driving cycle", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    // pending -->
    {mode: this.modeRealTime, pid: "42", bytes: 2, name: "vpwr",         description: "Control module voltage", min: 0, max: 65535, unit: "V", convertToUseful: this.convertControlModuleVoltage},
    {mode: this.modeRealTime, pid: "43", bytes: 2, name: "load_abs",     description: "Absolute Load Value", min: 0, max: 25700, unit: "%", convertToUseful: this.convertAbsoluteLoad},
    {mode: this.modeRealTime, pid: "44", bytes: 2, name: "lambda",       description: "Fuel/air Commanded Equivalence Ratio", min: 0, max: 2, unit: "(ratio)", convertToUseful: this.convertLambda3},
    {mode: this.modeRealTime, pid: "45", bytes: 1, name: "tp_r",         description: "Relative Throttle Position", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "46", bytes: 1, name: "aat",          description: "Ambient air temperature", min: -40, max: 215, unit: "Celsius", convertToUseful: this.convertAmbientAirTemp},
    {mode: this.modeRealTime, pid: "47", bytes: 1, name: "tp_b",         description: "Absolute Throttle Position B", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "48", bytes: 1, name: "tp_c",         description: "Absolute Throttle Position C", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "49", bytes: 1, name: "app_d",        description: "Accelerator Pedal Position D", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "4A", bytes: 1, name: "app_e",        description: "Accelerator Pedal Position E", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "4B", bytes: 1, name: "app_f",        description: "Accelerator Pedal Position F", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "4C", bytes: 1, name: "tac_pct",      description: "Commanded Throttle Actuator Control", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "4D", bytes: 2, name: "mil_time",     description: "Time run by the engine while MIL activated", min: 0, max: 65535, unit: "minutes", convertToUseful: this.convertMinutes},
    {mode: this.modeRealTime, pid: "4E", bytes: 2, name: "clr_time",     description: "Time since diagnostic trouble codes cleared", min: 0, max: 65535, unit: "minutes", convertToUseful: this.convertMinutes},
    {mode: this.modeRealTime, pid: "4F", bytes: 4, name: "exttest1",     description: "External Test Equipment Configuration #1", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.convertExternalTestEquipment},
    {mode: this.modeRealTime, pid: "50", bytes: 4, name: "exttest2",     description: "External Test Equipment Configuration #2", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.convertExternalTestEquipment2},
    {mode: this.modeRealTime, pid: "51", bytes: 1, name: "fuel_type",    description: "Fuel Type", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},
    {mode: this.modeRealTime, pid: "52", bytes: 1, name: "alch_pct",     description: "Ethanol fuel %", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "53", bytes: 2, name: "abs_vp",       description: "Absolute Evap system Vapor Pressure", min: 0, max: 327675, unit: "kPa", convertToUseful: this.convertAbsoluteVaporPressure},
    {mode: this.modeRealTime, pid: "54", bytes: 2, name: "system_vp",    description: "Evap system vapor pressure", min: -32767, max: 32767, unit: "Pa", convertToUseful: this.convertSystemVaporPressure},
    {mode: this.modeRealTime, pid: "55", bytes: 2, name: "s02b13",       description: "Short term secondary oxygen sensor trim bank 1 and bank 3", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertShortOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "56", bytes: 2, name: "l02b13",       description: "Long term secondary oxygen sensor trim bank 1 and bank 3", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertShortOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "57", bytes: 2, name: "s02b24",       description: "Short term secondary oxygen sensor trim bank 2 and bank 4", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertShortOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "58", bytes: 2, name: "l02b24",       description: "Long term secondary oxygen sensor trim bank 2 and bank 4", min: -100, max: 99.22, unit: "%", convertToUseful: this.convertShortOxygenSensorOutput},
    {mode: this.modeRealTime, pid: "59", bytes: 2, name: "frp_abs",      description: "Fuel rail pressure (absolute)", min: 0, max: 655350, unit: "kPa", convertToUseful: this.convertFuelRailPressureAbs},
    {mode: this.modeRealTime, pid: "5A", bytes: 1, name: "pedalpos",     description: "Relative accelerator pedal position", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "5B", bytes: 1, name: "hybridlife",   description: "Hybrid battery pack remaining life", min: 0, max: 100, unit: "%", convertToUseful: this.convertPercentA},
    {mode: this.modeRealTime, pid: "5C", bytes: 1, name: "engineoilt",   description: "Engine oil temperature", min: -40, max: 210, unit: "°C", convertToUseful: this.convertTemp},
    {mode: this.modeRealTime, pid: "5D", bytes: 2, name: "finjtiming",   description: "Fuel injection timing", min: -210.00, max: 301.992, unit: "°", convertToUseful: this.convertFuelInjectionTiming},
    {mode: this.modeRealTime, pid: "5E", bytes: 2, name: "enginefrate",  description: "Engine fuel rate", min: 0, max: 3212.75, unit: "L/h", convertToUseful: this.convertEngineFuelRate},
    {mode: this.modeRealTime, pid: "5F", bytes: 1, name: "emmissionreq", description: "Emission requirements to which vehicle is designed", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: this.bitDecoder},

    //added some new pid entries
    {mode: this.modeRealTime, pid: "62", bytes: 1, name: "aet",          description: "Actual engine - percent torque", min: -125, max: 125, unit: "%", convertToUseful: this.convertEngineTorque},
    {mode: this.modeRealTime, pid: "67", bytes: 3, name: "ect",          description: "Engine coolant temperature", min: -40, max: 215, unit: "Celsius"},
    {mode: this.modeRealTime, pid: "6B", bytes: 5, name: "egrt",         description: "Exhaust gas recirculation temperature", min: -40, max: 215, unit: "Celsius"},
    {mode: this.modeRealTime, pid: "6D", bytes: 6, name: "fpc",          description: "Fuel pressure control system", min: -40, max: 215, unit: "Celsius"},
    {mode: this.modeRealTime, pid: "6E", bytes: 5, name: "ipct",         description: "Injection pressure control system", min: -40, max: 215, unit: "Celsius"},
    {mode: this.modeRealTime, pid: "73", bytes: 5, name: "ep",           description: "Exhaust pressure", min: -40, max: 215, unit: "Celsius"},
    {mode: this.modeRealTime, pid: "78", bytes: 9, name: "egt",          description: "Exhaust Gas temperature Bank 1", min: -40, max: 215, unit: "Celsius", convertToUseful: this.convertExhastGasTemperature},



    //DTC's
    {mode: this.modeRequestDTC, pid: undefined, bytes: 6, name: "requestdtc", description: "Requested DTC", convertToUseful: this.convertDTCRequest}, //n*6 --> For each code, 6 bytes.
    {mode: this.modeClearDTC, pid: undefined, bytes: 0, name: "cleardtc", description: "Clear Trouble Codes (Clear engine light)", convertToUseful: this.notSupported},

    //VIN
    {mode: this.modeVin, pid: "00", bytes: 4, name: "vinsupp0", description: "Vehicle Identification Number", convertToUseful: this.bitDecoder},
    {mode: this.modeVin, pid: "01", bytes: 1, name: "vin_mscout", description: "VIN message count", convertToUseful: this.convertVIN_count},
    {mode: this.modeVin, pid: "02", bytes: 1, name: "vin", description: "Vehicle Identification Number", convertToUseful: this.convertVIN}
];


}
