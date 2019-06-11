import * as _ from 'lamb';
import { newRuleset } from './query';
import { splitByComma } from './transform';

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
