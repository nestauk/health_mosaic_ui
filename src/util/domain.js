import * as _ from 'lamb';
import { objectToKeyValueArray } from '@svizzle/utils';

// TODO move to svizzle as we have objectToKeyValueArray
export const getKey = _.getKey('key');
export const getValue = _.getKey('value');

const countBy = key =>
  _.pipe([
    _.countBy(_.getKey(key)),
    objectToKeyValueArray,
    _.sortWith([
      _.sorterDesc(getValue),
      getKey,
    ]),
  ]);

export const countByCity = countBy('city');
export const countByCountryId = countBy('country_id');
