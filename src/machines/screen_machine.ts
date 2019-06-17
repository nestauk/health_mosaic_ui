import { get } from 'svelte/store';
import { goto } from '@sapper/app';
import { Machine, interpret } from 'xstate';
import * as _ from 'lamb';

import { createSearchConfig, searchOptions } from './search_machine';
import { contentAliases, subjectAliases } from '../config';
import { Tab } from '../stores/interfaces';
import { parseQueryUrl } from '../util/urlParser';
import { uiQueryToUrlString } from '../util/urlBuilder';

import { newRuleset, newField, newTerm } from '../util/query';
import {
  add1,
  isNot,
  makeRouteUrl,
  toggleBoolean,
  removeLast,
} from '../util/transform';

const screen_config = {
  id: 'screen',
  type: 'parallel',
  //onEntry: ['createTab', 'setCurrentTab', 'pushHistory'],
  states: {
    Form: {
      id: 'Form',
      initial: 'Idle',
      on: {
        TAB_DELETED: {
          target: 'Form.Idle',
        },
        TAB_CREATED: {
          target: 'Form.Idle',
        },
        TAB_SELECTED: {
          target: 'Form.Idle',
        },
        TAB_RENAMED: {
          target: 'Form.Idle',
        },
        TAB_VISIBILITY_TOGGLED: {
          actions: ['toggleTabVisibility'],
        },
        LABEL_CLICKED: {
          actions: ['toggleLabelTernary'],
        },
        TERM_CLICKED: {
          actions: ['toggleTermStatus'],
        },
        INDEX_CHANGED: {
          actions: ['changeIndex'],
        },
      },
      states: {
        Idle: {
          on: {
            TEXT_CHANGED: {
              actions: ['updateCurrentRuleText'],
            },
            RULESET_CREATED: {
              actions: ['createRuleset', 'selectRule'],
            },
            RULE_SELECTED: {
              actions: ['selectRule'],
            },
            LABEL_OPTIONS_SELECTED: {
              target: 'LabelOptionsShowing',
            },
            RULE_OPTIONS_SELECTED: {
              target: 'RuleOptionsShowing',
            },
          },
        },
        LabelOptionsShowing: {
          onEntry: ['showLabelOptions'],
          on: {
            LABEL_DISABLED: {
              actions: ['disableLabel'],
            },
            LABEL_TOGGLED: {
              actions: ['toggleLabelBinary'],
            },
            LABEL_DELETED: {
              actions: ['deleteLabel'],
              target: 'Idle',
            },
            LABEL_OPTIONS_DISMISSED: {
              target: 'Idle',
            },
          },

          onExit: ['hideLabelOptions'],
        },
        RuleOptionsShowing: {
          onEntry: ['showRuleOptions'],
          on: {
            RULE_DISABLED: {
              actions: ['disableRule'],
            },
            RULE_COPIED: {
              actions: ['copyRule', 'selectRule'],
            },
            RULE_DELETED: {
              actions: ['deleteRule'],
              target: 'Idle',
            },
            RULE_OPTIONS_DISMISSED: {
              target: 'Idle',
            },
          },

          onExit: ['hideRuleOptions'],
        },
      },
    },
    Tabs: {
      id: 'Tabs',
      initial: 'Idle',
      states: {
        Idle: {
          on: {
            TAB_DELETED: {
              actions: ['deleteTab', 'popHistory', 'setUrlQuery'],
            },
            TAB_CREATED: {
              actions: [
                'createTab',
                'setCurrentTab',
                'pushHistory',
                'setUrlQuery',
              ],
            },
            TAB_SELECTED: {
              actions: ['setCurrentTab', 'pushHistory', 'setUrlQuery'],
            },
            TAB_RENAMED: {
              actions: ['setTabLabel'],
            },
          },
        },
      },
    },
    Facet: {
      id: 'Facet',
      initial: 'Interactive',
      on: {
        PENDING: {
          target: '#Disabled',
          actions: () => console.log('PENDING'),
        },
        SUCCESS: {
          target: '#Interactive',
          actions: () => console.log('SUCCESS'),
        },
        ERROR: {
          actions: () => console.log('ERROR'),
        },
        MATCHING: {
          actions: () => console.log('MATCHING'),
        },
        DIRTY: {
          actions: () => console.log('DIRTY'),
        },
        ROUTE_CHANGED: {
          target: '#Disabled',
          actions: ['changeRoute'],
        },
      },
      states: {
        Interactive: {
          id: 'Interactive',
        },
        Disabled: {
          id: 'Disabled',
          on: {
            ROUTE_CHANGE_COMPLETED: {
              target: '#Interactive',
            },
          },
        },
      },
    },
  },
};

export const screen_machine_base = Machine(screen_config);

