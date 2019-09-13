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

## Test

To run all tests:

`npm run test`

To run tests in a specific file:

`npm run test -- path/to/a/file.test.js`

For example:

`npm run test -- src/util/array.test.js`


## Statecharts

There are some commands that you can run to copy the state machine configurations to your clipboard allowing you to visit the [xstate visualiser](https://xstate.js.org/viz/) and paste the configuration into the window and see a preview of that machine.

To copy the `screen_machine` configuration to your clipboard run the following command:

```bash
npm run copy:screen
```

To copy the `search_machine` configuration to your clipboard run the following command:

```bash
npm run copy:search
```

## ElasticSearch introspection

Use the `BASE_URL` you find in the `src/config.js`, with the VPN enabled if you get any permission error.

- version: at [`BASE_URL`](https://search-health-scanner-5cs7g52446h7qscocqmiky5dn4.eu-west-2.es.amazonaws.com/) we read:

```js
  "version" : {
    "number" : "6.4.2",
  },
```
- indices aliases: [`BASE_URL/_aliases`](https://search-health-scanner-5cs7g52446h7qscocqmiky5dn4.eu-west-2.es.amazonaws.com/_aliases)

## Schema

- [null mappings](https://github.com/nestauk/nesta/blob/dev/nesta/core/schemas/tier_1/field_null_mappings/health_scanner.json)
- [fields aliases](https://github.com/nestauk/nesta/blob/dev/nesta/core/schemas/tier_1/aliases/health_scanner.json)
- field types:
   - [Companies](https://github.com/nestauk/nesta/blob/dev/nesta/core/orms/crunchbase_es_config.json)
   - [Meetup groups](https://github.com/nestauk/nesta/blob/dev/nesta/core/orms/meetup_es_config.json)
   - [Research projects](https://github.com/nestauk/nesta/blob/dev/nesta/core/orms/nih_es_config.json)
