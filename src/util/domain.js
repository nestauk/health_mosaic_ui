import * as _ from 'lamb';
import { objectToKeyValueArray } from '@svizzle/utils';

import { sortValueDescKeyAsc } from './array';
import { getId } from './object.string';
import { isNotNull } from './any.boolean';

// TODO svizzle
const countByAsKeyValue = key =>
  _.pipe([
    _.countBy(_.getKey(key)),
    objectToKeyValueArray,
    sortValueDescKeyAsc
  ]);

export const noneLabel = 'none';

/* accessors */

export const getLabel = _.getKey('label');
export const getName = _.getKey('name');

export const countByCityAsKeyValue = countByAsKeyValue('city');
export const countByCountryIdAsKeyValue = countByAsKeyValue('country_id');
export const countByTypeAsKeyValue = countByAsKeyValue('type');

export const termsIsNotNull = _.pipe([_.getKey('terms'), isNotNull]);
export const getIdsByTerms = arr => _.reduce(arr, (acc, item) => {
  termsIsNotNull(item) && item.terms.forEach(term => {
    !acc[term] && (acc[term] = []);
    acc[term].push(item.id);
  });

  return acc;
}, {});

export const fieldToLabel = {
  city: 'City',
  continent_id: 'Continent',
  continent: 'Continent',
  cost_ref: 'Funding',
  countries_ids: 'Mentioned countries',
  country_id: 'Country',
  country: 'Country',
  end: 'End date',
  funders: 'Funders',
  location: 'Location',
  name: 'Name',
  novelty: 'Novelty',
  region: 'Region',
  score: 'ES score',
  sdg_labels: 'SDG Labels',
  start: 'Start date',
  state_id: 'State',
  summary: 'Summary',
  terms: 'Terms',
  title: 'Title',
  type: 'Type',
};

// TODO use from svizzle next release
// lookups to split metrics by item type
// const makeKeyed = value => _.pipe([
//     _.collect([_.identity, _.mapWith(_.always(value))]),
//     _.apply(_.make)
// ]);
// const makeKeyedEmptyArray = makeKeyed([]);
// const makeLookup = () => makeKeyedEmptyArray(_.appendTo(types, 'all'));

// TODO svizzle
export const isKeyNullBy = key => _.pipe([_.getKey(key), _.isNull]);

export const makeIndexByID = _.indexBy(getId);
