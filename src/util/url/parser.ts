import * as _ from 'lamb';
import { newRuleset } from './query';
import { convertPlusToSpace } from '../string';
import { nullString } from './builder';

import {
  splitByComma,
  splitByTwoDots,
  stringToNumber
} from '../string';

export const extractParentContents = str => {
  const re = /\((.*?)\)/g;
  let matchArray = [];
  let match;
  while ((match = re.exec(str)) !== null) {
    matchArray.push(match[1]);
  }

  return matchArray.map(s => s.replace(/\s*,\s*/g, ','));
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
  extractParentContents,
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
const disableEdit = query => ({ ...query, isEditing: false });

export const parseQueryUrl = _.pipe([
  makeRulesetObject,
  _.mapWith(applyRulesFromQuery),
  selectFirstRule,
  _.mapWith(disableEdit),
]);

// selection

// TODO svizzle
const splitByColon = selectString => selectString.split(':');

export const detectType = ([key, value]) => {
  if (key.startsWith('-')) {
    return [key.substring(1), value, 'exclude'];
  }
  if (key.startsWith('!')) {
    return [key.substring(1), value, 'ignore'];
  }
  if (value.match(/.+\.\..+/)) {
    return [key, value, 'within'];
  }
  if (value.match(/.+,.+/)) {
    return [key, value, 'include'];
  }

  return [key, value, 'include'];
};

const isListString = str => str.match(/.+,.+/);

// TODO svizzle
const parseNumbersList = _.pipe([splitByComma, _.mapWith(stringToNumber)]);

const parseNumericList = _.pipe([
  splitByTwoDots,
  _.mapWith(
    _.condition(
      isListString,
      parseNumbersList, // bounds
      stringToNumber // range
    )
  ),
]);

export const convertNumericList = ([key, value, type]) => [
  key,
  {
    type,
    value: parseNumericList(value),
  },
];

const convertIfNullString = _.when(_.is(nullString), _.always(null));
const parseStringList = _.pipe([
  splitByComma,
  _.mapWith(_.pipe([convertPlusToSpace, convertIfNullString])),
]);
export const convertStringList = ([key, value, type]) => [
  key,
  {
    type,
    value: parseStringList(value),
  },
];

const handleTypes = _.pipe([
  _.when(([, , type]) => type === 'exclude', convertStringList),
  _.when(([, , type]) => type === 'ignore', convertStringList),
  _.when(([, , type]) => type === 'include', convertStringList),
  _.when(([, , type]) => type === 'within', convertNumericList),
]);

const parseSelection = _.pipe([splitByColon, detectType, handleTypes]);

export const parseSelectionUrl = _.pipe([
  extractParentContents,
  _.mapWith(parseSelection),
  _.fromPairs,
]);
