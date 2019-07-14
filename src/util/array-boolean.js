import * as _ from 'lamb';
import {isIterableEmpty} from '@svizzle/utils';

// TODO svizzle
export const isIntersectionEmpty = _.pipe([
  _.apply(_.intersection),
  isIterableEmpty
]);

// TODO svizzle
// [[1, 2, 3], [1, 2, 3, 4, 5]] -> true  (whole [1, 2, 3] overlapping)
// [[1, 2, 3], [1, 2, 4, 5]] -> false (just [1, 2] overlapping)
export const isIntersectionWhole = _.pipe([
  _.collect([
    _.getAt(0),
    _.apply(_.intersection)
  ]),
  _.difference,
  isIterableEmpty
]);
