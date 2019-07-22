import * as _ from 'lamb';
import { isIterableEmpty } from '@svizzle/utils';

import { makeIsIncluded } from './array';
import { getValue } from './domain';

/* object -> object */

// TODO move to svizzle
export const skipNull = _.skipIf(_.isNull);

/* object -> function */

const getType = _.getKey('type');
const isTypeInclude = _.pipe([getType, _.is('include')]);
const isTypeWithin = _.pipe([getType, _.is('within')]);
const isValueEmpty = _.pipe([getValue, isIterableEmpty]);

export const makeIsWithinBounds = ([start, end]) => ({ lon, lat }) =>
  lon >= start[0] && lat >= start[1] && lon <= end[0] && lat <= end[1];

// {type, value} -> fn
const makePredicate = _.adapter([
  _.case(
    isTypeInclude,
    _.adapter([
      _.case(isValueEmpty, () => _.always(true)), // no selectors === return all items
      _.pipe([getValue, makeIsIncluded]),
    ])
  ),
  _.case(isTypeWithin, _.pipe([getValue, makeIsWithinBounds])),
  x => x,
]);

/*
{
  country_id: {type: 'include', value: ['CA', 'FR']},
  key2: {type: 'within', value: [1, 3]}
}
=> filter function
*/
export const makeSelectionFilter = selections =>
  _.filterWith(
    _.allOf(
      _.map(_.pairs(selections), ([key, { type, value }]) =>
        _.pipe([_.getKey(key), makePredicate({ type, value })])
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
