import * as _ from 'lamb';
import { isNot } from '@svizzle/utils';

import { fieldGroups } from '../../config';
import { removeUndefinedAt1 } from '../array-array';
import { addQueryMark } from '../string'

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
  const paramString = params.q ? makeParamString(params) : '';

  return `${path}${paramString}`;
};

export const isValidField = ({ disabled, status }) => {
  return status !== 'default' && !disabled;
};

const transFormFields = (acc, { field, status }) => [
  ...acc,
  { title: fieldGroups[field], status },
];

const createValidFields = fields =>
  fields.filter(isValidField).reduce(transFormFields, []);

const transformTerm = ({ term, status }) => ({ query: term, status });
const removeDisabled = _.pipe([_.getKey('disabled'), isNot(true)]);
const removeEmptyQuery = ({ terms }) =>
  terms && terms.every(({ term }) => term && term.length > 0);

export const createQueryObject = (queries, index, logic) => ({
  query: queries
    .filter(removeDisabled)
    .filter(removeEmptyQuery)
    .map(({ terms, fields: { subject, content } }) => ({
      fields: createValidFields(_.union(content, subject)),
      values: terms.map(transformTerm),
    })),
  index,
  logic,
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
