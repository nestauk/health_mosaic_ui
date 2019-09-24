import * as _ from 'lamb';
import { objectToKeyValueArray } from '@svizzle/utils';

import { sortValueDescKeyAsc } from './array';
import { getId } from './object.string';

// TODO svizzle
const countByAsKeyValue = key =>
  _.pipe([
    _.countBy(_.getKey(key)),
    objectToKeyValueArray,
    sortValueDescKeyAsc
  ]);
export const isNotNull = _.not(_.isNull);

export const noneLabel = 'none';

/* accessors */

export const getLabel = _.getKey('label');

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
