#! /usr/bin/env node -r esm

import fs from 'fs';
import path from 'path';

import {saveObjPassthrough} from '@svizzle/file';

import {fields} from '../data/fields_NIH';
import {endpointNIHCount} from '../src/config';
import {makeQueriesTree, fetchPermutations} from './coverageUtils';

const outputPath = path.resolve(__dirname, '../data/coverage_NIH.json');

const queriesTree = makeQueriesTree(fields);

fetchPermutations(endpointNIHCount, queriesTree)
.then(saveObjPassthrough(outputPath, 2))
.then(data => {
  console.log("ok: data", JSON.stringify(data, null, 2))
})