const newTab = (machine, id, uiQuery, index): Tab => ({
  uiQuery,
  searchMachine: machine,
  name: 'Tab' + id,
  visible: true,
  results: {
    data: [],
    queryObj: [],
  },
  index,
});

const toggleLabelBinaryUpdater = labelStatus =>
  labelStatus === 'included' ? 'excluded' : 'included';

const toggleLabelTernaryUpdater = path =>
  _.updatePath(
    path,
    labelStatus =>
      ({
        default: 'included',
        included: 'excluded',
        excluded: 'default',
      }[labelStatus])
  );

const hideField = _.setPath('options', false);

const labelOptionsDisabler = fields => ({
  ...fields,
  fields: {
    content: fields.fields.content.map(hideField),
    subject: fields.fields.subject.map(hideField),
  },
});

const deselectRule = _.setPath('selected', false);

const regexQuery = /^([ -]*)([^]*)$/;

const termBuilder = (acc, next, i, arr) => {
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

const parseQuery = _.pipe([
  s => s.split(','),
  _.reduceWith(termBuilder, []),
  _.filterWith((a, i, arr) => (i === arr.length - 1 ? true : a.term.length)),
]);

const ruleOptionsDeselect = _.setPath('options', false);

const hideTabLabelOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(labelOptionsDisabler));

const hideTabRuleOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(ruleOptionsDeselect));

const toggleTerm = status => (status === 'and' ? 'not' : 'and');

const removeHistoryEntries = removedTab => _.filterWith(isNot(removedTab));

