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
  @ViewChild("tooltip") tooltip: ElementRef;

  @Input() data;

  @Input() countyList;

  @Input() state: string;

  oldCountyList: string[];
  oldState: string;

  tooltipCounty: string;

  constructor() {
    this.oldState = "";
    this.oldCountyList = [];
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
