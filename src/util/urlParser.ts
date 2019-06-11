import * as _ from 'lamb';
import { newRuleset, newField } from './transform';
// object to query string {} -> '( blah )'

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

// querystring to object '( blah )' -> {}

// (one,-two, in:one, -two)(one,-two, in:one, -two)

export const extractRulesets = str => {
  const re = /\((.*?)\)/g;
  let matchArray = [];
  let match;
  while ((match = re.exec(str)) !== null) {
    matchArray.push(match[1]);
  }

  return matchArray;
};

export const extractTermsFields = str => str.split(',in:');

const splitBy = delimiter => str => str.split(delimiter);
const makeTerm = term => ({
  term: term[0] === '-' ? term.substring(1) : term,
  status: term[0] === '-' ? 'not' : 'and',
});

const makeField = field => ({
  field: field[0] === '-' ? field.substring(1) : field,
  status: field[0] === '-' ? 'excluded' : 'included',
});

export const createTerms = _.pipe([splitBy(','), _.mapWith(makeTerm)]);
export const createFields = _.pipe([splitBy(','), _.mapWith(makeField)]);

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
