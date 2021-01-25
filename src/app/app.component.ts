import {AfterViewInit, Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StatesData} from './interfaces';
import {StateData} from './states-map/states-map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'covid-info';
  population = {
    AL: 4921532, AK: 731158, AZ: 7421401, AR: 3030522, CA: 39368078, CO: 5807719, CT: 3557006, DE: 986809,
    DC: 712816, FL: 21733312, GA: 10710017, HI: 1407006, ID: 1826913, IL: 12587530, IN: 6754953, IA: 3163561, KS: 2913805,
    KY: 4477251, LA: 4645318, ME: 1350141, MD: 6055802, MA: 6893574, MI: 9966555, MN: 5657342, MS: 2966786, MO: 6151548,
    MT: 1080577, NE: 1937552, NV: 3138259, NH: 1366275, NJ: 8882371, NM: 2106319, NY: 19336776, NC: 10600823,
    ND: 765309, OH: 11693217, OK: 3980783, OR: 4241507, PA: 12783254, RI: 1057125, SC: 5218040, SD: 892717,
    TN: 6886834, TX: 29360759, UT: 3249879, VT: 623347, VA: 8590563, WA: 7693612, WV: 1784787, WI: 5832655, WY: 582328,
    USA: 329484123,
  }
  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
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
  ]

  date: Date;
  stateData;
  selectedData: StatesData;
  usData: string;
  minDate: Date;
  maxDate: Date;

  constructor(private http: HttpClient) {
    this.selectedDataOption = "cases";
    this.stateData = {};
    this.date = new Date(2021,0,23);
    this.minDate = new Date(2020,0,21);
    this.maxDate = new Date();
  }

  ngAfterViewInit(): void {
    this.setDate(new Date(2021,0,23));
  }

  updateSelectedData(val){
    this.selectedDataOption = val;
    this.selectedData = {
      title: "TODO"
    };
    this.usData = "None";
    let data = this.stateData[this.formatDate(this.date)];
    if(val=="cases" || val=="deaths"){
      const usTotal = val=="cases" ? data.usCases : data.usDeaths;
      this.usData = usTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' '+val
      for(let s of this.states){
        let stateData: StateData;
        stateData = data[s];
        if(stateData == null || usTotal==0){
          this.selectedData[s] = {
            data: 0,
            color: "#ffffff"
          }
          continue;
        }
        let stateCount = val=="cases" ? stateData.cases : stateData.deaths;
        let adjustedValue = Math.round(255 - stateCount/usTotal*255.0 * 7.0);
        if(adjustedValue<0){
          adjustedValue = 0;
        }
        let hex = adjustedValue.toString(16);
        if(hex.length==1){
          hex = "0"+hex;
        }
        this.selectedData[s] = {
          value: stateCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+' '+val,
          color: "#ff" + hex + hex
        }
      }
    }
    else if(val=="casesPer100k" || val=="deathsPer10M"){
      this.usData = ((val=="casesPer100k" ? data.usCases : data.usDeaths)/this.population.USA*(val=="casesPer100k" ? 100000 : 10000000)).toFixed(2)+""+(val=="casesPer100k" ? "/100k" : "/10M");
      for(let s of this.states){
        let stateData: StateData;
        stateData = data[s];
        if(stateData == null){
          this.selectedData[s] = {
            data: 0,
            color: "#dddddd"
          }
          continue;
        }
        let stateCount = val=="casesPer100k" ? stateData.cases : stateData.deaths;
        let dataPer = stateCount/this.population[s]*(val=="casesPer100k" ? 100000 : 10000000);
        console.log(dataPer);
        let adjustedValue = Math.round(255 - dataPer * (val=="casesPer100k" ? 2.5 : 1));
        if(adjustedValue<0){
          adjustedValue = 0;
        }
        let hex = adjustedValue.toString(16);
        if(hex.length==1){
          hex = "0"+hex;
        }
        this.selectedData[s] = {
          value: dataPer.toFixed(2)+""+(val=="casesPer100k" ? "/100k" : "/10M"),
          color: "#ff" + hex + hex
        }
      }
    }
  }

  getYYYYMString(d:Date): string{
    let date = this.formatDate(d);
    let ymd = date.split("-")
    return ymd[0]+'-'+ymd[1];
  }

  formatDate(d:Date): string{
    let month = (d.getUTCMonth() + 1).toString();
    let day = d.getUTCDate().toString();
    let year = d.getUTCFullYear().toString();
    if (month.length < 2){
      month = '0' + month;
    }
    if (day.length < 2){
      day = '0' + day;
    }
    return [year, month, day].join('-');
  }

  async setDate(newDate: Date): Promise<void>{
    this.date = newDate;
    console.log(this.formatDate(this.date));
    if(this.stateData[this.formatDate(this.date)]==null){
      let tempData = localStorage.getItem("state/"+this.getYYYYMString(this.date));
      if(tempData == null){
        let data: any;
        data = await this.http.get("http://localhost:4201/data/state/"+this.getYYYYMString(this.date)+".json").toPromise();
        if(data.final==true){
          localStorage.setItem("state/"+this.getYYYYMString(this.date),JSON.stringify(data));
        }
        this.stateData = {...this.stateData, ...data}
      }
      else{
        this.stateData = {...this.stateData, ...JSON.parse(tempData)}
      }
    }
    this.updateSelectedData(this.selectedDataOption);
  }
}
