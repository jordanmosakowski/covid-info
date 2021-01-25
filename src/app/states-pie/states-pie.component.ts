import {Component, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'app-states-pie',
  templateUrl: './states-pie.component.html',
  styleUrls: ['./states-pie.component.scss']
})
export class StatesPieComponent implements OnChanges {

  @Input() data;
  convertedData = [];
  columns = ["State", "Number of Cases"]

  states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
    'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
    'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

  constructor() {
    this.convert();
  }

  convert(){
    this.convertedData = [];
    if(this.data==null){
      this.data = {};
    }
    for(let [state, data] of Object.entries(this.data)){
      // @ts-ignore
      this.convertedData.push([state, data.cases]);
    }
    this.convertedData.sort((a,b) => b[1] - a[1]);
    console.log(this.convertedData);
  }

  ngOnChanges(): void {
    this.convert();
  }


}
