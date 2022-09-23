--clearing all previous data
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS skaters;
DROP TABLE IF EXISTS goalies;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS skaterStats;
DROP TABLE IF EXISTS goalieStats;

--defining new tables
CREATE TABLE teams(
  teamId integer primary key not null,
  abb text unique NOT NULL,
  city text NOT NULL,
  name text NOT NULL,
  venue text NOT NULL
);

CREATE TABLE skaters(
  skaterId integer primary key not null,
  firstName text not null,
  lastName text not null,
  pos text,
  dob_year integer,
  dob_month integer,
  dob_day integer,
  shoots text
);

CREATE TABLE goalies(
  goalieId integer primary key not null,
  firstName text not null,
  lastName text not null,
  pos text not null,
  dob_year integer,
  dob_month integer,
  dob_day integer,
  catches text
);

CREATE TABLE games(
  game_no text not null,
  season text not null,
  year integer not null,
  month integer not null,
  day integer not null,
  away integer not null,
  home integer not null,
  primary key(game_no,season)
);

CREATE TABLE skaterStats(
  skaterId integer not null,
  teamId integer not null,
  games integer,
  goals integer,
  assists integer,
  points integer,
  primary key(skaterId,teamId)
);

CREATE TABLE goalieStats(
  goalieId integer not null,
  teamId integer not null,
  games integer,
  wins integer,
  losses integer,
  ot integer,
  savePct real,
  primary key(goalieId,teamId)
);

--importing data
.mode csv
.import Port/team_info.csv teams
.import Port/final_skater_stats.csv skaterStats
.import Port/final_goalie_stats.csv goalieStats
.import Port/skater_bio_info.csv skaters
.import Port/goalie_bio_info.csv goalies
.import Port/game_data.csv games

.mode columns
