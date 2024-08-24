# Project Name

## Description
This is a NodeJS program, developed almost completely with GitHub Copilot that could be useful for radio amateurs using the Brandmeister DMR network. 

The main purpose of this is to teach myself some NodeJS, and maybe provide a useful basis for someone to process the data from Brandmeister Lastheard. 

Copilot was spot on for most of the things, the only issues I had to change manually were some confusions about treating JSON objects as strings and the portions to filter out some data. 

- It connects to the BM Lastheard websocket (socket.io).  
- It gets all the data, ignores non-group calls and calls shorter than 5 seconds.  
- It calculates the duration of the call
- It inserts this data into an SQLITE database.  
- I'm also providing some simple web pages to display some of the data. 
  - go to http://localhost:3000/index.html to view the pages. 

## Prerequisites
- Docker
- Node.js v22.5.1

## Installation

- Clone the repository. 
- run ```npm install``` to install the dependencies.
- run  ```node lh.js``` to start the program.  

The database will be created automatically if it's not present. 

## Contribute
- Fork the repository
- Create your own branch
- When done, create a pull request. 

### Clone the repository
```bash
git clone https://github.com/ea7klk/bm-lastheard-node.git
cd bm-lastheard-node
