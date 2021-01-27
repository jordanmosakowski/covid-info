import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DisplayData, StatesData} from '../interfaces';

@Component({
  selector: 'app-states-map',
  templateUrl: './states-map.component.html',
  styleUrls: ['./states-map.component.scss']
})
export class StatesMapComponent implements OnChanges, AfterViewInit {

  @Input() data: StatesData;

  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
    'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
    'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  showingDeaths: boolean;
  tooltipState: string;

  constructor(){
    this.showingDeaths = false;
    this.tooltipState = "NONE";
  }

  ngOnChanges(): void {
    this.updateMap();
  }

  @ViewChild("map") map: ElementRef;
  @ViewChild("tooltip") tooltip: ElementRef;

  updateMap(): void{
    if(this.data==null){
      for(let s of this.states){
        let el = this.map.nativeElement.getElementById(s);
        el.style.fill = "#ffffff";
      }
      return;
    }
    for(let s of this.states){
      let stateData: DisplayData;
      stateData = this.data[s];
      let el = this.map.nativeElement.getElementById(s);
      if(stateData == null){
        el.style.fill = "#ffffff";
        continue;
      }
      el.style.fill = stateData.color;
    }
    // const usTotal = this.showingDeaths ? this.data.usDeaths : this.data.usCases;
    // // const usTotal = this.showingDeaths ? selectedData.usTotalDeaths : selectedData.usTotalCases;
    // for(let s of this.states){
    //   let stateData: StateData;
    //   stateData = this.data[s];
    //   let el = this.map.nativeElement.getElementById(s);
    //   if(stateData == null || usTotal==0){
    //     el.style.fill = "#ffffff";
    //     continue;
    //   }
    //   let stateCount = this.showingDeaths ? stateData.deaths : stateData.cases;
    //   // let stateCount = this.showingDeaths ? stateData.totalDeaths : stateData.totalCases;
    //   let adjustedValue = Math.round(255 - stateCount/usTotal*255.0 * 7.0);
    //   if(adjustedValue<0){
    //     adjustedValue = 0;
    //   }
    //   let hex = adjustedValue.toString(16);
    //   if(hex.length==1){
    //     hex = "0"+hex;
    //   }
    //   el.style.fill = "#ff" + hex + hex;
    // }
  }

  showTooltip(s:string){
    this.tooltip.nativeElement.style.display = "block";
    this.tooltipState = s;
  }

  hideTooltip(s:string){
    this.tooltip.nativeElement.style.display = "none";
  }

  ngAfterViewInit(): void {
    this.map.nativeElement.addEventListener('mousemove', e => {
      this.tooltip.nativeElement.style.top = e.offsetY.toString()+"px";
      this.tooltip.nativeElement.style.left = e.offsetX.toString()+"px";
    });
    for(let s of this.states){
      this.map.nativeElement.getElementById(s).addEventListener('mouseenter', () => this.showTooltip(s));
      this.map.nativeElement.getElementById(s).addEventListener('mouseleave', () => this.hideTooltip(s));
    }
  }

}

export interface StateData{
  cases: number;
  totalCases: number;
  deaths: number;
  totalDeaths: number;
}
