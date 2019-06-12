import * as _ from 'lamb';
import { extent, pairs } from 'd3-array';
import { arrayMaxWith, makeIsWithinRange } from '@svizzle/utils';

/* binning */

export const exactAmountBins = (array, amount, accessor = _.identity) => {
  const [min, max] = extent(array, accessor);
  const step = (max - min) / amount;

  // rounding errors might give a range max lower than the actual max
  // which might then exclude items in the last bin
  const ranges = pairs(_.range(min, max, step).concat([max]));

  return _.map(ranges, range => ({
    range,
    values: _.filter(array, _.pipe([
      accessor,
      makeIsWithinRange(range)
    ]))
  }));
}

export const getBinsItems = _.pipe([
  _.mapWith(_.getKey('values')),
  _.flatten,
]);

export const getBinsMax = arrayMaxWith(_.getPath('values.length'));

// ticks

export const makeBinsTicks = _.pipe([
  _.mapWith(_.getKey('range')),
  _.flatten,
  _.uniques
]);
export const makeBinsVisibleTicks = _.pipe([
  _.filterWith(_.getPath('values.length')),
  makeBinsTicks
]);
