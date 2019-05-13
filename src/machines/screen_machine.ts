import { Machine } from 'xstate';
import { createSearchConfig, searchOptions } from './search_machine';
import { contentAliases, subjectAliases } from '../config';
import { Tab, UIField, UITerm } from '../stores/interfaces';
import { get } from 'svelte/store';
import { toggle, add1, removeLast } from '../util/transform';

import * as _ from 'lamb';

const screen_config = {
  id: 'screen',
  type: 'parallel',
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
      },
      states: {
        Idle: {
          on: {
            TEXT_CHANGED: {
              actions: ['updateCurrentRuleText'],
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
              actions: ['copyRule'],
            },
            RULE_DELETED: {
              actions: ['deleteRule'],
              target: 'Idle',
            },
            RULE_OPTIONS_HIDDEN: {
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
              actions: ['setCurrentTab', 'deleteTab', 'popHistory'],
            },
            TAB_CREATED: {
              actions: ['createTab', 'setCurrentTab'],
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

const newTab = (machine, id): Tab => ({
  uiQuery: [
    {
      terms: [newTerm()],
      fields: {
        subject: newField(subjectAliases),
        content: newField(contentAliases),
      },
      options: false,
      disabled: false,
      selected: false,
    },
  ],
  machine,
  name: 'Tab' + id,
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
  _.filterWith(a => a.term.length),
]);

const ruleOptionsDeselect = _.setPath('options', false);

const hideTabLabelOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(labelOptionsDisabler));

const hideTabRuleOptions = tabId =>
  _.updatePath(`${tabId}.uiQuery`, _.mapWith(ruleOptionsDeselect));

export const screen_options = {
  actions: {
    createTab: ({ screenStore, idStore }) => {
      screenStore.update(
        _.setKey(
          `tab${get(idStore)}`,
          newTab(
            Machine(createSearchConfig(screenMachineBase), searchOptions),
            get(idStore)
          )
        )
      );
      idStore.update(add1);
    },
    deleteTab: ({ screenStore }, id) => {
      screenStore.update(_.skipKeys([id]));
    },
    setCurrentTab: ({ currentTab }, id) => {
      currentTab.set(id);
    },
    setTabLabel: ({ screenStore }, { labelText, id }) => {
      screenStore.update(_.setPath(`${id}.name`, labelText));
    },
    popHistory: ({ historyStore }) => {
      historyStore.update(removeLast);
    },
    pushHistory: ({ historyStore }, id) => {
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
      const disableLabelStatus = _.setPath(
        `${tabId}.uiQuery.${ruleIndex}.fields.${section}.${labelIndex}.status`,
        'default'
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
    selectRule: ({ screenStore }, { tabId, ruleIndex }) => {
      const hideOptions = _.updatePath(
        `${tabId}.uiQuery`,
        _.mapWith(deselectRule)
      );

      const selectRule = _.setPath(
        `${tabId}.uiQuery.${ruleIndex}.selected`,
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
      const updater = rules => _.append(_.getIndex(rules, ruleIndex));
      const copyRule = _.updatePath(`${tabId}.uiQuery`, updater);

      screenStore.update(copyRule);
    },
    deleteRule: ({ screenStore }, { tabId, ruleIndex }) => {
      const deleteRule = _.updatePath(
        `${tabId}.uiQuery`,
        _.filterWith((_, i) => i !== ruleIndex)
      );

      screenStore.update(deleteRule);
    },
  },
};
// @ts-ignore
export const screen_machine = screenMachineBase.withConfig(screen_options);
