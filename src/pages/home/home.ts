import { ReadDB } from '../read-db/read-db';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';
import { Toast } from '@ionic-native/toast';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  dbpath = "Android/data/nodomain.freeyourgadget.gadgetbridge/files/Gadgetbridge";
    

  constructor(private file: File, public navCtrl: NavController, private sqlite: SQLite,private toast: Toast) {
    console.log('gab- constructor');
  }

  copyDBcheck(){
    //https://www.bountysource.com/issues/22433637-setting-path-of-db

    this.file.checkDir(this.file.applicationStorageDirectory, "databases")
        .then(success=> {
            this.copyDB(); // see the function definition above
        }).catch( err => {
            this.file.createDir(this.file.applicationStorageDirectory, "databases", false)
                .then((success) => {
                    this.copyDB(); // see the function definition above
                }).catch((err) => {
                    console.log('Error creating directory')
                    this.toast.show('Error creating directory', '1800', 'bottom') // error
                });
        });
  }

  copyDB(){
    this.file.checkFile(this.file.externalRootDirectory, this.dbpath)
        .then((success) => {
            this.file.copyFile(this.file.externalRootDirectory, this.dbpath, this.file.applicationStorageDirectory +"/databases/", "Gadgetbridge")
                .then((success) => {
                    // success
                    //alert("YAAAA!!!");
                    this.toast.show('Database copied successfully!', '3800', 'bottom').subscribe(
                      toast => {
                        console.log(toast);
                      });
                    this.navCtrl.push(ReadDB);
                }).catch((error) => {
                  alert("Error copying Database!!");
                    //error
                });
        }).catch((error) => {
            alert("Error copying Database - Database doesn't exist!");
            //error
        });
  }





}
