export interface DisplayData{
  value: string;
  color: string;
}

export interface SaveState{
  start: number;
  end: number;
  dataOption: string; //cases, deaths, etc.
  spread: string; //single, rolling7, etc.
  counties: boolean;
  countyState?: string;
  areaList: string[];
}
