import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { File } from '@ionic-native/file';

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

  testresult1 = '..';
  testresult2 = '..';

  constructor(private file: File, public navCtrl: NavController, private sqlite: SQLite,private toast: Toast) {
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
        let len = results.rows.length, i;
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




  readDBandgiveBackTable(sqlText:string){
    //input: complete SQL
    //output: data = [[row],[row]] or ....

      this.db.executeSql(sqlText, {}).then((result) => {

        console.log('gab-readDB - executed! results are here', JSON.stringify(result));
        this.testresult1 = JSON.stringify(result);
        this.testresult2 = '|';
        for (var row of result.rows.items) {
          console.log(row); //of: items of the array; in: indexes of the array
          //this.testresult2 += row.datum + ' : ' + row.daysteps + ' || '
        }

        for(let x = 0; x < result.rows.length; x++) {
            console.log("Daysteps: " + result.rows.item(x).daysteps +
                ", datum: " + result.rows.item(x).acctNo);
            this.testresult2 += "Daysteps: " + result.rows.item(x).daysteps + ", datum: " + result.rows.item(x).datum;
        }

      }, (err) => {
        console.error('Unable to execute sql: ', err);
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
}
