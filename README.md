# Health Innovation Scanner

> Mapping health innovation globally for the Robert Wood Johnson Foundation.

## Build instruction

For local development:

- clone the repo:
   `git clone git@github.com:nestauk/playground.git`

- enter the directory:
   `cd playground`

- install npm dependencies:
   `npm i`

- build the data:
   `npm run data:geo:lookup`
   `npm run data:geo:world`

- build the lambda:
   `npm run lambda:build`

- run the lambda:
   `npm run lambda:dev`

- in a new terminal:
   `npm run dev`

   You should see a message like:
   `> Listening on http://localhost:3000`

- navigate to `http://localhost:3000`, then click on "search" or navigate directly to `http://localhost:3000/search`
