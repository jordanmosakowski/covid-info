import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-states',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.scss']
})
export class StatesComponent implements AfterViewInit {

  @ViewChild("map") map: ElementRef;

  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
    'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
    'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  date: Date;
  fullData;
  showingDeaths: boolean;

  minDate: Date;
  maxDate: Date;

  constructor(private http: HttpClient) {
    this.fullData = {};
    this.showingDeaths = false;
    this.date = new Date(2021,0,23);
    this.minDate = new Date(2020,0,21);
    this.maxDate = new Date();
  }

  ngAfterViewInit(): void {
    this.setDate(new Date(2021,0,23));
  }

  getNextDay(date) : string{
    let d = new Date(date);
    d.setUTCDate(d.getUTCDate() + 1);
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

  sleep(ms): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    if(this.fullData[this.formatDate(this.date)]==null){
      let tempData = localStorage.getItem("state/"+this.getYYYYMString(this.date));
      if(tempData == null){
        let data: any;
        data = await this.http.get("http://localhost:4201/data/state/"+this.getYYYYMString(this.date)+".json").toPromise();
        if(data.final==true){
          localStorage.setItem("state/"+this.getYYYYMString(this.date),JSON.stringify(data));
        }
        this.fullData = {...this.fullData, ...data}
      }
      else{
        this.fullData = {...this.fullData, ...JSON.parse(tempData)}
      }
      console.log(this.fullData);
    }
    this.updateMap();
  }

  updateMap(): void{
    const selectedData = this.fullData[this.formatDate(this.date)];
    if(selectedData==null){
      for(let s of this.states){
        let el = this.map.nativeElement.getElementById(s);
        el.style.fill = "#ffffff";
      }
      return;
    }
    const usTotal = this.showingDeaths ? selectedData.usDeaths : selectedData.usCases;
    // const usTotal = this.showingDeaths ? selectedData.usTotalDeaths : selectedData.usTotalCases;
    for(let s of this.states){
      let stateData: StateData;
      stateData = selectedData[s];
      let el = this.map.nativeElement.getElementById(s);
      if(stateData == null || usTotal==0){
        el.style.fill = "#ffffff";
        continue;
      }
      let stateCount = this.showingDeaths ? stateData.deaths : stateData.cases;
      // let stateCount = this.showingDeaths ? stateData.totalDeaths : stateData.totalCases;
      let adjustedValue = Math.round(255 - stateCount/usTotal*255.0 * 7.0);
      if(adjustedValue<0){
        adjustedValue = 0;
      }
      let hex = adjustedValue.toString(16);
      if(hex.length==1){
        hex = "0"+hex;
      }
      el.style.fill = "#ff" + hex + hex;
    }
  }

}

export interface StateData{
  cases: number;
  totalCases: number;
  deaths: number;
  totalDeaths: number;
}
