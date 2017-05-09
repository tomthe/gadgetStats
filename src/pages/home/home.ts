import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';

declare var sqlDB:any;
declare var cordova:any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  dbpath = "/storage/emulated/0/Android/data/nodomain.freeyourgadget.gadgetbridge/files/Gadgetbridge";
    
  testresult1 = '..';
  testresult2 = '..';
  db;

  constructor(public navCtrl: NavController, private sqlite: SQLite) {

  }

  copyDB(){
    console.log('copyDB2')
    let dbname='Gadgetbridge';
    let location= 0;
    let source = this.dbpath; // "/storage/emulated/0/Android/data/nodomain.freeyourgadget.gadgetbridge/files/Gadgetbridge";
    let deleteOldDb = true;
    
    //(<any>window).plugins.sqlDB.copyDbFromStorage(dbname, location, source, deleteOldDb, this.success, this.dberror);
    cordova.plugins.sqlDB.copyDbFromStorage(dbname, location, source, deleteOldDb, this.success, this.dberror);
    //sqlDB.copyDbFromStorage(dbname, location, source, deleteOldDb, this.success, this.dberror);
  }


  success(){
    alert('yo!');
  }
  dberror(e){
    alert('och nö!');
    alert(JSON.stringify(e));
  }


  readDB(){
    // OPTION B: Create a new instance of SQLite
    this.sqlite.create({name:'Gadgetbridge', location:'default'}).then((db)=> {
      this.db = db;
      
    let sqltext = `
select SUM(STEPS) as daysteps, datetime(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp > strftime('%s','now','-' || 7 ||' days'))
group by timestamp/(3600*24)`;
      db.executeSql(sqltext, {}).then((result) => {
        this.testresult1 = JSON.stringify(result);
        this.testresult2 = '|'
        for (var row of result.rows) {
          console.log(row); //of: items of the array; in: indexes of the array
          this.testresult2 += row.datum + ' : ' + row.daysteps + ' || '
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

/*
  readDB2(){
    // OPTION B: Create a new instance of SQLite
    let db = new SQLite();
    db.openDatabase({
      name: 'Gadgetbridge',
      location: 'default' // the location field is required
    }).then(() => {
    let sqltext = `
select SUM(STEPS) as daysteps, datetime(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp > strftime('%s','now','-' || 7 ||' days'))
group by timestamp/(3600*24)`;
      db.executeSql(sqltext, {}).then((result) => {
        this.testresult1 = JSON.stringify(result);
        this.testresult2 = '|'
        for (var row of result.rows) {
          console.log(row); //of: items of the array; in: indexes of the array
          this.testresult2 += row.datum + ' : ' + row.daysteps + ' || '
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
*/

}
