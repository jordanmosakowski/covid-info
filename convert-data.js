const csv=require('csvtojson')
const stateData = "nyt-data/us-states.csv";
const countyData = "nyt-data/us-counties.csv";
const usData = "nyt-data/us.csv";
const fs = require('fs');

convertCountyData();
convertStateData();

async function convertCountyData(){
  let rawData = await csv().fromFile(countyData);
  const fips = JSON.parse(fs.readFileSync('data/fips-county.json', {encoding:'utf8', flag:'r'}));
  let jsonData = {};
  // console.log(rawData.length);
  for(const row of rawData){
    if(fips[row.fips] == undefined){
      continue;
    }
    let s = fips[row.fips].state;
    if(jsonData[s]==null){
      jsonData[s] = {}
    }
    if(jsonData[s][row.date]==null){
      jsonData[s][row.date] = {}
    }
    jsonData[s][row.date][row.fips] = {
      totalCases: Number(row.cases),
      totalDeaths: Number(row.deaths),
    }
    let yesterdayState = jsonData[s];
    if(yesterdayState==null){
      yesterdayState = {}
    }
    let yesterday = yesterdayState[getPreviousDay(new Date(row.date))];
    if(yesterday==null){
      yesterday = {}
    }
    let yesterdayCounty = yesterday[row.fips];
    if(yesterdayCounty == null){
      yesterdayCounty = {}
    }
    jsonData[s][row.date][row.fips].cases = row.cases - (yesterdayCounty.totalCases || 0);
    jsonData[s][row.date][row.fips].deaths = row.deaths - (yesterdayCounty.totalDeaths || 0);
  }
  for (const [state, stateData] of Object.entries(jsonData)) {
    let year = 2021;
    let month = 1;
    let filtered = Object.keys(stateData).filter(key => key.indexOf(monthString(year, month))>-1).reduce((obj, key) => {obj[key] = stateData[key]; return obj;}, {});
    while(year===2020 || (year===2021 && month<=1)){
      if(Object.keys(filtered).length>0){
        if(year === 2020){
          filtered.final = true;
        }
        let dir = "data/county/"+state;
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        fs.writeFileSync("data/county/"+state+"/"+monthString(year,month)+".json",JSON.stringify(filtered))
      }
      month++;
      if(month === 13){
        month = 1;
        year++;
      }
      filtered = Object.keys(stateData).filter(key => key.indexOf(monthString(year, month))>-1).reduce((obj, key) => {obj[key] = stateData[key]; return obj;}, {});
    }
  }
  console.log(jsonData["CO"]['2021-01-23']);
}

async function convertStateData(){
  let rawData = await csv().fromFile(stateData);
  const fips = JSON.parse(fs.readFileSync('data/fips-states.json', {encoding:'utf8', flag:'r'}));
  let jsonData = {};
  for(const row of rawData){
    if(jsonData[row.date]==null){
      jsonData[row.date] = {}
    }
    let state = fips[row.fips];
    jsonData[row.date][state] = {
      totalCases: Number(row.cases),
      totalDeaths: Number(row.deaths),
    }
    let yesterday = jsonData[getPreviousDay(new Date(row.date))];
    if(yesterday==null){
      yesterday = {}
    }
    let yesterdayState = yesterday[state];
    if(yesterdayState == null){
      yesterdayState = {}
    }
    jsonData[row.date][state].cases = row.cases - (yesterdayState.totalCases || 0);
    jsonData[row.date][state].deaths = row.deaths - (yesterdayState.totalDeaths || 0);
  }
  rawData = await csv().fromFile(usData);
  for(const row of rawData){
    jsonData[row.date].usTotalCases = Number(row.cases);
    jsonData[row.date].usTotalDeaths = Number(row.deaths);

    let yesterday = jsonData[getPreviousDay(new Date(row.date))];
    if(yesterday==null){
      yesterday = {}
    }
    jsonData[row.date].usCases = row.cases - (yesterday.usTotalCases || 0);
    jsonData[row.date].usDeaths = row.deaths - (yesterday.usTotalDeaths || 0);
  }
  let year = 2021;
  let month = 1;
  let filtered = Object.keys(jsonData).filter(key => key.indexOf(monthString(year, month))>-1).reduce((obj, key) => {obj[key] = jsonData[key]; return obj;}, {});
  while(Object.keys(filtered).length>0){
    console.log(monthString(year,month), Object.keys(filtered).length);
    if(year === 2020){
      filtered.final = true;
    }
    fs.writeFileSync("data/state/"+monthString(year,month)+".json",JSON.stringify(filtered))
    month++;
    if(month === 13){
      month = 1;
      year++;
    }
    filtered = Object.keys(jsonData).filter(key => key.indexOf(monthString(year, month))>-1).reduce((obj, key) => {obj[key] = jsonData[key]; return obj;}, {});
  }
  // fs.writeFileSync("data/state.json",JSON.stringify(jsonData))
  console.log(jsonData['2021-01-22']);
}

function monthString(y, m){
  if(m<10){
    return y.toString()+"-0"+m.toString();
  }
  return y+'-'+m;
}

function getPreviousDay(d) {
  d.setUTCDate(d.getUTCDate() - 1);
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
