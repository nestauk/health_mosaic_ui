import * as _ from 'lamb';
import { objectToKeyValueArray } from '@svizzle/utils';

export const getKey = _.getKey('key');
export const getValue = _.getKey('value');

const countBy = key =>
  _.pipe([
    _.countBy(_.getKey(key)),
    objectToKeyValueArray,
    _.sortWith([_.sorterDesc(getValue)]),
  ]);

export const countByCity = countBy('city');
export const countByCountryId = countBy('country_id');

export const makeCountryIdToLabel = _.pipe([
  _.indexBy(_.getKey('country_id')),
  _.mapValuesWith(_.getKey('country'))
]);
