#! /usr/bin/env node -r esm

import { resolve } from 'path';
import { saveObj } from '@svizzle/file';
import * as _ from 'lamb';

const continents = require(resolve(__dirname, '../data/geo/continent_codes_names.json'));
const countries = require(resolve(__dirname, '../data/geo/country_codes_names.json'));
const states = require(resolve(__dirname, '../data/geo/us_canada_states.json'));
const destPath = resolve(__dirname, '../data/geo/iso_a2_to_name_by_type.json');
const save = saveObj(destPath, 2);

const mapCodeToName = _.pipe([
  _.indexBy(_.getKey('Code')),
  _.mapValuesWith(_.getKey('Name'))
]);

const mapNameToCode = _.pipe([
  _.indexBy(_.getKey('Name')),
  _.mapValuesWith(_.getKey('Code'))
]);

const geocodes = {
  continents: mapCodeToName(continents),
  countries: mapCodeToName(countries),
  states: mapNameToCode(states)
}

save(geocodes)
.then(() => {console.log(`Saved geocodes in ${destPath}`)})
