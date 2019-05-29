import { Machine, interpret } from 'xstate';
import { createSearchConfig, searchOptions } from './search_machine';
import { contentAliases, subjectAliases } from '../config';
import { Tab, UIField, UITerm } from '../stores/interfaces';
import { derived, get, writable } from 'svelte/store';
import { toggle, add1, removeLast } from '../util/transform';

import * as _ from 'lamb';

const screen_config = {
  id: 'screen',
  type: 'parallel',
  entry: ['createTab', 'setCurrentTab', 'pushHistory'],
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
        LABEL_CLICKED: {
          actions: ['toggleLabelTernary'],
        },
        QUERY_CLICKED: {
          actions: ['toggleTermStatus'],
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
          entry: ['showLabelOptions'],
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

          exit: ['hideLabelOptions'],
        },
        RuleOptionsShowing: {
          entry: ['showRuleOptions'],
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

          exit: ['hideRuleOptions'],
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
              actions: ['deleteTab', 'popHistory'],
            },
            TAB_CREATED: {
              actions: ['createTab', 'setCurrentTab', 'pushHistory'],
            },
            TAB_SELECTED: {
              actions: ['setCurrentTab', 'pushHistory'],
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
        },
        SUCCESS: {
          target: '#Interactive',
        },
        FAIL: {},
      },
      states: {
        Interactive: {
          id: 'Interactive',
        },
        Disabled: {
          id: 'Disabled',
        },
      },
    },
  },
};

export const screenMachineBase = Machine(screen_config);

const newTerm = (term: string = '', status: 'and' | 'not' = 'and'): UITerm => ({
  term,
  status,
});

export const newField = (fields: string[]): UIField[] =>
  fields.map(field => ({
    field,
    status: 'default',
    options: false,
    disabled: false,
  }));

const newRuleset = () => ({
  terms: [newTerm()],
  fields: {
    subject: newField(subjectAliases),
    content: newField(contentAliases),
  },
  options: false,
  disabled: false,
  selected: true,
});

const newTab = (machine, id): Tab => ({
  uiQuery: [newRuleset()],
  machine,
  name: 'Tab' + id,
  results: {
    data: [],
    queryObj: [],
  },
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

const regexQuery = /^(-*)([^]*)$/;

const termBuilder = (acc, next) => {
  const isQuery = next.trim().match(regexQuery);
  return acc.concat([
    {
      status: isQuery[1] === '-' ? 'not' : 'and',
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

export const screen_options = {
  actions: {
    createTab: ({ screenStore, idStore, queryObj, currentTab }) => {
      // xstate 4.6 -- spawn?
      const id = get(idStore);
      const machine = interpret(
        Machine(
          createSearchConfig(screenMachineBase),
          searchOptions
        ).withContext({ screenStore, queryObj, currentTab })
      );

      machine.start();

      screenStore.update(_.setKey(id, newTab(machine, get(idStore))));
      idStore.update(add1);
    },
    deleteTab: ({ screenStore, historyStore }, { id }) => {
      // xstate 4.6 -- spawn?
      get(screenStore)[id].machine.stop();
      screenStore.update(_.skipKeys([id]));

      const history = get(historyStore);
      const prev = history[history.length - 2];

      currentTab.set(prev);
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
        toggle
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
    selectRule: ({ screenStore }, { tabId, targetIndex }) => {
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
        toggle
      );
      screenStore.update(toggleRule);
    },
    copyRule: ({ screenStore }, { tabId, ruleIndex }) => {
      const updater = rules => _.appendTo(rules, _.getIndex(rules, ruleIndex));
      const copyRule = _.updatePath(`${tabId}.uiQuery`, updater);

      screenStore.update(copyRule);
    },
    deleteRule: ({ screenStore }, { tabId, ruleIndex }) => {
      if (get(screenStore)[tabId].uiQuery.length > 1) {
        const deleteRule = _.updatePath(
          `${tabId}.uiQuery`,
          _.filterWith((_, i) => i !== ruleIndex)
        );

        screenStore.update(deleteRule);
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
  },
};
// @ts-ignore
export const screen_machine = screenMachineBase.withConfig(screen_options);

import {
  screenStore,
  idStore,
  historyStore,
  currentTab,
  queryObj,
} from '../stores/search';

export const service = interpret(
  screen_machine.withContext({
    screenStore,
    idStore,
    historyStore,
    currentTab,
    queryObj,
  })
);

const { set, subscribe } = writable();
export const machine = { subscribe, send: service.send };
service.onTransition(set);
service.start();
