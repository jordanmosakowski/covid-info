import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {DisplayData} from '../interfaces';
import * as fipsCountyJson from '../fips-county.json';

@Component({
  selector: 'app-counties-map',
  templateUrl: './counties-map.component.html',
  styleUrls: ['./counties-map.component.scss']
})
export class CountiesMapComponent implements OnChanges, AfterViewInit {

  fipsData: any = (fipsCountyJson as any).default;

  @ViewChild("map") map: ElementRef;
  @ViewChild("animator") animator: ElementRef;
  @ViewChild("tooltip") tooltip: ElementRef;

  @Input() data;

  @Input() countyList;

  @Input() state: string;

  viewboxes = {
    US: [0, 0, 1015.60, 628.00],
    AL: [600, 365, 200, 123.67],
    AK: [0, 455, 280, 173.14],
    AZ: [100, 300, 250, 154.59],
    AR: [510, 340, 150, 92.75],
    CA: [-140, 135, 450, 278.26],
    CO: [250, 215, 200, 123.67],
    CT: [890, 165, 55, 34.01],
    DE: [849, 223, 80, 49.47],
    DC: [835, 244, 50, 30.92],
    FL: [640, 450, 250, 154.59],
    GA: [675, 360, 180, 111.30],
    HI: [280, 540, 150, 92.75],
    ID: [70, 20, 300, 185.51],
    IL: [520, 195, 230, 142.22],
    IN: [605, 210, 170, 105.12],
    IA: [500, 180, 130, 80.39],
    KS: [405, 253, 150, 92.75],
    KY: [635, 265, 145, 89.66],
    LA: [520, 415, 170, 105.12],
    ME: [850, 25, 200, 123.67],
    MD: [802, 225, 100, 61.84],
    MA: [880, 130, 100, 61.84],
    MI: [560, 70, 250, 154.59],
    MN: [440, 45, 240, 148.40],
    MS: [540, 370, 200, 123.67],
    MO: [485, 240, 200, 123.67],
    MT: [193, 15, 225, 139.13],
    NE: [370, 175, 175, 108.21],
    NV: [10, 165, 300, 185.51],
    NH: [862, 85, 120, 74.20],
    NJ: [845, 190, 100, 61.84],
    NM: [220, 315, 225, 139.13],
    NY: [775, 102, 175, 108.21],
    NC: [735, 290, 170, 105.12],
    ND: [375, 45, 150, 92.75],
    OH: [670, 194, 160, 98.94],
    OK: [387, 317, 170, 105.12],
    OR: [5, 55, 210, 129.85],
    PA: [770, 175, 130, 80.39],
    RI: [912, 158.5, 50, 30.92],
    SC: [745, 355, 120, 74.20],
    SD: [375, 119, 150, 92.75],
    TN: [627, 300, 160, 98.94],
    TX: [235, 335, 425, 262.80],
    UT: [130, 186, 225, 139.13],
    VT: [853, 97, 100, 61.84],
    VA: [740, 240, 160, 98.94],
    WA: [60, -5, 160, 98.94],
    WV: [725, 226, 140, 86.57],
    WI: [530, 97, 180, 111.30],
    WY: [240, 128, 180, 111.30],
  }
  currentViewbox: number[];

  oldCountyList: string[];
  oldState: string;

  tooltipCounty: string;

  constructor() {
    this.oldState = "";
    this.oldCountyList = [];
    this.currentViewbox = [0,0,1,0.62];
  }

  ngOnChanges(): void {
    this.updateMap();
  }

  ngAfterViewInit(): void {
    this.updateMap();
    this.map.nativeElement.addEventListener('mousemove', e => {
      this.tooltip.nativeElement.style.top = e.offsetY.toString()+"px";
      this.tooltip.nativeElement.style.left = e.offsetX.toString()+"px";
    });
  }

  showTooltip(c:string){
    this.tooltip.nativeElement.style.display = "block";
    this.tooltipCounty = c;
  }

  hideTooltip(s:string){
    this.tooltip.nativeElement.style.display = "none";
  }

  updateMap(){
    if(this.state != this.oldState && this.map!=null){
      for(let c of this.oldCountyList){
        let elems = this.map?.nativeElement?.getElementsByClassName("c"+c) ?? [];
        if(elems.length==0){
          continue;
        }
        let el = elems[0];
        el.style.fill = "#ffffff";
        let elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);
      }
      for(let c of this.countyList){
        let elems = this.map?.nativeElement?.getElementsByClassName("c"+c) ?? [];
        if(elems.length==0){
          continue;
        }
        let el = elems[0];
        el.addEventListener('mouseenter', () => this.showTooltip(c));
        el.addEventListener('mouseleave', () => this.hideTooltip(c));
      }
      this.oldState = this.state;
      this.oldCountyList = [...this.countyList];
      let targetViewbox = this.viewboxes[this.state] ?? this.viewboxes.US;
      console.log(targetViewbox.join(" "));
      console.log(this.currentViewbox.join(" "));
      this.animator.nativeElement.setAttribute("from",this.currentViewbox.join(" "));
      this.animator.nativeElement.setAttribute("to",targetViewbox.join(" "));
      this.animator.nativeElement.beginElement();
      this.currentViewbox = targetViewbox;
    }
    for(let c of this.countyList){
      let data: DisplayData;
      data = this.data[c];
      if(this.map==null){
        continue;
      }
      let elems = this.map?.nativeElement?.getElementsByClassName("c"+c) ?? [];
      if(elems.length==0){
        continue;
      }
      let el = elems[0];
      if(data == null){
        el.style.fill = "#ffffff";
        continue;
      }
      el.style.fill = data.color;
    }
  }

}
