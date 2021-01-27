import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StatesData} from './interfaces';
import {StateData} from './states-map/states-map.component';
import {BaseChartDirective, Label, MultiDataSet} from 'ng2-charts';
import {ChartDataSets, ChartOptions} from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(BaseChartDirective) myChart: BaseChartDirective;

  startDate: Date;
  endDate: Date;

  title = 'covid-info';
  population = {
    AL: 4921532, AK: 731158, AZ: 7421401, AR: 3030522, CA: 39368078, CO: 5807719, CT: 3557006, DE: 986809,
    DC: 712816, FL: 21733312, GA: 10710017, HI: 1407006, ID: 1826913, IL: 12587530, IN: 6754953, IA: 3163561, KS: 2913805,
    KY: 4477251, LA: 4645318, ME: 1350141, MD: 6055802, MA: 6893574, MI: 9966555, MN: 5657342, MS: 2966786, MO: 6151548,
    MT: 1080577, NE: 1937552, NV: 3138259, NH: 1366275, NJ: 8882371, NM: 2106319, NY: 19336776, NC: 10600823,
    ND: 765309, OH: 11693217, OK: 3980783, OR: 4241507, PA: 12783254, RI: 1057125, SC: 5218040, SD: 892717,
    TN: 6886834, TX: 29360759, UT: 3249879, VT: 623347, VA: 8590563, WA: 7693612, WV: 1784787, WI: 5832655, WY: 582328,
    US: 329484123,
  }

  stateNames = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
    DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
    MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
    RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
    WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', US: "United States"
  }

  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
    'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
    'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  statesAndUs = ["US", 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
    'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
    'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
  selectedDataOption:string;
  dataOptions = [
    {
      id: "cases",
      title: "Cases",
    },
    {
      id: "deaths",
      title: "Deaths",
    },
    {
      id: "casesPer100k",
      title: "Cases per 100k",
    },
    {
      id: "deathsPer10M",
      title: "Deaths per 10M",
    },
  ];
  selectedSpread: string;
  spreadOptions = [
    {
      id: "single",
      title: "Today",
    },
    {
      id:"rolling7",
      title: "7 day average",
    },
    {
      id:"rolling14",
      title: "14 day average",
    },
    // {
    //   id:"trend7",
    //   title: "7 day trend",
    // },
    // {
    //   id:"trend14",
    //   title: "14 day trend",
    // },
  ];


  selectedStates: string[];
  oldSelectedStates: string[];
  colors = ["#f44336","#e91e63","#9c27b0","#3f51b5","#2196f3","#00bcd4","#4caf50","#ffeb3b","#ff9800","#ff5722"];

  colorIndex = 0;
  stateData;
  selectedData: StatesData;
  usData: string;
  minDate: Date;
  maxDate: Date;

  mapDate: Date;

  graphOptions: (ChartOptions) = {
    responsive:true,
    tooltips: {
      intersect: false,
      mode: 'index'
    },
    elements:
      {
        point:
          {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 0,
          }
      }
  };
  graphLabels: Label[];
  graphData: ChartDataSets[];

  constructor(private http: HttpClient) {
    this.graphLabels = [];
    this.graphData = [];
    this.oldSelectedStates = [];
    this.selectedStates = [];
    this.selectedDataOption = "cases";
    this.selectedSpread = "single";
    this.stateData = {};
    this.minDate = new Date(2020,0,21);
    this.maxDate = new Date();

    this.startDate = new Date(2021,0,1);
    this.endDate = new Date(2021,0,20);
    this.mapDate = this.endDate;
    this.updateGraphDateRange("2021-01-20");
  }

  getStat(date: Date, state: string){
    let stat: number;
    if(this.selectedSpread == "single"){
      if(state== "US"){
        let data = (this.stateData[this.formatDate(date)] ?? {});
        stat = ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? data.usCases : data.usDeaths) ?? 0;
      }
      else{
        let stateData = ((this.stateData[this.formatDate(date)] ?? {})[state] ?? {});
        stat = ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? stateData.cases : stateData.deaths) ?? 0;
      }
    }
    else if(this.selectedSpread == "rolling7" || this.selectedSpread == "rolling14"){
      let sum = 0;
      let d = new Date(date.getTime());
      for(let i=0; i<(this.selectedSpread == 'rolling7' ? 7 : 14); i++){
        if(state== "US"){
          let data = (this.stateData[this.formatDate(d)] ?? {});
          sum += ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? data.usCases : data.usDeaths) ?? 0;
        }
        else{
          let stateData = ((this.stateData[this.formatDate(d)] ?? {})[state] ?? {});
          sum += ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? stateData.cases : stateData.deaths) ?? 0;
        }
        d.setDate(d.getDate() - 1);
      }
      stat = sum/(this.selectedSpread == 'rolling7' ? 7 : 14);
    }

    if(this.selectedDataOption == "casesPer100k"){
      stat = stat / this.population[state] * 100000;
    }
    else if(this.selectedDataOption == "deathsPer10M"){
      stat = stat/ this.population[state] * 10000000;
    }
    return stat;
  }

  getStateForRange(state: string){
    let data = [];
    let date = new Date(this.startDate.getTime());
    while(date.getTime()<=this.endDate.getTime()){
      data.push(this.getStat(date,state));
      date.setDate(date.getDate() + 1);
    }
    return data;
  }

  async loadData(){
    let date = new Date(this.startDate.getTime());
    if(this.selectedSpread=="rolling14" || this.selectedSpread=="trend14"){
      date.setDate(date.getDate() - 13);
    }
    else if(this.selectedSpread=="rolling7" || this.selectedSpread=="trend7"){
      date.setDate(date.getDate() - 6);
    }
    while(date.getTime()<=this.endDate.getTime()){
      if(this.stateData[this.formatDate(date)]==null){
        let tempData = localStorage.getItem("state/"+this.getYYYYMString(date));
        if(tempData == null){
          let data: any;
          data = await this.http.get("http://localhost:4201/data/state/"+this.getYYYYMString(date)+".json").toPromise();
          if(data.final==true){
            localStorage.setItem("state/"+this.getYYYYMString(date),JSON.stringify(data));
          }
          this.stateData = {...this.stateData, ...data}
        }
        else{
          this.stateData = {...this.stateData, ...JSON.parse(tempData)}
        }
      }
      date.setDate(date.getDate() + 1);
    }
  }

  //do everything from scratch
  async updateGraphDateRange(end){
    if(end==null || end==""){
      return;
    }
    await this.loadData();
    this.graphLabels = [];
    this.graphData = [];
    let date = new Date(this.startDate.getTime());
    while(date.getTime()<=this.endDate.getTime()){
      this.graphLabels.push(this.formatDate(date));
      date.setDate(date.getDate() + 1);
    }
    for(let state of this.selectedStates){
      let color = this.getColor();
      this.graphData.push({data:this.getStateForRange(state), label: state, backgroundColor: color+"50", borderColor: color+"dd"});
    }
    this.oldSelectedStates = [...this.selectedStates];
    this.updateMap();
  }

  //Update the numbers of the graphs (cases vs deaths vs casesPer100k, etc)
  updateGraphDataType(){
    for(let data of this.graphData){
      data.data = this.getStateForRange(data.label);
    }
    this.updateMap();
  }

  //today, rolling7, rolling14, etc
  async updateGraphDataStat(){
    await this.loadData();
    for(let data of this.graphData){
      data.data = this.getStateForRange(data.label);
    }
    this.updateMap();
  }

  //update the states in the dataset
  updateGraphDataStates(){
    let removed = [];
    for(let old of this.oldSelectedStates){
      if(this.selectedStates.indexOf(old)==-1){
        removed.push(old);
      }
    }
    let added = [];
    for(let sel of this.selectedStates){
      if(this.oldSelectedStates.indexOf(sel)==-1){
        added.push(sel);
      }
    }
    for(let add of added){
      let color = this.getColor();
      this.graphData.push({data:this.getStateForRange(add), label: add, backgroundColor: color+"50", borderColor: color+"dd"});
    }
    for(let remove of removed){
      let index = this.graphData.findIndex((el) => el.label==remove);
      this.graphData.splice(index,1);
      // }
    }
    this.oldSelectedStates = [...this.selectedStates];
  }

  getColor(): string{
    let color = this.colors[this.colorIndex];
    this.colorIndex++;
    if(this.colorIndex == this.colors.length){
      this.colorIndex = 0;
    }
    return color;
  }

  chartClicked(e){
    let elements: any[];
    elements = this.myChart.chart.getElementsAtXAxis(e.event);
    if(elements.length==0){
      return;
    }
    // console.log(this.graphLabels[elements[0]._index]);
  }

  getPreviousDay(date) {
    let d = new Date(date.getTime());
    d.setDate(d.getDate() - 1);
    return d;
  }

  getYYYYMString(d:Date): string{
    let date = this.formatDate(d);
    let ymd = date.split("-")
    return ymd[0]+'-'+ymd[1];
  }

  formatDate(d:Date): string{
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    let year = d.getFullYear().toString();
    if (month.length < 2){
      month = '0' + month;
    }
    if (day.length < 2){
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }

  slope(arr){
    let sumX = 0;
    let sumY = 0;
    let sumX2 = 0;
    let sumXY = 0;
    let n = arr.length;
    for(let i=0; i<n; i++){
      sumX += i;
      sumY += arr[i];
      sumX2 += i * i;
      sumXY += i * arr[i];
    }
    return (n*sumXY - sumX * sumY)/(n*sumX2 - sumX*sumX);
  }

  updateMap(){
    let usTotal = this.getStat(this.mapDate, "US");
    this.selectedData = {};
    for(let s of this.states){
      let val = this.getStat(this.mapDate, s);
      let hex = "ff";
      if(this.selectedDataOption=="cases" || this.selectedDataOption=="deaths"){
        let adjustedValue = Math.round(255 - val/usTotal*255.0 * 7.0);
        if(adjustedValue<0){
          adjustedValue = 0;
        }
        hex = adjustedValue.toString(16);
        if(hex.length==1){
          hex = "0"+hex;
        }
      }
      else{
        let adjustedValue = Math.round(255 - val * (this.selectedDataOption=="casesPer100k" ? 2.5 : 1));
        if(adjustedValue<0){
          adjustedValue = 0;
        }
        hex = adjustedValue.toString(16);
        if(hex.length==1){
          hex = "0"+hex;
        }
      }
      this.selectedData[s] = {
        value: val.toFixed((this.selectedDataOption == "casesPer100k" || this.selectedDataOption == "deathsPer10M") ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          +' '+ ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? "cases" : "deaths"),
        color: "#ff" + hex + hex
      }
    }
    this.usData = usTotal.toFixed((this.selectedDataOption == "casesPer100k" || this.selectedDataOption == "deathsPer10M") ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      +' '+ ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? "cases" : "deaths")
  }

  // async graphSetup(){
  //   for(let i=0; i<this.graphData.length; i++){
  //     let data = this.graphData[i];
  //     if((data?.data?.length || 0)==0){
  //       this.graphData.splice(i,1);
  //     }
  //   }
  //   let removed = [];
  //   for(let old of this.oldSelectedStates){
  //     if(this.selectedStates.indexOf(old)==-1){
  //       removed.push(old);
  //     }
  //   }
  //   let added = [];
  //   for(let sel of this.selectedStates){
  //     if(this.oldSelectedStates.indexOf(sel)==-1){
  //       added.push(sel);
  //     }
  //   }
  //   let daysBack = 207;
  //   let date = new Date(this.date.getTime());
  //   for(let i=0; i<daysBack; i++){
  //     date = this.getPreviousDay(date);
  //     if(this.stateData[this.formatDate(date)]==null){
  //       let tempData = localStorage.getItem("state/"+this.getYYYYMString(date));
  //       if(tempData == null){
  //         let data: any;
  //         data = await this.http.get("http://localhost:4201/data/state/"+this.getYYYYMString(date)+".json").toPromise();
  //         if(data.final==true){
  //           localStorage.setItem("state/"+this.getYYYYMString(this.date),JSON.stringify(data));
  //         }
  //         this.stateData = {...this.stateData, ...data}
  //       }
  //       else{
  //         this.stateData = {...this.stateData, ...JSON.parse(tempData)}
  //       }
  //     }
  //   }
  //   // this.graphData = [];
  //   date = new Date(this.date.getTime());
  //   date.setDate(date.getDate() - daysBack);
  //   this.graphLabels = [];
  //   for(let i=0; i<daysBack+1; i++){
  //     this.graphLabels.push(this.formatDate(date));
  //     date.setDate(date.getDate() + 1);
  //   }
  //   for(let add of added){
  //     console.log(add);
  //     date = new Date(this.date.getTime());
  //     date.setDate(date.getDate() - daysBack);
  //     let index = this.graphData.length;
  //     let color = this.getColor();
  //     this.graphData.push({data:[], label: add, backgroundColor: color+"50", borderColor: color+"dd"});
  //     for(let i=0; i<daysBack+1; i++){
  //       let data = this.stateData[this.formatDate(date)];
  //       this.graphData[index].data.push(data[add].cases);
  //       date.setDate(date.getDate() + 1);
  //     }
  //   }
  //   for(let remove of removed){
  //     console.log(remove);
  //     let index = this.graphData.findIndex((el) => el.label==remove);
  //     this.graphData.splice(index,1);
  //     // }
  //   }
  //   console.log(this.graphData);
  //   this.oldSelectedStates = [...this.selectedStates];
  // }

  // updateSelectedSpread(val){
  //   this.selectedSpread = val;
  //   this.setDate(this.date);
  // }

  // updateSelectedData(val){
  //   this.selectedDataOption = val;
  //   this.selectedData = {
  //     title: "TODO"
  //   };
  //   this.usData = "None";
  //   let data = this.stateData[this.formatDate(this.date)];
  //   if(data==null){
  //     return;
  //   }
  //   if(val=="cases" || val=="deaths"){
  //     let usTotal = (val=="cases" ? data.usCases : data.usDeaths) ?? 0;
  //     if(this.selectedSpread != "single") {
  //       let daysBack = this.selectedSpread == "rolling14" ? 13 : 6;
  //       let date = new Date(this.date.getTime());
  //       for(let i=0; i<daysBack; i++){
  //         date = this.getPreviousDay(date);
  //         usTotal += (val=="cases" ? this.stateData[this.formatDate(date)].usCases : this.stateData[this.formatDate(date)].usDeaths) ?? 0;
  //       }
  //       usTotal = usTotal/(this.selectedSpread=="rolling14" ? 14.0 : 7.0);
  //     }
  //     this.usData = usTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' '+val
  //     for(let s of this.states){
  //       let stateData: StateData;
  //       stateData = data[s] ?? {};
  //
  //       let stateCount = (val=="cases" ? stateData.cases : stateData.deaths) ?? 0;
  //       if(this.selectedSpread != "single") {
  //         let daysBack = this.selectedSpread == "rolling14" ? 13 : 6;
  //         let date = new Date(this.date.getTime());
  //         for(let i=0; i<daysBack; i++){
  //           date = this.getPreviousDay(date);
  //           let dayData = this.stateData[this.formatDate(date)];
  //           if(dayData==null){
  //             continue;
  //           }
  //           let stateDayData: StateData;
  //           stateDayData = dayData[s] ?? {};
  //           stateCount += (val=="cases" ? stateDayData.cases: stateDayData.deaths) ?? 0;
  //         }
  //         stateCount = stateCount/(this.selectedSpread=="rolling14" ? 14.0 : 7.0);
  //       }
  //       let adjustedValue = Math.round(255 - stateCount/usTotal*255.0 * 7.0);
  //       if(adjustedValue<0){
  //         adjustedValue = 0;
  //       }
  //       let hex = adjustedValue.toString(16);
  //       if(hex.length==1){
  //         hex = "0"+hex;
  //       }
  //       this.selectedData[s] = {
  //         value: stateCount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' '+val,
  //         color: "#ff" + hex + hex
  //       }
  //     }
  //   }
  //   else if(val=="casesPer100k" || val=="deathsPer10M"){
  //     let usTotal = (val=="casesPer100k" ? data.usCases : data.usDeaths) ?? 0;
  //     if(this.selectedSpread != "single") {
  //       let daysBack = this.selectedSpread == "rolling14" ? 13 : 6;
  //       let date = new Date(this.date.getTime());
  //       for(let i=0; i<daysBack; i++){
  //         date = this.getPreviousDay(date);
  //         usTotal += (val=="casesPer100k" ? this.stateData[this.formatDate(date)].usCases : this.stateData[this.formatDate(date)].usDeaths) ?? 0;
  //       }
  //       usTotal = usTotal/(this.selectedSpread=="rolling14" ? 14.0 : 7.0);
  //     }
  //     this.usData = (usTotal/this.population.US*(val=="casesPer100k" ? 100000 : 10000000)).toFixed(2)+""+(val=="casesPer100k" ? "/100k" : "/10M");
  //     for(let s of this.states){
  //       let stateData: StateData;
  //       stateData = data[s] ?? {};
  //
  //       let stateCount = (val=="casesPer100k" ? stateData.cases : stateData.deaths) ?? 0;
  //       if(this.selectedSpread != "single") {
  //         let daysBack = this.selectedSpread == "rolling14" ? 13 : 6;
  //         let date = new Date(this.date.getTime());
  //         for(let i=0; i<daysBack; i++){
  //           date = this.getPreviousDay(date);
  //           let dayData = this.stateData[this.formatDate(date)];
  //           if(dayData==null){
  //             continue;
  //           }
  //           let stateDayData: StateData;
  //           stateDayData = dayData[s] ?? {};
  //           stateCount += (val=="casesPer100k" ? stateDayData.cases: stateDayData.deaths) ?? 0;
  //         }
  //         stateCount = stateCount/(this.selectedSpread=="rolling14" ? 14.0 : 7.0);
  //       }
  //       let dataPer = stateCount/this.population[s]*(val=="casesPer100k" ? 100000 : 10000000);
  //       console.log(dataPer);
  //       let adjustedValue = Math.round(255 - dataPer * (val=="casesPer100k" ? 2.5 : 1));
  //       if(adjustedValue<0){
  //         adjustedValue = 0;
  //       }
  //       let hex = adjustedValue.toString(16);
  //       if(hex.length==1){
  //         hex = "0"+hex;
  //       }
  //       this.selectedData[s] = {
  //         value: dataPer.toFixed(2)+""+(val=="casesPer100k" ? "/100k" : "/10M"),
  //         color: "#ff" + hex + hex
  //       }
  //     }
  //   }
  // }

  // async setDate(newDate: Date): Promise<void>{
  //   this.date = newDate;
  //   console.log(this.date);
  //   console.log(this.formatDate(this.date));
  //   if(this.stateData[this.formatDate(this.date)]==null){
  //     let tempData = localStorage.getItem("state/"+this.getYYYYMString(this.date));
  //     if(tempData == null){
  //       let data: any;
  //       data = await this.http.get("http://localhost:4201/data/state/"+this.getYYYYMString(this.date)+".json").toPromise();
  //       if(data.final==true){
  //         localStorage.setItem("state/"+this.getYYYYMString(this.date),JSON.stringify(data));
  //       }
  //       this.stateData = {...this.stateData, ...data}
  //     }
  //     else{
  //       this.stateData = {...this.stateData, ...JSON.parse(tempData)}
  //     }
  //   }
  //   if(this.selectedSpread != "single"){
  //    let daysBack = (this.selectedSpread=="rolling14" || this.selectedSpread=="trend14") ? 13 : 6;
  //    let date = new Date(this.date.getTime());
  //    for(let i=0; i<daysBack; i++){
  //      date = this.getPreviousDay(date);
  //      if(this.stateData[this.formatDate(date)]==null){
  //        let tempData = localStorage.getItem("state/"+this.getYYYYMString(date));
  //        if(tempData == null){
  //          let data: any;
  //          data = await this.http.get("http://localhost:4201/data/state/"+this.getYYYYMString(date)+".json").toPromise();
  //          if(data.final==true){
  //            localStorage.setItem("state/"+this.getYYYYMString(this.date),JSON.stringify(data));
  //          }
  //          this.stateData = {...this.stateData, ...data}
  //        }
  //        else{
  //          this.stateData = {...this.stateData, ...JSON.parse(tempData)}
  //        }
  //      }
  //     }
  //   }
  //   this.updateSelectedData(this.selectedDataOption);
  //   await this.graphSetup();
  // }

}
