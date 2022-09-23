"""
The purpose of this script is to download the information for every single historical
NHL player, along with their HockeyReference unique ID (their link).

HockeyReference doesn't provide an easy way to view all players, however,
they have a table of every single NHL player who is born on a certain day.

By iterating through all 366 calendar days and saving the players from each day,
we will eventually download the data for every single NHL player on the HR database.

--Libraries--
requests: fetching HTML files from the web
BeautifulSoup: parsing HTML files
pandas: data manipulation with HTML data tables, exporting data as CSV
random: to stagger my web requests to avoid suspicion
time: to have the code "wait" between each request
"""

import requests
import bs4 as bs
import pandas as pd
import time
import random


HEADERS = ",Rk,Player,Born,Team(s),From,To,GP,G,A,PTS,+/-,PIM,GP,W,L,T/O,SV%,GAA,drop,link,born_month,born_day\n"
FILENAME = "hr_birthdays.csv"

# function: getCSV()
# purpose: get player info for players born on a given month and day, formatted as a CSV
# inputs: month (integer 1-12), and day (integer 1-31)
# output: string formatted as a CSV of player data
def getCSV(month, day):

    #compose the URL to visit
    url = "https://www.hockey-reference.com/friv/birthdays.cgi?month=" + str(month) + "&day=" + str(day)

    #get the HTML from that URL
    response = requests.get(url)

    if(not(int(response.status_code) == 200)):
        #if the request returns a status code that isn't "OK", print to user, and end parsing for this day
        print("ERROR", str(response.status_code), str(month), str(day))
        return "\n"
    else:
        #store the HTML table as a Panda DataFrame object
        df = pd.read_html(response.text)[0]

    #parse the HTML using BeautifulSoup to find the data table
    soup = bs.BeautifulSoup(response.text, 'html.parser')
    table = soup.find('table')

    #use the BeautifulSoup table to get an array of all the players' ids
    links = []
    for tr in table.findAll("tr"):
        #find all HTML table rows

        trs = tr.findAll("td")
        #find all HTML table cells in each row

        for each in trs:
            try:
                #find the link
                link = each.find('a')['href']

                #string manipulation to extract the player ID portion
                trim_link = link.split('/')[-1].split(".html")[0]

                #add the player ID to the links array
                links.append(trim_link)
            except:
                #if it doesn't work, then skip it
                pass

    #add the links array as a new column for our Pandas DataFrame
    #now each row of player data also contains the player's ID
    df['Link'] = links

    # You can also drop some of those fields, like the ones for Box Score and Notes, which don't contain too much relevant info:
    #df.drop(["Unnamed: 18_level_0"], axis=1, inplace=True)

    #create arrays containing the input month and input day, repeatedly
    monthArr = [month]*(df.shape[0])
    dayArr = [day]*(df.shape[0])

    #add the birth month and birth day as columns in the table
    #now each player entry has their birth month and birth day
    df['born_month'] = monthArr
    df['born_day'] = dayArr

    #convert the Pandas DataFrame to a CSV string
    csv_with_headers = df.to_csv(path_or_buf=None)

    #delete the first two rows of the CSV - those are the rows that contain the headers
    out_csv = ("\n".join(csv_with_headers.split("\n")[2:]))

    return out_csv

#open the file for "appending"
f = open(FILENAME, "a")
f.write(HEADERS)

#seed the random library
random.seed()

#iterate over every combination of months from 1-12, and days (1-31)
for q_month in range(1,13):
    for q_day in range(1,32):

        #pause execution for 2-4 seconds, to avoid suspicion of crawlers or attack
        time.sleep(random.randint(2,4))

        #nov 30th has a player with an unsupported character in their name
        if ((q_month == 11) and (q_day == 30)):
            nov_30 = getCSV(11,30)
            nov_30_fixed = ('n'.join(nov_30.split('ň'))) #replace the funky 'n' with a normal 'n'
            f.write(nov_30_fixed)
            continue

        #fetch the CSV of players born on a given month and day, and write it to the file
        f.write(getCSV(q_month,q_day))

        #optional - just to see the code's progress
        print(q_month,q_day)

#we are done using the file
f.close()
