import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DisplayData} from '../interfaces';

@Component({
  selector: 'app-states-map',
  templateUrl: './states-map.component.html',
  styleUrls: ['./states-map.component.scss']
})
export class StatesMapComponent implements OnChanges, AfterViewInit{

  @Input() data;

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

  // ngOnInit(): void {
  //   this.updateMap();
  // }

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
      if(this.map==null){
        continue;
      }
      let el = this.map.nativeElement.getElementById(s);
      if(stateData == null){
        el.style.fill = "#ffffff";
        continue;
      }
      el.style.fill = stateData.color;
    }
  }

  showTooltip(s:string){
    this.tooltip.nativeElement.style.display = "block";
    this.tooltipState = s;
  }

  hideTooltip(s:string){
    this.tooltip.nativeElement.style.display = "none";
  }

  ngAfterViewInit(): void {
    this.updateMap();
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
