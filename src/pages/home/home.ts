import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';


/*
declare var sqlDB:any;
declare var cordova:any;
*/
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  dbpath = "Android/data/nodomain.freeyourgadget.gadgetbridge/files/Gadgetbridge";
    
  testresult1 = '..';
  testresult2 = '..';
  db;

  constructor(private file: File, public navCtrl: NavController, private sqlite: SQLite) {
    console.log('gab- constructor');
  }

  copyDB(){
    //deprecated!
    this.testresult1 += '| copyDB |'
    console.log('gab- copyDB1');
    let dbname='Gadgetbridge';
    let location= 0;
    let source = this.dbpath; // "/storage/emulated/0/Android/data/nodomain.freeyourgadget.gadgetbridge/files/Gadgetbridge";
    let deleteOldDb = true;

    alert(this.dbpath);
    
    (<any>window).plugins.sqlDB.copyDbFromStorage(dbname, location, source, deleteOldDb, this.success, this.dberror);
    //cordova.plugins.sqlDB.copyDbFromStorage(dbname, location, source, deleteOldDb, this.success, this.dberror);
    //sqlDB.copyDbFromStorage(dbname, location, source, deleteOldDb, this.success, this.dberror);
    this.testresult1 += '| copyDB succeeded!!|';
    console.log('gab- copyDB2- after...');
  }

  copyDBcheck(){
    //https://www.bountysource.com/issues/22433637-setting-path-of-db

    this.file.checkDir(this.file.applicationStorageDirectory, "databases")
        .then(success=> {
            this.copyDB2(); // see the function definition above
        }).catch( err => {
            this.file.createDir(this.file.applicationStorageDirectory, "databases", false)
                .then((success) => {
                    this.copyDB2(); // see the function definition above
                }).catch((err) => {
                    alert("errrrrror in createDir"); // error
                });
        });
  }


  copyDB2(){
    this.file.checkFile(this.file.externalRootDirectory, this.dbpath)
        .then((success) => {
            this.file.copyFile(this.file.externalRootDirectory, this.dbpath, this.file.applicationStorageDirectory +"/databases/", "Gadgetbridge")
                .then((success) => {
                    // success
                    alert("YAAAA!!!");
                }).catch((error) => {
                  alert("NEEEEEEIN!!!");
                    //error
                });
        }).catch((error) => {
            alert("neee...");
            //error
        });
  }

  readExternalDB(){
    console.log('gab-readDBexternal!');
    this.testresult1 += '| readDB external|'
    // OPTION B: Create a new instance of SQLite

    let path = this.dbpath;

    this.sqlite.create({name:path, location:'default'}).then((db)=> {
      this.db = db;
      console.log('gab-readDBext! - 2 ');
      
    let sqltext = `
select SUM(STEPS) as daysteps, datetime(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp > strftime('%s','now','-' || 78 ||' days'))
group by timestamp/(3600*24)`;
      db.executeSql(sqltext, {}).then((result) => {

        console.log('gab-readDB - executed! results are here', JSON.stringify(result));
        this.testresult1 = JSON.stringify(result);
        this.testresult2 = '|';
        for (var row of result.rows) {
          console.log(row); //of: items of the array; in: indexes of the array
          //this.testresult2 += row.datum + ' : ' + row.daysteps + ' || '
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
where (timestamp > strftime('%s','now','-' || 71 ||' days'))
group by timestamp/(3600*24)`;
      db.executeSql(sqltext, {}).then((result) => {

        console.log('gab-readDB - executed! results are here', JSON.stringify(result));
        this.testresult1 = JSON.stringify(result);
        this.testresult2 = '|';
        for (var row of result.rows) {
          console.log(row); //of: items of the array; in: indexes of the array
          //this.testresult2 += row.datum + ' : ' + row.daysteps + ' || '
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


}
