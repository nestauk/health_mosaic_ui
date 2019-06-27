import * as _ from 'lamb';

import { searchRouteName } from '../../config';
import { Tab } from '../../stores/interfaces';
import { isNot } from '../../util/transform';

export const newTab = (id, uiQuery, index): Tab => ({
  uiQuery,
  name: 'Tab' + id,
  visible: true,
  results: {
    data: [],
    queryObj: [],
  },
  index,
  route: `/${searchRouteName}`,
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
  _.filterWith((a, i, arr) => (i === arr.length - 1 ? true : a.term.length)),
]);

export const ruleOptionsDeselect = _.setPath('options', false);

export const hideTabLabelOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(labelOptionsDisabler));

export const hideTabRuleOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(ruleOptionsDeselect));

export const toggleTerm = status => (status === 'and' ? 'not' : 'and');

export const removeHistoryEntries = removedTab =>
  _.filterWith(isNot(removedTab));
