import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the Chart page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
//@IonicPage()
@Component({
  selector: 'page-chart',
  templateUrl: 'chart.html',
})
export class Chart {

  chartOption = {};

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.chartOption = this.navParams.get('chartOption');
    console.log(this.chartOption)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Chart');
  }

}
