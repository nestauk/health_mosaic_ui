#! /usr/bin/env node -r esm

import path from 'path';

import {saveObjPassthrough} from '@svizzle/file';

import {fields} from '../data/fields_NIH_permutable';
import {endpointNIHCount} from '../src/config';
import {makeQueries, fetchPowerset} from './powersetUtils';

const outputPath = path.resolve(__dirname, '../data/powerset_NIH.json');

const queries = makeQueries(fields);

// console.log(JSON.stringify(queries, null, 2));

fetchPowerset(endpointNIHCount, queries)
.then(powerset => ({powerset, fields}))
.then(saveObjPassthrough(outputPath, 2))
.then(data => {
  console.log("ok: data", JSON.stringify(data, null, 2))
})
