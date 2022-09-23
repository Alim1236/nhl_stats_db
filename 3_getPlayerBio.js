var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require('fs');

//NHL player id's are 7 digit numbers that start with "84".
//The numerically smallest player id is "8444850"
const MIN_ID = 8444850;
const MAX_ID = 8483567;
//In Apr 2022, the latest player ID was 8483567.
//However, it's very likely there are more players added in NHL's system since then.

const OUTFILE = "player_ids.json";
const API = "https://statsapi.web.nhl.com/api/v1/";

var player_stats = {};
var rejects = 0;

var d = new Date();
const startTime = d.getTime();
main();


/***
main()
purpose: start the code execution
input: n/a
output: n/a
***/
async function main(){
  getPlayerIds();
}


/***
getPlayerIds()
purpose:
Iterates through all the possible NHL player ids, and collects their bio info.
Then, it calls the next function to save all the data.

input: n/a
output: n/a
***/
async function getPlayerIds(){
  for(i = MIN_ID; i < MAX_ID; i++){
    //for all the player id's from MIN_ID to MAX_ID, save their bio info

      try{
        await getBioInfo(i.toString());
      }catch(e){
        //if there is an error, then keep track of how many errors there are
        rejects += 1;
      }
  }
  //when all the player information has been collected, then save it to a file
  savePlayerIds();
}


/*******
getBioInfo()
Inputs: String representing the ID of a player

Requests the NHL API for the requested player's general info.
Retrieves a player's fullName, height, weight, captaincy, and position.
Saves info to player_stats object.

Outputs: returns a promise when data has been retrieved and processed.

*******/
function getBioInfo(player_id){
  return new Promise(function(resolve, reject){
    var bio_url = "" + API + "people/" + player_id;

    //define the XML HTTP Request, and define what happens when we receive data
    req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (this.readyState == 4){
        if(this.status == 200){
          //if we receive a response back, then parse it
          let response = JSON.parse(req.responseText);
          let person = response.people[0];

          /*
          if we get a message from NHL API that there isn't a player with this ID,
          or if the data is incomplete, then throw an error by rejecting the Promise
          */
          if (person.messageNumber == 10){
            reject(player_id);
          }
          if(person.hasOwnProperty('fullName') == false){
            reject(player_id);
          }else{
            //if the response data is OK, then collect the data from the response
            var bio_info = (({ id, fullName, firstName, lastName,birthDate,shootsCatches}) => ({ id, fullName, firstName, lastName,birthDate,shootsCatches}))(person);
            bio_info.position = person.primaryPosition.code;

            //save the data to our global object, with the key being the player id
            player_stats[player_id] = bio_info;

            //return the function by resolving the Promise
            resolve(player_id);
          }
        }else{
          //if we do not get the OK status from the request, then reject the Promise
          reject(`ERROR: ${this.status} ${req.responseText}`);
        }
      }
    };
    
    //prepare and send the request
    req.open("GET", bio_url, true);
    req.setRequestHeader("Content-type", "application/json");
    req.send();
  });
}

/***
savePlayerIds()
purpose: save the game information to a file
input: n/a
output: n/a
updates: writes game information in "game_data" to a file, specified in global constant OUTFILE
***/
function savePlayerIds(){
  fs.writeFile(OUTFILE, JSON.stringify(player_stats), function(err) {
    if(err){
      console.log(err);
    }
    calcTime();

  });

}


/***
calcTime()
purpose: shows user how long the code execution took, along with how much data was saved
input: n/a
output: n/a
***/
function calcTime(){
  var d = new Date();
  const endTime = d.getTime();
  let diff = endTime - startTime;
  console.log();
  console.log(`Operation completed in ${diff} milliseconds`);
  console.log("Saved " + Object.keys(player_stats).length + " player ids");
  console.log("Rejected id's - " + rejects);
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
