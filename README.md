# nhl_stats_db

## Summary
Scraping the web to gather hockey stats, then making an SQL database to show NHL stats by team.  

## Tools and languages used
* JavaScript -> scraping the NHL.com web API and storing the data
* Python -> scraping HockeyReference.com and storing the data
* Excel -> visualizing and manipulating stored data
* SQL -> Creating database schemas and tables, importing the data, querying the database

## Long Description
### Introduction
As a big fan of hockey, I often go to the NHL (National Hockey League) website to look at statistics. I recently discovered that the NHL offers a web API for statistics, which would allow for easier collection and manipulation of their data using code. However, the NHL web API is not advertised or mentioned anywhere on the NHL’s website (NHL.com). Nor is it officially documented. There is still a need for a user-friendly querying of the NHL’s web API without having to guess and navigate URLs.  

### Player information
* This database stores information of every player in NHL history – their name, birthdate, and position.
* Every player is either a goalie or a skater
  * a goalie has a specific hand in which they wear their catching glove (L or R)
  * a skater has a specific hand they shoot with (L or R).
* As there are several players in NHL history with the same name, players can be uniquely identified by their player ID.  

### Team information
* The database also stores information about all 32 teams in the NHL, including each team’s name, abbreviation, location, and venue.
* Every team can be uniquely identified by their team ID, and can also be identified by the combination of city and name.
* If a team relocates (changes cities) or changes name, their team ID will still be constant.
* Multiple teams can play in the same city, and multiple teams can have the same name.  

### Skaters and Goalies statistics
* A player can play for many teams, and a team can have many players.
* I have collected statistics for all NHL players since 2012.
* For skaters, the database keeps track of how many games, goals, assists, and points skaters they have for each team they played for.
  * For example, if John Smith scores 2 goals for Ottawa and 4 goals for Toronto, then the database would store them separately.
* For goalies, the database keeps track of how many games, wins, regular losses, and overtime/shootout losses a goalie has for each team they play for.
* It also records a goalie’s save percentage for each team they play for.
  * For example, John Smith has a 0.900 save percentage for Montreal, and 0.800 save percentage for Vancouver.  

### Game information
* The database keeps track of every game that was played since 2012.
* Every game is given a number.
  * Numbers can be re-used every season, but a game can never have duplicate game-number + season combination.
* The database must keep track of the date a game was played, and every game has one home team and one away team.  

### Uses
The most useful part of this database is its skaters’ stats and goalies’ stats. We can compare different players’ performances, and even see their breakdown per team. Simpler queries can be to find the number of assists that Auston Matthews has scored. More complex queries can answer several curious questions. For example:
* Who had more points in the last decade: Alex Ovechkin or Sidney Crosby?
* Does goalie Sergei Bobrovsky have more wins for Columbus or for Florida?
* Which player scored the most goals for a Canadian team?
* All these questions can be answered, and more.  

The database can even be used to compare number of wins a specific team has recorded since 2012. By summing up all the wins of goalies that have played for, we can find the team’s entire total. This is very useful for comparing the overall success of teams over the last ten years.  

We can also find out other interesting facts, like how many games were played in August, which birth month is the most popular, and the distribution of players who shoot right or shoot left.
