import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { SkinDigitalUnoPage } from '../../pages/skin-digital-uno/skin-digital-uno';

/**
 * Generated class for the SeleccionSkinPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-seleccion-skin',
  templateUrl: 'seleccion-skin.html',
})
export class SeleccionSkinPage {
  estaConectado = false;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.estaConectado = navParams.get('estaConectado');
  }
  AbrirSkinDigitalUno(){
    //abrir la pagina siguiente a la conexión, cambiar esto despues
    /*
    if (this.estaConectado){
      this.navCtrl.push(SeleccionSkinPage, { usuario: this.estaConectado });
    }
    else{
      this.presentToast('No puede seguir, debe conectarse a un dispositivo bluetooth.');
    }
    */
   this.navCtrl.push(SkinDigitalUnoPage, { estaConectado: this.estaConectado });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SeleccionSkinPage');
  }

}
