import * as _ from 'lamb';
import { makeSplitBy } from '@svizzle/utils';

import { joinWithBlank } from './array-string';

export const truncateText = str => {
  let length = 0;

  const stringArray = str.split(' ');
  const index = stringArray.findIndex(word => {
    length += word.length;

    return length < 200 ? false : true;
  });

  return stringArray.slice(0, index).join(' ') + '...';
};
export const splitByComma = makeSplitBy(',');
export const splitByDash = makeSplitBy('-');
export const splitByTwoDots = makeSplitBy('..');
export const stringToNumber = str => +str;
export const convertPlusToSpace = str => str.replace(/\+/g, ' ');
export const removeLast = _.sliceAt(0, -1);
export const addQueryMark = q => (q ? '?' + q : '');

/* case */

export const capitalise = s => s.charAt(0).toUpperCase() + s.slice(1);
export const kebabcaseToCamelcase = _.pipe([
  splitByDash,
  _.mapWith(capitalise),
  joinWithBlank
]);
export const titleCase = s =>
  s.replace(/(?:^|\s)\w/g, match => match.toUpperCase());

export const toUpperCase = _.generic(String.prototype.toUpperCase);
export const toLowerCase = _.generic(String.prototype.toLowerCase);
