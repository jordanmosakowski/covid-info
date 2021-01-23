const csv=require('csvtojson')
const stateData = "nyt-data/us-states.csv";
const usData = "nyt-data/us.csv";
const fs = require('fs');

convertStateData()

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
  fs.writeFileSync("data/state.json",JSON.stringify(jsonData))
  console.log(jsonData['2021-01-22']);
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
