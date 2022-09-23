/***
The purpose of this script is to get information about every NHL team from
the NHL's web API
- NHL.com team ID
- city
- team name
- venue
- abbreviation

---Requirements---
xmlhttprequest: for requesting data from the API
fs: for reading/writing data with files
Date() : calculating how long the code execution runs for
***/


var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');

const OUT_FILENAME = "team_info.json";
const TEAMS_URL = 'https://statsapi.web.nhl.com/api/v1/teams';
var team_info = {};
var completedTeams = 0;

main(); //start my code

//save the time when the code starts
var d = new Date();
const start_time = d.getTime();

async function main(){
  await getTeamIds();
  saveTeamInfo();
}

/***
getTeamIds()
purpose: get information about each NHL team
input: n/a
return value: resolved Promise when we have our data.
updates: adds team information to global object "team_info"
***/
function getTeamIds(){
  //return a Promise so that the code only continues once we have all our data
  return new Promise(function(resolve){

    //define the web request
    req = new XMLHttpRequest();

    //code to run when the request has been completed
    req.onreadystatechange = function() {
      if (this.readyState == 4){
        if(this.status == 200){

          //parse through the JSON that we requested
          let response = JSON.parse(req.responseText);
          let teams = response['teams'];

          //for each team in the "teams" array
          teams.forEach(function(team){

            //extract team info from the response, and store it in a temporary object
            var obj_team = {};
            obj_team.id = parseInt(team.id);
            obj_team.city = team.shortName;
            obj_team.name = team.franchise.teamName;
            obj_team.venue = team.venue.name;
            obj_team.abb = team.abbreviation;

            //save the team data to the team_info global object
            team_info[obj_team.id] = obj_team;

            //optional: to show progress of data
            completedTeams ++;
            console.log(`${completedTeams} - ${obj_team.id} - ${obj_team.name}`);

          });
          //end the Promise once all the data has been collected
          resolve("");

        }else{
          //if we do not get the "OK" status from the request, then throw an error
          console.log(`ERROR: ${this.status} ${req.responseText}`);
          process.exit();
        }
      }
    };

    //send request to TEAMS_URL, we want back a JSON
    req.open("GET", TEAMS_URL, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send();
  });

}

/***
saveTeamInfo()
purpose: save the team information to a file
input: n/a
output: n/a
updates: writes team information to a file, specified in global constant OUT_FILENAME
***/
function saveTeamInfo(){
  fs.writeFile(OUT_FILENAME, JSON.stringify(team_info), function(err) {
    if(err){
      console.log(err);
    }
    //calculate how long the execution took
    calcTime();

  });

}

/***
calcTime()
purpose: shows user how long the code execution took
input: n/a
output: n/a
***/
function calcTime(){
  const endTime = d.getTime();
  let diff = endTime - start_time;

  console.log();
  console.log(`Operation completed in ${diff} milliseconds`);
  console.log("Saved " + Object.keys(team_info).length + " teams");
}
