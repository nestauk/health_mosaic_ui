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

## Statecharts

There are some commands that you can run to copy the state machine configuratins to your clipboard allowing you to visit the [xstate visualiser](https://statecharts.github.io/xstate-viz/) and paste the configuration into the window and see a preview of that machine.

To copy the `screen_machine` configuration to your clipboard run the following command:

```bash
npm run copy:screen
```

To copy the `search_machine` configuration to your clipboard run the following command:

```bash
npm run copy:search
```
