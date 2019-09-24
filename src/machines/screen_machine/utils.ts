import * as _ from 'lamb';
import { isNot } from '@svizzle/utils';

import { searchRouteName } from '../../config';
import { Tab } from '../../stores/interfaces';
import { splitByCurlyBrackets, stringToNumber } from '../../util/string';

export const newTab = (
  id,
  uiQuery,
  index,
  selections = {},
  logic: 'AND' | 'OR' = 'AND',
  route = `/${searchRouteName}`
): Tab => ({
  index,
  name: !isNaN(+id) ? 'Tab ' + (id + 1) : id,
  results: {
    data: [],
    queryObj: [],
  },
  selected: [],
  selections,
  route,
  uiQuery,
  logic,
});

export const toggleLabelBinaryUpdater = labelStatus =>
  labelStatus === 'included' ? 'excluded' : 'included';

export const toggleLabelTernaryUpdater = path =>
  _.updatePath(
    path,
    labelStatus =>
      ({
        default: 'included',
        included: 'excluded',
        excluded: 'default',
      }[labelStatus])
  );

export const hideField = _.setPath('options', false);

export const labelOptionsDisabler = fields => ({
  ...fields,
  fields: {
    content: fields.fields.content.map(hideField),
    subject: fields.fields.subject.map(hideField),
  },
});

export const deselectRule = _.setPath('selected', false);

export const regexQuery = /^([ -]*)([^]*)$/;

export const termBuilder = (acc, next, i, arr) => {
  const isQuery =
    i === arr.length - 1
      ? next.replace(/\s{1}/g, ' ').match(regexQuery)
      : next.trim().match(regexQuery);
  return acc.concat([
    {
      status: isQuery[1].trim() === '-' ? 'not' : 'and',
      term: isQuery[2],
    },
  ]);
};

export const parseQuery = _.pipe([
  s => s.split(','),
  _.reduceWith(termBuilder, []),
  _.filterWith(a => a.term.length),
]);

export const ruleOptionsDeselect = _.setPath('options', false);

export const hideTabLabelOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(labelOptionsDisabler));

export const hideTabRuleOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(ruleOptionsDeselect));

export const toggleTerm = status => (status === 'and' ? 'not' : 'and');

export const removeHistoryEntries = removedTab =>
  _.filterWith(isNot(removedTab));

const removeCurlyBrackets = string => string.replace(/{|}/g, '');
const delimitProperties = string =>
  string.replace(/(id(?=:[0-9]+)|indices|logic|title|selections|query)/g, '|$1**');

const splitMembers = string => string.split('|');
const isTruthy = x => !!x;
const splitKeyValues = string => string.split('**:');
const removeTrailingComma = arr => [arr[0], arr[1].replace(/,$/, '')];

const formatTab = _.pipe([
  removeCurlyBrackets,
  delimitProperties,
  splitMembers,
  _.filterWith(isTruthy),
  _.mapWith(_.pipe([splitKeyValues, removeTrailingComma])),
])

export const extractTabsFromUrl = _.pipe([
  splitByCurlyBrackets,
  _.mapWith(formatTab)
])

export const findHighestId = _.reduceWith((acc, tab) => {
  const currentId = stringToNumber(tab.find(t => t[0] === 'id')[1]);
  return currentId > acc ? currentId : acc;
}, 0);
