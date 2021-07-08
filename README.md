# Discord Message History Grapher

# Setup
* Clone git repo (or download as zip + extract)
* Install [NodeJS 14+](https://nodejs.org/download)
* Run `npm install`
* Copy `config.example.json` to `config.json`
* Fill in the required fields in config.json (token = discord token, channelId = id of the channel to scrape, viewer port = the port the webserver runs on that lets you visualize the data, fetchDelay = delay in between fetching messages in milliseconds, recommended to increase this for large channels to prevent account being locked)
* Run `node app.js`, wait for scraping, then open `localhost:8080` in your browser!

![Visualizer image](https://i.memester.xyz/u/khnv.png)

## Why did I make this?
#### Prove a point to my girlfriend that we don't talk as much anymore  