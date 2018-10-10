import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { BluetoothPage } from '../../pages/bluetooth/bluetooth';
import { SeleccionSkinPage } from '../../pages/seleccion-skin/seleccion-skin';

/**
 * Generated class for the SeleccionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-seleccion',
  templateUrl: 'seleccion.html',
})
export class SeleccionPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SeleccionPage');
  }
  abrirOBD(){
    //alert('abrir obd');
    this.navCtrl.push(BluetoothPage, {operacion: 'OBD'});
  }
  abrirGPS(){
    //alert('abrir gps');
    this.navCtrl.push(SeleccionSkinPage, {operacion: 'GPS'});
  }

}
