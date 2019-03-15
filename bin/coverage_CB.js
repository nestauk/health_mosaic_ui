#! /usr/bin/env node -r esm

import fs from 'fs';
import path from 'path';

import {saveObjPassthrough} from '@svizzle/file';

import {fields} from '../data/fields_CB';
import {endpointCBCount} from '../src/config';

import {makeQueriesTree, fetchPermutations} from './coverageUtils';

const outputPath = path.resolve(__dirname, '../data/coverage_CB.json');

const queriesTree = makeQueriesTree(fields);

fetchPermutations(endpointCBCount, queriesTree)
.then(saveObjPassthrough(outputPath, 2))
.then(data => {
  console.log("ok: data", JSON.stringify(data, null, 2))
})
