import * as _ from 'lamb';
import { makeSplitBy } from '@svizzle/utils';

import { fieldGroups } from '../config';

export const toggleBoolean = (x: boolean): boolean => !x;
export const add1 = _.add(1);
export const removeLast = _.sliceAt(0, -1);
export const isNot = _.not(_.is); // utils
export const splitByComma = makeSplitBy(',');

export const paramToString = (acc, [key, value], i) =>
  `${i !== 0 ? '&' : ''}${acc}${key}=${value}`;

export const makeParams = _.pipe([_.pairs, _.reduceWith(paramToString, '')]);

export const makeRouteUrl = (path, params) => {
  const paramString = params ? '?' + makeParams(params) : '';
  const pathString = Array.isArray(params) ? path.join('/') : path;

  return `/${pathString}${paramString}`;
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

export const createQueryObject = queries =>
  queries.map(({ terms, fields: { subject, content } }) => ({
    fields: createValidFields(_.union(content, subject)),
    values: terms.map(transformTerm),
  }));

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
