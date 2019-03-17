#! /usr/bin/env node -r esm

import path from 'path';

import {saveObjPassthrough} from '@svizzle/file';

import {fields} from '../data/fields_NIH_permutable';
import {endpointNIHCount} from '../src/config';
import {makeQueries, fetchPowerset} from './powersetUtils';

const outputPath = path.resolve(__dirname, '../data/powerset_NIH.json');

const queries = makeQueries(fields);

fetchPowerset(endpointNIHCount, queries)
.then(powerset => ({powerset, fields}))
.then(saveObjPassthrough(outputPath, 2))
.then(data => {
  console.log("ok: data", JSON.stringify(data, null, 2))
})
