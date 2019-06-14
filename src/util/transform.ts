import * as _ from 'lamb';
import { fieldGroups } from '../config';

export const toggleBoolean = (x: boolean): boolean => !x;
export const add1 = _.add(1);
export const removeLast = _.sliceAt(0, -1);
export const isNot = _.not(_.is); // utils

export const paramToString = (acc, [key, value], i) =>
  `${i !== 0 ? '&' : ''}${acc}${key}=${value}`;

export const makeParams = _.pipe([_.pairs, _.reduceWith(paramToString, '')]);

export const makeRouteUrl = (path, params) => {
  console.log(path, params);
  console.log(params && _.pairs(params));
  const paramString = params ? '?' + makeParams(params) : '';

  const pathString = Array.isArray(params) ? path.join('/') : path;
  console.log(path, params);
  return `/${pathString}${paramString}`;
};

export const filterQueryObject = ({ disabled, status }) => {
  return status !== 'default' && !disabled;
};

const transFormFields = (acc, { field, status }) => [
  ...acc,
  ...fieldGroups[field].map(v => ({ title: v, status })),
];

const createValidFields = fields =>
  fields.filter(filterQueryObject).reduce(transFormFields, []);

const transformValues = ({ term, status }) => ({ query: term, status });

export const createQueryObject = queries =>
  queries.map(({ terms, fields: { subject, content } }) => ({
    fields: createValidFields(_.union(content, subject)),
    values: terms.map(transformValues),
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
