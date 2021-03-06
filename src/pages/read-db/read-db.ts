import { Chart } from './../chart/chart';
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
  ndays=16;

  dateStart = '2017-02-01';
  dateEnd = '2017-03-01';
  
  constructor(private file: File, public navCtrl: NavController, private sqlite: SQLite,private toast: Toast) {
    this.dateEnd = moment().format('YYYY-MM-DD');
    this.dateStart = moment().subtract(21,'days').format('YYYY-MM-DD');
    this.loadDB();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReadDB');
  }


  loadDB(){
    console.log('loadDB!');
    this.sqlite.create({name:'Gadgetbridge', location:'default'}).then((db)=> {
      this.db = db;
      console.log('db loaded ');
      this.toast.show('Database opened successfully!', '2200', 'bottom').subscribe(
          toast => {
            console.log(toast);
          });
    }, (err) => {
      console.error('Unable to open database: ', err);
        this.dberror(err);
    });
  }

  readDBandgiveBackTable(sqlText:string, sqlParameters, columns=['value1']){
    //input: complete SQL
    //output: data = [[row],[row]] or ....
    let data = [];

    return this.db.executeSql(sqlText, sqlParameters).then((result) => {
      console.log('gab-readDB - executed! results are here', JSON.stringify(result));

      for(let x = 0; x < result.rows.length; x++) {
          //console.log("row: ", result.rows.item(x));
          let row = [];
          for(let col of columns){
            //console.log(col, columns);
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

  openChart(chartOpt){
    this.navCtrl.push(Chart,{'chartOption':chartOpt})
  }

  showStepsPerDay(chartType='calendar'){

    let startDays = moment().diff(moment(this.dateStart),'days').toString();
    let endDays = moment().diff(moment(this.dateEnd),'days').toString();
    console.log(startDays, endDays);

    let sqlText = `select SUM(STEPS) as daysteps, date(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp between strftime('%s','now','-` + startDays + ` days') and strftime('%s','now','-` + endDays + ` days'))
group by timestamp/(3600*24);`

    let parameters = {'start':startDays.toString(),'end':endDays.toString()};
    let columns = ['datum','daysteps'];

    let data = this.readDBandgiveBackTable(sqlText, parameters, columns).then(res=>{
      //console.log('results:')
      //console.log(res)
      if(chartType=='bar'){
        let seriesData1 = res.map(x=> x[1]);
        let seriesxAxis= res.map(x=> x[0]);
        console.log(seriesData1)
        console.log(seriesxAxis)
        this.showSimpleChart1(seriesxAxis,seriesData1);
      } else {

        this.showCalenderChart1(res);
      }
    });
  }

showStepsPerWeek(chartType='bar'){

    let startDays = moment().diff(moment(this.dateStart),'days').toString();
    let endDays = moment().diff(moment(this.dateEnd),'days').toString();
    console.log(startDays, endDays);

    let sqlText = `select SUM(STEPS) as weeksteps, date(ROUND(AVG(timestamp)), 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp between strftime('%s','now','-` + startDays + ` days') and strftime('%s','now','-` + endDays + ` days'))
group by timestamp/(3600*24*7);`

    let parameters = {'start':startDays.toString(),'end':endDays.toString()};
    let columns = ['datum','weeksteps'];

    let data = this.readDBandgiveBackTable(sqlText, parameters, columns).then(res=>{
      //console.log('results:')
      //console.log(res)
      if(chartType=='bar'){
        let seriesData1 = res.map(x=> x[1]);
        let seriesxAxis= res.map(x=> x[0]);
        console.log(seriesData1)
        console.log(seriesxAxis)
        this.showSimpleChart1(seriesxAxis,seriesData1,'Steps per week');
      } else {

        this.showCalenderChart1(res);
      }
    });
  }


  showCalenderChart1(mixedData){

    console.log('show calendar-graph!', mixedData);
    console.log('range: ', this.dateStart, this.dateEnd, mixedData[0][0]);
    let days = moment(this.dateEnd).diff(moment(this.dateStart),'days');
    if(days<0){days= -days;}
    let cellSizeScale = (3800 / days);
    console.log('CellSizeScale: ', cellSizeScale, cellSizeScale*4000/8000, days);

    let chartOption = {
    tooltip: {
        position: 'top'
    },

      calendar: [{
          top: 'middle',
          left: 'center',
          orient: 'vertical',
          cellSize: ['auto','auto'],
          range: [this.dateStart, this.dateEnd]
      }],
      visualMap: {
          min: 0,
          max: 15000,
          calculable: true,
          orient: 'vertical',
          left: '670',
          top: 'center'
      },
      series: [
      {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: mixedData,
          symbolSize: function(val){return cellSizeScale * Math.sqrt(val[1])/60;},
      }]
    };
    this.openChart(chartOption);
  }



  showSimpleChart1(seriesxAxis,seriesData1,legend='Steps per day'){
    
    let chartOption = {
      title: {
        text: legend
      },
      tooltip : {
        trigger: 'axis'
      },
      toolbox: {
          show : true,
          feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar']}
          }
      },
      dataZoom: {
          show: true,
          start : 60,
          end : 100
      },
      legend: {
        data:[legend]
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
          name:legend,
          type:'bar',
          stack: 'jey',
          data:seriesData1,
          markLine : {
              data : [
                  {type : 'average', name: 'Average'}
              ]
          }
        },
      ]
    };
    this.openChart(chartOption);
  }


////////////

  computeAndShowChartWeekHourly(){
    //steps per hour for the last few days
    //like this: https://ecomfe.github.io/echarts-examples/public/editor.html?c=heatmap-cartesian
    // https://ecomfe.github.io/echarts/doc/doc-en.html#SeriesHeatmap

    let ndays = this.ndays;
    //let startDays = moment().diff(moment(this.dateStart),'days').toString();
    let endDays = moment().diff(moment(this.dateEnd),'days').toString();
    let startDays = Number(endDays) + ndays;
    console.log(startDays, endDays);

    let sqlText = `select SUM(STEPS) as hourSteps, round(strftime('%J',ROUND(AVG(timestamp)), 'unixepoch') - strftime('%J','now','-` + startDays + ` days')) as datum, 
    strftime('%H',ROUND(AVG(timestamp)), 'unixepoch') as time,timestamp
from MI_BAND_ACTIVITY_SAMPLE
where (timestamp between strftime('%s','now','-` + startDays + ` days') and strftime('%s','now','-` + endDays + ` days'))
group by timestamp/(3600);`

    let parameters = {'start':startDays.toString(),'end':endDays.toString()};
    let columns = ['time','datum','hourSteps'];

    let data = this.readDBandgiveBackTable(sqlText, parameters, columns).then(res=>{
      console.log('Results week hourly: ',res);
      if(true){

        data = res.map(x=> [Number(x[0]), Number(x[1]), x[2] || '-'])
        let seriesData1 = res.map(x=> x[1]);
        let seriesxAxis= res.map(x=> x[0]);
        console.log(seriesData1)
        console.log(seriesxAxis)
        let days = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14'];
        days = [];
        for(let i=0;i<ndays;i++){
          let day = moment(this.dateEnd).subtract(ndays,'days').add(i,'days').format('dd, MM-DD');
          days.push(day);
        }
        let hours = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
        let option = {
          tooltip: {
              position: 'top'
          },
          animation: false,
          grid: {
              height: '79%',
              y: '4%'
          },
          xAxis: {
              type: 'category',
              data: hours,
              splitArea: {
                  show: true
              }
          },
          yAxis: {
              type: 'category',
              data: days,
              splitArea: {
                  show: true
              }
          },
          visualMap: {
              min: 0,
              max: 3000,
              calculable: true,
              orient: 'horizontal',
              left: 'center',
              bottom: '3%',
              opacity: 0.2,
              inRange: {
                color:  ['#e0d3d8', '#aac', '#f46d43', '#d73027', '#a50026']
              }
          },
          series: [{
              name: 'Steps per Hour',
              type: 'heatmap',
              data: res,
              label: {
                  normal: {
                      show: false
                  }
              },
              itemStyle: {
                  emphasis: {
                      shadowBlur: 10,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              }
          }]
        };
        this.openChart(option);
      }
    });

  }


  async computeAndShowChartRestingHeartRate(){

    let sqlText = `
select HEART_RATE, datetime(timestamp, 'unixepoch') as datum, timestamp
from MI_BAND_ACTIVITY_SAMPLE
where HEART_RATE between 20 and 200
and date(datetime(timestamp+3600*6, 'unixepoch'))=date('now', '-$$$  days')
order by HEART_RATE
LIMIT 1
OFFSET 30`;

    let ndays = this.ndays;
    //let startDays = moment().diff(moment(this.dateStart),'days').toString();
    let endDays = moment().diff(moment(this.dateEnd),'days');
    let startDays = Number(endDays) + ndays;
    console.log(startDays, endDays);


    let columns = ['HEART_RATE','datum'];
    let rows = [];
    let hrdata = [];
    let datumdata = [];
    for(let i=startDays;i>endDays;i--){
      try{
        let sqlTextTemp = sqlText.replace('$$$',i.toString());
        //console.log(i, 'i, sql: ',sqlTextTemp);
        let data =  await this.readDBandgiveBackTable(sqlTextTemp, [], columns);
        data=data[0]; //because we only get one row here.
        //console.log('Results week hourly: ',data);
        rows.push(data);
        hrdata.push(data[0]);
        datumdata.push(data[1]);
            //data = res.map(x=> [Number(x[0]), Number(x[1]), x[2] || '-'])
      } catch(err) {
        console.log('error in for-loop',err)
      }
    }
    //console.log('rows: ', rows, hrdata,datumdata);
    this.showSimpleChart1(datumdata,hrdata,'resting heart rate');
  }


  setCahrt1() {

    this.chartOption = {
    };

  }


  success(){
    console.log('gab- success 4!!');
    alert('yo!');
  }

  dberror(e){
    console.log('gab- error 5!!',e);
    alert('och nö!');
    alert(JSON.stringify(e));
  }
}