export const screen_options = {
  actions: {
    createTab: (
      { screenStore, idStore, queryObj, currentTab },
      { queryParams, ESIndex }
    ) => {
      // xstate 4.6 -- spawn?
      const id = get(idStore);
      const screenMachine = interpret(
        Machine(
          createSearchConfig(screen_machine_base),
          searchOptions
        ).withContext({ screenStore, queryObj, currentTab, path: '' })
      );

      screenMachine.onTransition(e => screenStore.update(s => s));

      screenMachine.start();
      screenStore.update(
        _.setKey(
          id,
          newTab(
            screenMachine,
            id,
            queryParams ? parseQueryUrl(queryParams) : [newRuleset(true)],
            ESIndex ? ESIndex : 'all'
          )
        )
      );
      idStore.update(add1);
    },
    deleteTab: ({ screenStore, historyStore, currentTab }, { id }) => {
      // xstate 4.6 -- spawn?
      let store = get(screenStore);

      store[id].searchMachine.stop();
      screenStore.update(_.skipKeys([id]));

      store = get(screenStore);
      const tabs = Object.keys(store);

      historyStore.update(removeHistoryEntries(id));

      const history = get(historyStore);
      const prev = history[history.length - 2];

      currentTab.set(prev ? prev : tabs[0]);
    },
    setCurrentTab: ({ currentTab }, { id = 0 }) => {
      currentTab.set(id);
    },
    setTabLabel: ({ screenStore }, { labelText, id }) => {
      screenStore.update(_.setPath(`${id}.name`, labelText));
    },
    popHistory: ({ historyStore }) => {
      historyStore.update(removeLast);
    },
    pushHistory: ({ historyStore }, { id = 0 }) => {
      historyStore.update(_.append(id));
    },
    toggleLabelBinary: (
      { screenStore },
      { tabId, ruleIndex, section, labelIndex }
    ) => {
      const updateLabelStatus = _.updatePath(
        `${tabId}.uiQuery.${ruleIndex}.fields.${section}.${labelIndex}.status`,
        toggleLabelBinaryUpdater
      );

      screenStore.update(updateLabelStatus);
    },
    toggleLabelTernary: (
      { screenStore },
      { tabId, ruleIndex, section, labelIndex }
    ) => {
      const path = `${tabId}.uiQuery.${ruleIndex}.fields.${section}.${labelIndex}.status`;
      screenStore.update(toggleLabelTernaryUpdater(path));
    },
    disableLabel: (
      { screenStore },
      { tabId, ruleIndex, section, labelIndex }
    ) => {
      const disableLabelStatus = _.updatePath(
        `${tabId}.uiQuery.${ruleIndex}.fields.${section}.${labelIndex}.disabled`,
        toggleBoolean
      );

      screenStore.update(disableLabelStatus);
    },
    showLabelOptions: (
      { screenStore },
      { tabId, ruleIndex, section, labelIndex }
    ) => {
      const showLabelOption = _.setPath(
        `${tabId}.uiQuery.${ruleIndex}.fields.${section}.${labelIndex}.options`,
        true
      );

      screenStore.update(_.pipe([hideTabLabelOptions(tabId), showLabelOption]));
    },
    hideLabelOptions: ({ screenStore }, { tabId }) => {
      screenStore.update(hideTabLabelOptions(tabId));
    },

    deleteLabel: (
      { screenStore },
      { tabId, ruleIndex, section, labelIndex }
    ) => {
      const updateLabelStatus = _.setPath(
        `${tabId}.uiQuery.${ruleIndex}.fields.${section}.${labelIndex}.status`,
        'default'
      );

      screenStore.update(updateLabelStatus);
    },
    selectRule: ({ screenStore }, { tabId, targetIndex = 0 }) => {
      const hideOptions = _.updatePath(
        `${tabId}.uiQuery`,
        _.mapWith(deselectRule)
      );

      const selectRule = _.setPath(
        `${tabId}.uiQuery.${targetIndex}.selected`,
        true
      );

      screenStore.update(_.pipe([hideOptions, selectRule]));
    },
    updateCurrentRuleText: ({ screenStore }, { tabId, ruleIndex, text }) => {
      const parseText = _.setPath(
        `${tabId}.uiQuery.${ruleIndex}.terms`,
        parseQuery(text)
      );

      screenStore.update(parseText);
    },
    showRuleOptions: ({ screenStore }, { tabId, ruleIndex }) => {
      const showRuleOptions = _.setPath(
        `${tabId}.uiQuery.${ruleIndex}.options`,
        true
      );

      screenStore.update(_.pipe([hideTabRuleOptions(tabId), showRuleOptions]));
    },
    hideRuleOptions: ({ screenStore }, { tabId }) => {
      screenStore.update(hideTabRuleOptions(tabId));
    },
    disableRule: ({ screenStore }, { tabId, ruleIndex }) => {
      const toggleRule = _.updatePath(
        `${tabId}.uiQuery.${ruleIndex}.disabled`,
        toggleBoolean
      );
      screenStore.update(toggleRule);
    },
    copyRule: ({ screenStore }, { tabId, ruleIndex }) => {
      const updater = rules => _.appendTo(rules, _.getIndex(rules, ruleIndex));
      const copyRule = _.updatePath(`${tabId}.uiQuery`, updater);

      screenStore.update(copyRule);
    },
    deleteRule: ({ screenStore }, { tabId, ruleIndex }) => {
      const uiQuery = get(screenStore)[tabId].uiQuery;
      const currentSelection = uiQuery.findIndex(({ selected }) => selected);

      if (uiQuery.length > 1) {
        const deleteRule = _.updatePath(
          `${tabId}.uiQuery`,
          _.filterWith((_, i) => i !== ruleIndex)
        );

        const newIndex =
          currentSelection === ruleIndex
            ? 0
            : currentSelection > ruleIndex
            ? currentSelection - 1
            : currentSelection;

        const hideOptions = _.updatePath(
          `${tabId}.uiQuery`,
          _.mapWith(deselectRule)
        );

        const updateSelected = _.setPath(
          `${tabId}.uiQuery.${newIndex}.selected`,
          true
        );

        screenStore.update(_.pipe([deleteRule, hideOptions, updateSelected]));
      } else {
        const blankRule = _.setPath(`${tabId}.uiQuery.0`, {
          terms: [newTerm()],
          fields: {
            subject: newField(subjectAliases),
            content: newField(contentAliases),
          },
          options: false,
          disabled: false,
          selected: true,
        });
        screenStore.update(blankRule);
      }
    },
    toggleTermStatus: ({ screenStore }, { tabId, ruleIndex, termIndex }) => {
      const toggleTermStatus = _.updatePath(
        `${tabId}.uiQuery.${ruleIndex}.terms.${termIndex}.status`,
        toggleTerm
      );
      screenStore.update(toggleTermStatus);
    },
    createRuleset: ({ screenStore }, { tabId }) => {
      const updater = rules => _.appendTo(rules, newRuleset());
      const newRule = _.updatePath(`${tabId}.uiQuery`, updater);

      screenStore.update(newRule);
    },
    toggleTabVisibility: ({ screenStore }, { id }) => {
      screenStore.update(_.updatePath(`${id}.visible`, toggleBoolean));
    },
    changeRoute: (_, { path }) => {
      goto(path);
    },
    setUrlQuery: ({ screenStore, queryObj, currentTab }) => {
      const tab = get(currentTab);
      const currentQuery = get(screenStore)[tab];

      const urlQuery = {
        q: uiQueryToUrlString(currentQuery.uiQuery),
        i: currentQuery.index && currentQuery.index,
      };

      goto(makeRouteUrl('search', urlQuery.q ? urlQuery : false));
    },
    changeIndex: ({ screenStore }, { tabId, ESIndex }) => {
      screenStore.update(_.setPath(`${tabId}.index`, ESIndex));
    },
  },
};
// @ts-ignore
export const screen_machine = screen_machine_base.withConfig(screen_options);
