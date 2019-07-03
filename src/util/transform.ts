import * as _ from 'lamb';
import { makeSplitBy } from '@svizzle/utils';

import { fieldGroups } from '../config';

const tap = message => x => {
  console.log(message, ': ', x);
  return x;
};

export const toggleBoolean = (x: boolean): boolean => !x;
export const removeEmpty = _.pickIf(x => !!x.value.length);
export const add1 = _.add(1);
export const removeLast = _.sliceAt(0, -1);
export const isNot = x => _.not(_.is(x));
export const splitByComma = makeSplitBy(',');
export const splitByTwoDots = makeSplitBy('..');
export const castToInt = str => parseInt(str, 10);
export const convertPlusToSpace = str => str.replace(/\+/g, ' ');
const removeUndefinedAt1 = _.filterWith(x => !!x[1]);
const addQueryMark = q => (q ? '?' + q : '');

export const paramToString = (acc, [key, value], i) =>
  `${acc}${i !== 0 ? '&' : ''}${key}=${value}`;

export const makeParams: Function = _.pipe([
  _.pairs,
  removeUndefinedAt1,
  _.reduceWith(paramToString, ''),
]);

const makeParamString = _.pipe([makeParams, addQueryMark]);

export const makeRouteUrl = (
  path: string,
  params: { [x: string]: string }
): string => {
  const pathString = path ? (path.startsWith('/') ? path.slice(0) : path) : '';
  const paramString = params.q ? makeParamString(params) : '';

  return `${pathString}${paramString}`;
};

export const isValidField = ({ disabled, status }) => {
  return status !== 'default' && !disabled;
};

const transFormFields = (acc, { field, status }) => [
  ...acc,
  ...fieldGroups[field].map(v => ({ title: v, status })),
];

const createValidFields = fields =>
  fields.filter(isValidField).reduce(transFormFields, []);

const transformTerm = ({ term, status }) => ({ query: term, status });
const removeDisabled = _.pipe([_.getKey('disabled'), isNot(true)]);
const removeEmptyQuery = ({ terms }) =>
  terms && terms.every(({ term }) => term && term.length > 0);

export const createQueryObject = (queries, index) => ({
  query: queries
    .filter(removeDisabled)
    .filter(removeEmptyQuery)
    .map(({ terms, fields: { subject, content } }) => ({
      fields: createValidFields(_.union(content, subject)),
      values: terms.map(transformTerm),
    })),
  index,
});

export const queryToString = query =>
  Object.values(query)
    .map(({ status, term }) => (status === 'not' ? '-' : '') + term, '')
    .reduce(
      (acc, next, i, arr) =>
        acc +
        (i === 0 || next.length < 1 ? '' : ' ') +
        next +
        (arr.length - 1 === i ? '' : ','),
      ''
    );
