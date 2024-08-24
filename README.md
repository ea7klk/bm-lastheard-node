# Project Name

## Description
This is a NodeJS program, developed almost completely with GitHub Copilot that could be useful for radio amateurs using the Brandmeister DMR network. 

It connect to the BM Lastheard websocket.  
It gets all the data, ignores non-group calls and calls shorter than 5 seconds.  
It inserts this data into an SQLITE database.  
I am also providing some simple web pages rto display some of the data

## Prerequisites
- Docker
- Node.js v22.5.1

## Installation

Clone the repository. 
run ```npm install``` to install the dependencies.
run  ```node lh.js``` to start the program.

### Clone the repository
```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo