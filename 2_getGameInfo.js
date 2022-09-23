let team_info = require("./team_info.json"); //get all the team's IDs
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');

var d = new Date();
const start_time = d.getTime();
const API = "https://statsapi.web.nhl.com/api/v1/";
const OUTFILE = "game_data.csv";
const STARTDATE = "09-01";
const ENDDATE = "08-31";

var game_data = {};
main();

async function main(){
  for(var team_id of Object.keys(team_info)){
    for(year = 2012; year < 2022; year ++){
      var start_string = year.toString() + '-' + STARTDATE;
      var end_string = (year+1).toString() + '-' + ENDDATE;

      await getSchedule(team_id, start_string, end_string);

      console.log(team_id, team_info[team_id].name, year.toString());

      if(team_id == 55 && year == 2021){
        //when we reach the last team and the last year, save all our data
        saveData();
      }
    }
  }
}

/***
getSchedule()
purpose: fetch the data for all games within your date range in which a given team has played
inputs:
  team_id: the team that that you want game data on
  start_date, end_date: these strings represent the start and end dates (in YYYY-MM-DD) that you want game data about.
output: a Promise which signifies the data has been fetched
updates: adds game data to the global game_data object
***/
function getSchedule(team_id, start_date, end_date){
  return new Promise(function(resolve, reject){
    //the NHL API contains built-in queries for start date and end date
    var schedule_url = "" + API + "schedule?teamId=" + team_id + "&startDate=" + start_date + "&endDate=" + end_date;

    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (this.readyState == 4){
        if(this.status == 200){

          let response = JSON.parse(req.responseText);
          let date_array = response.dates;
          //the response is an array of dates, each date should contain a game

          for(var i = 0; i < date_array.length; i++){

            if (date_array[i].games.length == 0){
              //error checking
              continue;
            }
            var game_no = date_array[i].games[0].gamePk.toString();
            if(game_data.hasOwnProperty(game_no)){
              //if we already have data about this game, skip it
              continue;
            }
            if(game_no.charAt(5) == 1){
              //I did not want pre-season games, which are denoted with a "1" at the 5th character of a game number
              continue;
            }

            //gather game information from the response
            var game_info = {};
            game_info.game_no = game_no;
            game_info.season = date_array[i].games[0].season;
            game_info.date = date_array[i].date;
            game_info.away = date_array[i].games[0].teams.away.team.id;
            game_info.home = date_array[i].games[0].teams.home.team.id;

            //save the game information to our master object
            game_data[game_no] = game_info;

          }
          //once all games have been processed, end this function by resolving the promise
          resolve();
        }else{
          reject(`ERROR: ${this.status} ${req.responseText}`);
        }
      }
    };
    req.open("GET", schedule_url, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send();
  });
}

/***
saveData()
purpose: save the game information to a file
input: n/a
output: n/a
updates: writes game information in "game_data" to a file, specified in global constant OUTFILE
***/
function saveData(){
  var wipe = fs.createWriteStream(OUTFILE);
  wipe.close();
  var writer = fs.createWriteStream(OUTFILE, {flags:'a'});
  var length;
  var count = 0;

  length = Object.keys(game_data).length;

  //add CSV headers to file
  writer.write("game_no,season,year,month,day,home,away\n");

  Object.keys(game_data).forEach(function(game){
    //for each game, write its information in CSV format

    //format the line
    var text = "";
    var game_no = game.slice(-6);
    text += (game_no + ",");
    text += (game_data[game].season + ",");
    var date = game_data[game].date.split('-');
    text += (date[0] + ",");
    text += (date[1] + ",");
    text += (date[2] + ",");
    text += (game_data[game].home + ",");
    text += (game_data[game].away + "\n");

    //write the line
    writer.write(text);
    count ++;

    if(count == length){
      //when all the the data has been written, calculate how long the code took
      calcTime();
    }
  });


}

/***
calcTime()
purpose: shows user how long the code execution took
input: n/a
output: n/a
***/
function calcTime(){
  var d = new Date();
  const end_time = d.getTime();
  let diff = end_time - start_time;
  console.log();
  console.log(`Operation completed in ${diff} milliseconds`);
  console.log("Saved " + Object.keys(game_data).length + " game ids");
}

/***
FINAL NOTES

My Node.JS code could only handle a couple asynchronous requests
before it forgets about previous requests that it was waiting for.
It could be an issue with my code, or with Node, but I'm not sure.

Thus, I reworked my code so that each request is awaited for, basically
turning my code synchronous.

Also note: my code only writes to the file once all the data has been loaded.
This troubled me plenty, since if there was a single error in the code, even
at the last line, then the data would not be saved.
In the future, I need to save incrementally.
***/
