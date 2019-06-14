import * as _ from 'lamb';
import { joinWith, makeArrayTransformer, makeSplitBy } from '@svizzle/utils';
import { newRuleset } from './query';
import { filterQueryObject } from './transform';

export const isValidRuleset = ruleset =>
  !ruleset.disabled && ruleset.terms.every(hasNonEmptyTerm);

export const stringifyTerms = ({ status, term }) =>
  (status === 'not' ? '-' : '') + term.trim().replace(/ /g, '+');

export const stringifyFields = ({ status, field }) =>
  (status === 'excluded' ? '-' : '') + field;

const filterJoinedFields = _.pipe([
  _.values,
  _.flatten,
  _.filterWith(filterQueryObject),
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

export const extractRulesets = str => {
  const re = /\((.*?)\)/g;
  let matchArray = [];
  let match;
  while ((match = re.exec(str)) !== null) {
    matchArray.push(match[1]);
  }

  return matchArray;
};

export const extractTermsFields = str => {
  const parts = str.split(',in:');
  return parts[1] ? parts : [parts[0], ''];
};

const splitByComma = makeSplitBy(',');

const makeTerm = term => ({
  term: term[0] === '-' ? term.substring(1) : term,
  status: term[0] === '-' ? 'not' : 'and',
});

const makeField = field => ({
  field: field[0] === '-' ? field.substring(1) : field,
  status: field[0] === '-' ? 'excluded' : 'included',
});

export const createTerms = _.pipe([splitByComma, _.mapWith(makeTerm)]);
export const createFields = _.pipe([splitByComma, _.mapWith(makeField)]);

export const makeRuleset = ([terms, fields]) => [
  createTerms(terms),
  createFields(fields),
];

export const makeRulesetObject = _.pipe([
  extractRulesets,
  _.mapWith(extractTermsFields),
  _.mapWith(makeRuleset),
]);

const replaceMatchingFields = newFields => defaultField => {
  const matchingField = newFields.find(
    newField => defaultField.field === newField.field
  );
  return matchingField ? { ...defaultField, ...matchingField } : defaultField;
};

const applyFieldsFromQuery = newFields => ({ subject, content }) => ({
  subject: _.map(subject, replaceMatchingFields(newFields)),
  content: _.map(content, replaceMatchingFields(newFields)),
});

export const applyRulesFromQuery = array =>
  _.pipe([
    _.setPath('terms', array[0]),
    _.updatePath('fields', applyFieldsFromQuery(array[1])),
  ])(newRuleset());

const selectFirstRule = _.setPath(`0.selected`, true);

export const parseQueryUrl = _.pipe([
  makeRulesetObject,
  _.mapWith(applyRulesFromQuery),
  selectFirstRule,
]);
