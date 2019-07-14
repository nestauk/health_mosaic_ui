import * as _ from 'lamb';
import { joinWith } from '@svizzle/utils';
import { isValidField } from './transform';

export const isValidRuleset = ruleset =>
  !ruleset.disabled && ruleset.terms.every(hasNonEmptyTerm);

export const stringifyTerms = ({ status, term }) =>
  (status === 'not' ? '-' : '') + term.trim().replace(/ /g, '+');

export const stringifyFields = ({ status, field }) =>
  (status === 'excluded' ? '-' : '') + field;

const filterJoinedFields = _.pipe([
  _.values,
  _.flatten,
  _.filterWith(isValidField),
]);

const hasNonEmptyTerm = ({ term }) => term.length;

export const filterProperties = query => ({
  terms: _.filter(query.terms, hasNonEmptyTerm),
  fields: filterJoinedFields(query.fields),
});

export const filterQuery = _.pipe([
  _.filterWith(isValidRuleset),
  _.mapWith(filterProperties),
]);

const termsToUrl = _.pipe([_.mapWith(stringifyTerms), joinWith(',')]);
const fieldsToUrl = _.pipe([_.mapWith(stringifyFields), joinWith(',')]);

const queryToStringArray = query => ({
  terms: termsToUrl(query.terms),
  fields: fieldsToUrl(query.fields),
});

const stringArrayToUrl = (acc, { terms, fields }) =>
  `${acc}(${terms}` + (fields ? `,in:${fields})` : ')');

export const uiQueryToUrlString = _.pipe([
  filterQuery,
  _.mapWith(queryToStringArray),
  _.reduceWith(stringArrayToUrl, ''),
]);

// selections

export const ignoreToString = ([name, { value }]) =>
  `(!${name}:${value.join(',').replace(/\s/g, '+')})`;

export const nullString = '__none__';
export const excludeToString = ([name, { value }]) => {
  const valueString =
    value
    .map(v => _.isNull(v) ? nullString : v)
    .join(',')
    .replace(/\s/g, '+');

  return `(-${name}:${valueString})`;
}

export const includeToString = ([name, { value }]) =>
  `(${name}:${value.join(',').replace(/\s/g, '+')})`;

/*
[1,2] => 1..2
[[1, 2], [3, 4]] => 1,2..3,4
*/
export const withinToString = ([name, { value }]) =>
  `(${name}:${value[0]}..${value[1]})`;

export const selectionToStringArray = _.pipe([
  _.when(([, { type }]) => type === 'exclude', excludeToString),
  _.when(([, { type }]) => type === 'ignore', ignoreToString),
  _.when(([, { type }]) => type === 'include', includeToString),
  _.when(([, { type }]) => type === 'within', withinToString),
]);

export const selectionToUrlString = _.pipe([
  _.pairs,
  _.mapWith(selectionToStringArray),
  joinWith(''),
]);
