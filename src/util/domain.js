import {
  getKey,
  getPath
  groupBy,
  mapValuesWith,
  pipe,
  skipKeys,
  sorterDesc,
  sortWith
} from 'lamb';
import { objectToKeyValueArray } from '@svizzle/utils';

const countBy = key =>
  pipe([
    groupBy(getPath(`_source.${key}`)),
    skipKeys(['', 'null', 'undefined']),
    mapValuesWith(getKey('length')),
    objectToKeyValueArray,
    sortWith([sorterDesc(getKey('value'))]),
  ]);

/* NIH */

export const countByCountry = countBy('placeName_country_organisation');
export const countByCity = countBy('placeName_city_organisation');
