import * as _ from 'lamb';
import {
  getLength,
  isArray,
  isIterableEmpty,
  makeIsWithinRange,
  objectToKeyValueArray
} from '@svizzle/utils';

import {
  sortValueDescKeyAsc,
  makeIsIncludedIn,
  makeIsNotIncludedIn
} from './array';
import { getValue } from './object.any';

/* object -> object */

// TODO move to svizzle
export const skipNull = _.skipIf(_.isNull);

/* object -> function */

const getType = _.getKey('type');
const isTypeExclude = _.pipe([getType, _.is('exclude')]);
const isTypeInclude = _.pipe([getType, _.is('include')]);
const isTypeWithin = _.pipe([getType, _.is('within')]);
const isValueEmpty = _.pipe([getValue, isIterableEmpty]);
const isValueUndefined = _.pipe([getValue, _.isUndefined]);

// TODO svizzle (+ makeFail)
const makePass = () => _.always(true);

// FIXME, too specific to {lat, lon}
export const makeIsWithin = ([start, end]) =>
  isArray(start)
    ? ({ lon, lat }) =>
      lon >= start[0] &&
      lon <= end[0] &&
      lat >= start[1] &&
      lat <= end[1]
    : makeIsWithinRange([start, end]);

// {type, value} -> fn
const makePredicate = _.adapter([
  _.case(isValueUndefined, makePass),
  _.case(isValueEmpty, makePass),
  _.case(isTypeExclude, _.pipe([getValue, makeIsNotIncludedIn])),
  _.case(isTypeInclude, _.pipe([getValue, makeIsIncludedIn])),
  _.case(isTypeWithin, _.pipe([getValue, makeIsWithin])),
  makePass // unknown selection type
]);

/*
{
  string_key: {type: 'include', value: ['CA', 'FR']},
  range_key: {type: 'within', value: [1, 2]}
  bounds_key: {type: 'within', value: [[1, 2], [3, 4]]}
}
=> filter function
*/
export const makeSelectionFilter = selections =>
  _.filterWith(
    _.allOf(
      _.map(_.pairs(selections), ([key, { type, value }]) =>
        _.pipe([
          _.getKey(key),
          makePredicate({ type, value })
        ])
      )
    )
  );

/*
TODO:
- predicate to filter results based on condition types
  {key: {type, value}, ...} or [{key, type, value}, ...]

  types:
    - 'include': list of items (current implementation)
    - 'within': range of numbers
    - 'is': as for _.areSame
    // - 'equal': value equality, same object/array with nested checks (not sure this will be needed)
- rename
*/

/* object -> array */

// TODO svizzle
/* {
  a: ['a', 'gg'],
  b: ['ad', 'g', 'y']
} -> [
  {key: 'b', value: 3},
  {key: 'a', value: 2}
]
*/
export const objectToValuesCountArray = _.pipe([
  _.mapValuesWith(getLength),
  objectToKeyValueArray,
  sortValueDescKeyAsc
]);
