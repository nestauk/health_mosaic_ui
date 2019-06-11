import * as _ from 'lamb';

export const filterFields = ({ disabled, status }) =>
  disabled || status !== 'default';

export const filterRuleset = ruleset =>
  !ruleset.disabled && ruleset.terms.every(({ term }) => term.length);

export const stringifyTerms = ({ status, term }) =>
  (status === 'not' ? '-' : '') + term.trim().replace(/ /g, '+');

export const stringifyFields = ({ status, field }) =>
  (status === 'excluded' ? '-' : '') + field;

const filterJoinedFields = _.pipe([_.flatten, _.filterWith(filterFields)]);

const joinWith = delimiter => arr => arr.join(delimiter);

const removeEmptyTerm = ({ term }) => term.length;

export const filterProperties = query => ({
  terms: _.filter(query.terms, removeEmptyTerm),
  fields: filterJoinedFields(Object.values(query.fields)),
});

export const filterQuery = _.pipe([
  _.filterWith(filterRuleset),
  _.mapWith(filterProperties),
]);

const termsToUrl = _.pipe([_.mapWith(stringifyTerms), joinWith(',')]);
const fieldsToUrl = _.pipe([_.mapWith(stringifyFields), joinWith(',')]);

const queryToStringArray = query => ({
  terms: termsToUrl(query.terms),
  fields: fieldsToUrl(query.fields),
});

const stringArrayToUrl = (acc, { terms, fields }) =>
  `${acc}(${terms},in:${fields})`;

export const queryToUrlString = _.pipe([
  _.mapWith(queryToStringArray),
  _.reduceWith(stringArrayToUrl, ''),
]);
