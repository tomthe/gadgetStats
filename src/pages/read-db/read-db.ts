import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { File } from '@ionic-native/file';

import * as moment from 'moment';

/**
 * Generated class for the ReadDB page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-read-db',
  templateUrl: 'read-db.html',
})
export class ReadDB {

  db;
  chartOption = {};

  testresult1 = '..';
  testresult2 = '..';

  dateStart = '2017-02-01';
  dateEnd = '2017-03-01';
  

  constructor(private file: File, public navCtrl: NavController, private sqlite: SQLite,private toast: Toast) {
    this.setCahrt1();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadDB');
  }


  readDB(){
    console.log('gab-readDB!');
    this.testresult1 += '| readDB |'
    // OPTION B: Create a new instance of SQLite
    this.sqlite.create({name:'Gadgetbridge', location:'default'}).then((db)=> {
      this.db = db;
      console.log('gab-readDB! - 2 ');
      
    let sqltext = `
select SUM(STEPS) as daysteps, datetime(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp > strftime('%s','now','-' || 88 ||' days'))
group by timestamp/(3600*24)`;
      db.executeSql(sqltext, {}).then((result) => {

        console.log('gab-readDB - executed! results are here', JSON.stringify(result));

        this.testresult1 = JSON.stringify(result);
        this.testresult2 = '|';
        for (var row of result.rows.items) {
          console.log("row: ", row); //of: items of the array; in: indexes of the array
          //this.testresult2 += row.datum + ' : ' + row.daysteps + ' || '
        }

        for(let x = 0; x < result.rows.items.length; x++) {
            console.log("Daysteps: " + result.rows.item(x).daysteps +
                ", datum: " + result.rows.item(x).acctNo);
            this.testresult2 += "Daysteps: " + result.rows.item(x).daysteps + ", datum: " + result.rows.item(x).datum;
        }

      }, (err) => {
        console.error('Unable to execute sql: ', err);
        this.dberror(err);
      });
    }, (err) => {
      console.error('Unable to open database: ', err);
        this.dberror(err);
    });
  }

  read3(){
    let sqltext = `
select SUM(STEPS) as daysteps, datetime(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp > strftime('%s','now','-' || 88 ||' days'))
group by timestamp/(3600*24)`;
    this.read2(sqltext);
  }

  read2(sqltext){
    let rowCount='rc:';
    this.db.transaction((transaction) => {
      transaction.executeSql(sqltext, [], (tx, results) => {
        let len = results.rows.length;
        rowCount+=(len);
        for (let i = 0; i < len; i++){
          console.log('item i:', results.rows.item(i));
          this.testresult1 += "\n | " + results.rows.item(i).datum + " - " + results.rows.item(i).daysteps + " ; ";
//          $("#TableData").append("<tr><td>"+results.rows.item(i).id+"</td><td>"+results.rows.item(i).title+"</td><td>"+results.rows.item(i).desc+"</td></tr>");
        }
       for (let i = 0; i < len; i++){
          console.log('item i:', results.rows.item(i)[0]);
          this.testresult1 += "\n | " + results.rows.item(i)[0]+ " - " + results.rows.item(i).daysteps + " ; ";
//          $("#TableData").append("<tr><td>"+results.rows.item(i).id+"</td><td>"+results.rows.item(i).title+"</td><td>"+results.rows.item(i).desc+"</td></tr>");
        }
      }, null);
    });



  }




  readDBandgiveBackTable(sqlText:string, sqlParameters, columns=['value1']){
    //input: complete SQL
    //output: data = [[row],[row]] or ....
    let data = [];

    return this.db.executeSql(sqlText, sqlParameters).then((result) => {
      console.log('gab-readDB - executed! results are here', JSON.stringify(result));

      for(let x = 0; x < result.rows.length; x++) {
          console.log("row: ", result.rows.item(x));
          let row = [];
          for(let col of columns){
            console.log(col, columns);
            row.push(result.rows.item(x)[col]);
          }
          data.push(row);//result.rows.item(x)
      }
      return data;
    }, (err) => {
      console.error('Unable to execute sql: ', err);
      this.dberror(err);
    });

  }

  showSteptsPerDay(){
    let sqlText = `select SUM(STEPS) as daysteps, datetime(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp between strftime('%s','now','-:start days') and strftime('%s','now','-:end days'))
group by timestamp/(3600*24);`

    let startDays = moment().diff(moment(this.dateStart),'days');
    let endDays = moment().diff(moment(this.dateEnd),'days');
    console.log(startDays, endDays);

    let parameters = [startDays.toString(),endDays.toString(), '22'];
    let parameters2 = {'start':startDays.toString(),'end':endDays.toString()};
    let columns = ['datum','daysteps'];

    let data = this.readDBandgiveBackTable(sqlText, parameters2, columns).then(res=>{
      console.log('results:')
      console.log(res)
      let seriesData1 = res.map(x=> x[1]);
      let seriesxAxis= res.map(x=> x[0]);
      console.log(seriesData1)
      console.log(seriesxAxis)
      this.showSimpleChart1(seriesxAxis,seriesData1);
    });
  }

  showSimpleChart1(seriesxAxis,seriesData1){
    
    this.chartOption = {
      title: {
        text: 'Test Chart'
      },
      tooltip : {
        trigger: 'axis'
      },
      dataZoom: {
          show: true,
          start : 60,
          end : 100
      },
      legend: {
        data:['Steps per day']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
        data:seriesxAxis
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'Steps per day',
          type:'line',
          stack: 'jey',
          areaStyle: {normal: {}},
          data:seriesData1
        }
      ]
    };

  }

  setCahrt1() {

    this.chartOption = {
      title: {
        text: 'Test Chart'
      },
      tooltip : {
        trigger: 'axis'
      },
      dataZoom: {
          show: true,
          start : 30,
          end : 70
      },
      legend: {
        data:['einse','zweise','dreise','vierse']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
        data:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'einse',
          type:'line',
          stack: 'jey',
          areaStyle: {normal: {}},
          data:[10, 32, 41, 54, 66, 77, 88]
        },
        {
          name:'zweise',
          type:'line',
          stack: 'jey',
          areaStyle: {normal: {}},
          data:[130, 110, 111, 80, 70, 50, 20]
        },
        {
          name:'dreise',
          type:'line',
          stack: 'zwo',
          areaStyle: {normal: {}},
          data:[5, 30, 50, 66, 44, 20, 2]
        },
        {
          name:'vierse',
          type:'line',
          stack: 'zwo',
          areaStyle: {normal: {}},
          data:[15,15,15,15,15,15,30]
        }      
      ]
    };

  }


  success(){
    //this.testresult1 += '| success! |';
    console.log('gab- success 4!!');
    alert('yo!');
  }

  dberror(e){
    //this.testresult1 += '| dberror! |';
    console.log('gab- error 5!!',e);
    alert('och nö!');
    alert(JSON.stringify(e));
  }
}
