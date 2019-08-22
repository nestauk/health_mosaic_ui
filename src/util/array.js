import * as _ from 'lamb';
import { extent, pairs } from 'd3-array';
import {
  arrayMaxWith,
  arrayMinWith,
  hasIterableLength1,
  isArray,
  isIterableEmpty,
  isIterableNotEmpty,
  isNotNil,
  makeIsWithinRange
} from '@svizzle/utils';

import { isIntersectionEmpty, isIntersectionWhole } from './array-boolean';
import { getKey, getValue, getValues } from './object.any';

/* binning */

export const exactAmountBins = ({
  array,
  size,
  accessor = _.identity,
  interval = null
}) => {
  const activeRange = interval
    ? _.sort(interval)
    : extent(array, accessor);
  const [min, max] = activeRange;

  if (min === max) {
    return [{values: array}]
  }

  const minFloor = Math.floor(min);
  const maxCeil = Math.ceil(max);
  const step = Math.ceil((max - minFloor) / size);
  const intMax = minFloor + step * size;
  const ranges = pairs(_.range(minFloor, intMax, step).concat([intMax]));

  // TODO svizzle
  const findRangeIndex = _.adapter(
    _.map(ranges, (range, index) => {
      const predicate = _.pipe([
        accessor,
        _.allOf([
          makeIsWithinRange(activeRange),
          makeIsWithinRange(range),
        ])
      ]);

      return value => predicate(value) ? index : undefined
    })
  );

  return _.reduce(array,
    (acc, item) => {
      const index = findRangeIndex(item);
      isNotNil(index) && acc[index].values.push(item)
      return acc;
    },
    _.map(ranges, range => ({range, values: []}))
  );
}

// TODO svizzle
/* bins getters and functions */

export const areValidBins = _.allOf([
  isIterableNotEmpty,
  _.pathExists('0.range'),
  _.pipe([_.getPath('0.range'), isNotNil])
]);

export const doBinsHaveRange = _.pipe([
  _.getPath('0.range'),
  isNotNil,
]);

export const hasNoBins = _.pipe([
  hasIterableLength1,
  _.getPath('0.range'),
  _.isNil,
]);

export const getBinsItems = _.pipe([
  _.mapWith(_.getKey('values')),
  _.flatten,
]);

export const getBinsMax = arrayMaxWith(_.getPath('values.length'));
export const getBinsMin = arrayMinWith(_.getPath('values.length'));

const isNonEmptyBin = _.pipe([getValues, isIterableNotEmpty]);
const findFirstNonEmptyBinIndex = _.findIndexWhere(isNonEmptyBin);
const findLastNonEmptyBinIndex = _.findLastIndexWhere(isNonEmptyBin);

export const trimBins = _bins => {
  const start = findFirstNonEmptyBinIndex(_bins);
  const end = findLastNonEmptyBinIndex(_bins);

  return {
    bins: _.slice(_bins, start, end + 1),
    end,
    start
  };
};

/* ticks */

export const makeBinsTicks = _.pipe([
  _.mapWith(_.getKey('range')),
  _.flatten,
  _.uniques
]);
export const makeBinsVisibleTicks = _.pipe([
  _.filterWith(_.getPath('values.length')),
  makeBinsTicks
]);

/* rest */

export const makeIsNotIncludedIn = array =>
  input => isArray(input)
    ? isIntersectionEmpty([array, input])
    : !array.includes(input);
export const makeIsIncludedIn = array =>
  input => isArray(input)
    ? isIntersectionWhole([array, input])
    : array.includes(input);

/* permutations */

/*
[
  {foo: "a"},
  {foo: "b"},
  {bar: "c"},
  {bar: "d"}
]
=>
[
  [{foo: "a"}, {foo: "b"}],
  [{foo: "a"}, {bar: "c"}],
  [{foo: "a"}, {bar: "d"}],
  [{foo: "b"}, {bar: "c"}],
  [{foo: "b"}, {bar: "d"}],
  [{bar: "c"}, {bar: "d"}]
]
*/
export const makeBiPermutations = arr =>
  _.reduce(arr, (acc, item, index, array) => {
    for (let cursor = index + 1; cursor < array.length; cursor++) {
      acc.push([item, array[cursor]]);
    }
    return acc;
  }, []);

export const makeBiPermutationsWith = accessor => _.pipe([
  accessor,
  _.sortWith(),
  makeBiPermutations,
]);

export const makeBiPermutationsBy = key =>
  makeBiPermutationsWith(_.getKey(key));

// TODO move to svizzle
export const sortValueDescKeyAsc = _.sortWith([
  _.sorterDesc(getValue),
  getKey
]);
