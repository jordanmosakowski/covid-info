import {Component, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BaseChartDirective, Label,} from 'ng2-charts';
import {ChartDataSets} from 'chart.js';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import * as fipsCountyJson from './fips-county.json';
import {SaveState} from "./interfaces";
import {MatDrawer} from "@angular/material/sidenav";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  fipsData: any = (fipsCountyJson as any).default;

  public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective) myChart: BaseChartDirective;
  @ViewChild("drawer") drawer: MatDrawer;

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
    'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

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

  selectedCounties: string[];
  oldSelectedCounties: string[];
  countyList: string[];

  colors = ["#f44336","#e91e63","#9c27b0","#3f51b5",
    "#2196f3","#00bcd4","#4caf50","#ffeb3b",
    "#ff9800","#ff5722"];

  colorIndex = 0;
  stateData;
  countyData;
  selectedData: any;
  totalData: string;
  minDate: Date;
  maxDate: Date;

  mapDate: Date;

  showCounties: boolean;
  countyState: string;

  graphOptions = {
    responsive:true,
    maintainAspectRatio: false,
    annotation: {
      annotations: [
        {
          id: "dateline",
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: '2021-01-20',
          borderColor: 'black',
          borderWidth: 3,
        },
      ],
    },
    tooltips: {
      intersect: false,
      mode: 'index',
      callbacks: {
        label: function(tooltipItem, data) {
          var label = data.datasets[tooltipItem.datasetIndex].label || '';
          if (label) {
            label += ': ';
          }
          label += (Math.round(tooltipItem.yLabel * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return label;
        }
      }
    },
    elements: {
      point:
        {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 0,
        }
    },
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          suggestedMin: 0,
        }
      }]
    },
  };
  graphLabels: Label[];
  graphData;
  saveStates: SaveState[];

  baseUrl = "https://raw.githubusercontent.com/jordanmosakowski/covid-info/main/";

  constructor(private http: HttpClient) {
    this.showCounties = false;
    this.graphLabels = [];
    this.graphData = [];
    this.saveStates = JSON.parse(localStorage.getItem("saveStates") ?? "[]");

    this.oldSelectedStates = [];
    this.selectedStates = ["US"];

    this.selectedCounties = [];
    this.oldSelectedCounties = [];
    this.countyList = [];

    this.selectedDataOption = "casesPer100k";
    this.selectedSpread = "rolling7";
    this.countyState = "CO";
    this.stateData = {};
    this.countyData = {};
    this.minDate = new Date(2020,0,21);
    this.maxDate = new Date();

    this.startDate = new Date(2021,0,1);
    this.endDate = new Date();
    this.mapDate = this.endDate;
    this.updateGraphDateRange(" ");
  }

  saveCurrentState(){
    let state: SaveState;
    state = {
      start: this.startDate.getTime(),
      end: this.endDate.getTime(),
      dataOption: this.selectedDataOption,
      spread: this.selectedSpread,
      counties: this.showCounties,
      areaList: this.showCounties ? this.selectedCounties : this.selectedStates,
    };
    if(this.showCounties){
      state.countyState = this.countyState;
    }
    this.saveStates.push(state);
    localStorage.setItem("saveStates",JSON.stringify(this.saveStates));
  }

  loadSaveState(state: SaveState){
    this.startDate = new Date(state.start);
    this.endDate = new Date(state.end);
    this.selectedDataOption = state.dataOption;
    this.selectedSpread = state.spread;
    this.showCounties = state.counties;
    if(state.counties){
      this.selectedCounties = state.areaList;
      this.countyState = state.countyState;
      this.oldSelectedCounties = [];
      this.countyList = [];
      for(let fips of Object.keys(this.fipsData)){
        if(this.fipsData[fips].state == this.countyState){
          this.countyList.push(fips);
        }
      }
    }
    else{
      this.selectedStates = state.areaList;
    }
    this.updateGraphDateRange(" ");
  }

  getCountyList(){
    return [this.countyState, ...this.countyList]
  }

  toggleStateCounty(){
    this.showCounties = !this.showCounties;
    if(this.showCounties){
      if(this.countyList.length>0){
        this.updateGraphDateRange(" ");
      }
      else{
        this.changeState();
      }
    }
    else{
      this.updateGraphDateRange(" ");
    }
  }

  changeState(){
    this.selectedCounties = [this.countyState];
    this.oldSelectedCounties = [];
    this.countyList = [];
    for(let fips of Object.keys(this.fipsData)){
      if(this.fipsData[fips].state == this.countyState){
        this.countyList.push(fips);
      }
    }
    this.updateGraphDateRange(" ");
  }

  getStat(date: Date, area: string){
    let stat: number;
    if(this.selectedSpread == "single"){
      if(area== "US"){
        let data = (this.stateData[this.formatDate(date)] ?? {});
        stat = ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? data.usCases : data.usDeaths) ?? 0;
      }
      else{
        if(this.showCounties && area.length>2){
          let countyData = ((this.countyData[this.countyState][this.formatDate(date)] ?? {})[area] ?? {});
          stat = ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? countyData.cases : countyData.deaths) ?? 0;
        }
        else{
          let stateData = ((this.stateData[this.formatDate(date)] ?? {})[area] ?? {});
          stat = ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? stateData.cases : stateData.deaths) ?? 0;
        }
      }
    }
    else if(this.selectedSpread == "rolling7" || this.selectedSpread == "rolling14"){
      let sum = 0;
      let d = new Date(date.getTime());
      for(let i=0; i<(this.selectedSpread == 'rolling7' ? 7 : 14); i++){
        if(area== "US"){
          let data = (this.stateData[this.formatDate(d)] ?? {});
          sum += ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? data.usCases : data.usDeaths) ?? 0;
        }
        else{
          if(this.showCounties && area.length>2){
            let countyData = ((this.countyData[this.countyState][this.formatDate(d)] ?? {})[area] ?? {});
            sum += ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? countyData.cases : countyData.deaths) ?? 0;
          }
          else {
            let stateData = ((this.stateData[this.formatDate(d)] ?? {})[area] ?? {});
            sum += ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? stateData.cases : stateData.deaths) ?? 0;
          }
        }
        d.setDate(d.getDate() - 1);
      }
      stat = sum/(this.selectedSpread == 'rolling7' ? 7 : 14);
    }

    if(this.selectedDataOption == "casesPer100k"){
      if(this.showCounties && area.length>2){
        if(this.fipsData[area] == null){
          console.log(area);
        }
        stat = stat / this.fipsData[area].population * 100000;
      }
      else{
        stat = stat / this.population[area] * 100000;
      }
    }
    else if(this.selectedDataOption == "deathsPer10M"){
      if(this.showCounties && area.length>2){
        stat = stat / this.fipsData[area].population * 10000000;
      }
      else{
        stat = stat/ this.population[area] * 10000000;
      }
    }
    if(stat<0){
      stat = 0;
    }
    return stat;
  }

  getStatForRange(area: string){
    let data = [];
    let date = new Date(this.startDate.getTime());
    while(date.getTime()<=this.endDate.getTime()){
      data.push(this.getStat(date,area));
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
          try{
            let data: any;
            data = await this.http.get(this.baseUrl+"data/state/"+this.getYYYYMString(date)+".json").toPromise();
            if(data.final==true){
              localStorage.setItem("state/"+this.getYYYYMString(date),JSON.stringify(data));
            }
            this.stateData = {...this.stateData, ...data}
          }
          catch (e){
            console.log(e);
          }
        }
        else{
          this.stateData = {...this.stateData, ...JSON.parse(tempData)}
        }
      }
      if(this.showCounties && (this.countyData[this.countyState] ?? {})[this.formatDate(date)]==null){
        let tempData = localStorage.getItem("county/"+this.countyState+"/"+this.getYYYYMString(date));
        if(tempData == null){
          try{
            let data: any;
            data = await this.http.get(this.baseUrl+"data/county/"+this.countyState+"/"+this.getYYYYMString(date)+".json").toPromise();
            //currently it is possible to run out of storage... need to figure out how to fix
            // if(data.final==true){
            //   localStorage.setItem("county/"+this.countyState+"/"+this.getYYYYMString(date),JSON.stringify(data));
            // }
            if(this.countyData[this.countyState]==null){
              this.countyData[this.countyState] = {};
            }
            this.countyData[this.countyState] = {...this.countyData[this.countyState], ...data}
          }
          catch(e){
            console.log(e);
          }
        }
        else{
          if(this.countyData[this.countyState]==null){
            this.countyData[this.countyState] = {};
          }
          this.countyData[this.countyState] = {...this.countyData[this.countyState], ...JSON.parse(tempData)}
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
    for(let area of (this.showCounties ? this.selectedCounties : this.selectedStates)){
      let color = this.getColor();
      this.graphData.push({
        data:this.getStatForRange(area),
        label: ((this.showCounties && area.length>2) ? (this.fipsData[area] ?? {}).county : this.stateNames[area]) ?? "",
        id:area,
        backgroundColor: color+"50", borderColor: color+"dd"});
    }
    if(this.showCounties){
      this.oldSelectedCounties = [...this.selectedCounties];
    }
    else{
      this.oldSelectedStates = [...this.selectedStates];
    }
    if(this.mapDate.getTime()>this.endDate.getTime()){
      this.mapDate = new Date(this.endDate.getTime());
    }
    else if(this.mapDate.getTime()<this.startDate.getTime()){
      this.mapDate = new Date(this.startDate.getTime());
    }
    this.updateMap();
  }

  //Update the numbers of the graphs (cases vs deaths vs casesPer100k, etc)
  updateGraphDataType(){
    for(let data of this.graphData){
      data.data = this.getStatForRange(data.id);
    }
    this.updateMap();
  }

  //today, rolling7, rolling14, etc
  async updateGraphDataStat(){
    await this.loadData();
    for(let data of this.graphData){
      data.data = this.getStatForRange(data.id);
    }
    this.updateMap();
  }

  //update the states in the dataset
  updateGraphDataStates(){
    let currentAreas = (this.showCounties ? this.selectedCounties : this.selectedStates);
    let oldAreas = (this.showCounties ? this.oldSelectedCounties : this.oldSelectedStates)
    let removed = [];
    for(let old of oldAreas){
      if(currentAreas.indexOf(old)==-1){
        removed.push(old);
      }
    }
    let added = [];
    for(let area of currentAreas){
      if(oldAreas.indexOf(area)==-1){
        added.push(area);
      }
    }
    for(let add of added){
      let color = this.getColor();
      this.graphData.push({
        data:this.getStatForRange(add),
        label: ((this.showCounties && add.length>2) ? (this.fipsData[add] ?? {}).county : this.stateNames[add]) ?? "",
        id:add,
        backgroundColor: color+"50",
        borderColor: color+"dd"});
    }
    for(let remove of removed){
      let index = this.graphData.findIndex((el) => el.id==remove);
      this.graphData.splice(index,1);
      // }
    }
    if(this.showCounties){
      this.oldSelectedCounties = [...this.selectedCounties];
    }
    else{
      this.oldSelectedStates = [...this.selectedStates];
    }
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
    let newDate = this.graphLabels[elements[0]._index];
    if(newDate == null){
      return;
    }
    this.mapDate = this.getDateFromString(newDate.toString());
    this.updateMap();
  }

  getPreviousDay(date) {
    let d = new Date(date.getTime());
    d.setDate(d.getDate() - 1);
    return d;
  }

  getDateFromString(str: string){
    let split = str.split("-");
    return new Date(Number(split[0]), Number(split[1])-1,Number(split[2]));
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
    // @ts-ignore
    this.myChart.chart.annotation.elements['dateline'].options.value = this.formatDate(this.mapDate);
    this.myChart.chart.update();
    let total = this.showCounties ? this.getStat(this.mapDate,this.countyState) : this.getStat(this.mapDate, "US");
    this.selectedData = {};
    for(let area of (this.showCounties ? this.countyList : this.states)){
      let val = this.getStat(this.mapDate, area);
      let hex = "ff";
      if(this.selectedDataOption=="cases" || this.selectedDataOption=="deaths"){
        let adjustedValue = Math.round(255 - val/total*255.0 * 7.0);
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
      this.selectedData[area] = {
        value: val.toFixed((this.selectedDataOption == "casesPer100k" || this.selectedDataOption == "deathsPer10M") ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          +' '+ ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? "cases" : "deaths"),
        color: "#ff" + hex + hex
      }
    }
    this.totalData = total.toFixed((this.selectedDataOption == "casesPer100k" || this.selectedDataOption == "deathsPer10M") ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      +' '+ ((this.selectedDataOption == "cases" || this.selectedDataOption == "casesPer100k") ? "cases" : "deaths");
  }
}
