import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';

import { version } from '../../../package.json';
import { makePath } from '../../util/config';
import { newRuleset } from '../../util/query';
import { makeRouteUrl, toggleBoolean, removeEmpty } from '../../util/transform';
import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/urlBuilder';
import {
  toggleLabelBinaryUpdater,
  toggleLabelTernaryUpdater,
  deselectRule,
  parseQuery,
  toggleTerm,
} from './utils';

const toArray = x => [x];

const setDefaultRuleset = ruleset => _.setPathIn(ruleset, 'disabled', false);

const fieldUpdater = ({ content, subject }) => {
  return {
    content: _.map(content, c => ({ ...c, status: 'default' })),
    subject: _.map(subject, c => ({ ...c, status: 'default' })),
  };
};
const setDefaultFields = ruleset =>
  _.updatePathIn(ruleset, 'fields', fieldUpdater);

const reduceQueries = rulesets =>
  _.pipe([
    _.reduceWith(
      (acc, next) => ({
        ...acc,
        isEditing: true,
        terms: acc.terms.concat(next.terms),
      }),
      { ..._.head(rulesets), terms: [] }
    ),
  ])(rulesets);

export const form_options = {
  guards: {
    isComplex: ({ screenStore }, { tabId }) => {
      const currentQuery = get(screenStore)[tabId].uiQuery;
      const { fields } = currentQuery[0];
      const hasSelectedFields = fields.subject
        .concat(fields.content)
        .some(v => v.status !== 'default');

      if (currentQuery.length > 1 || hasSelectedFields) return true;
    },
  },
  actions: {
    activateSimpleSearch: ({ screenStore }, { tabId }) => {
      const updater = _.pipe([
        reduceQueries,
        setDefaultRuleset,
        setDefaultFields,
        toArray,
      ]);
      const copyRule = _.pipe([_.updatePath(`${tabId}.uiQuery`, updater)]);

      screenStore.update(copyRule);
    },
    editRuleset: ({ screenStore }, { tabId, ruleIndex = 0 }) => {
      const labelEditStatus = _.updatePath(
        `${tabId}.uiQuery.${ruleIndex}.isEditing`,
        toggleBoolean
      );

      screenStore.update(labelEditStatus);

      const updater = _.pipe([
        _.filterWith(rule => rule.terms.length && rule.terms[0].term.length),
      ]);

      const newRule = _.updatePath(`${tabId}.uiQuery`, updater);

      screenStore.update(newRule);
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

      if (uiQuery.length <= 1) return;

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
    },
    toggleTermStatus: ({ screenStore }, { tabId, ruleIndex, termIndex }) => {
      const toggleTermStatus = _.updatePath(
        `${tabId}.uiQuery.${ruleIndex}.terms.${termIndex}.status`,
        toggleTerm
      );
      screenStore.update(toggleTermStatus);
    },
    createRuleset: ({ screenStore }, { tabId }) => {
      const updater = _.pipe([
        _.filterWith(rule => rule.terms.length && rule.terms[0].term.length),
        _.append(newRuleset()),
      ]);
      const newRule = _.updatePath(`${tabId}.uiQuery`, updater);

      screenStore.update(newRule);
    },
    setUrlQuery: ({ screenStore, currentTab, routeStore }, { route: path }) => {
      const tab: any = get(currentTab);
      const currentQuery = get(screenStore)[tab];
      routeStore.set(makePath(path));

      const urlQuery = {
        v: version,
        q: uiQueryToUrlString(currentQuery.uiQuery),
        s: selectionToUrlString(removeEmpty(currentQuery.selections)),
        i: currentQuery.index && currentQuery.index,
        o: currentQuery.logic,
      };

      const newPath = makeRouteUrl(makePath(path), urlQuery);
      //@ts-ignore
      if (process.browser && newPath !== path) {
        goto(newPath);
      }
    },
    changeIndex: ({ screenStore }, { tabId, ESIndex }) => {
      screenStore.update(_.setPath(`${tabId}.index`, ESIndex));
    },
    resetQuery: ({ screenStore }, { tab }) => {
      const lastQuery = get(screenStore)[tab].results;

      if (lastQuery.prevQuery) {
        const resetQuery = _.pipe([
          _.setPath(`${tab}.uiQuery`, lastQuery.prevQuery),
          _.setPath(`${tab}.index`, lastQuery.lastIndex),
          _.setPath(`${tab}.logic`, lastQuery.lastLogic),
        ]);
        screenStore.update(resetQuery);
      }
    },
    resetStore: ({
      screenStore,
      historyStore,
      currentTab,
      idStore,
      searchMachines,
    }) => {
      Object.values(searchMachines).forEach((searchMachine: any) =>
        searchMachine.stop()
      );
      screenStore.set({});
      currentTab.set(0);
      historyStore.set([]);
      idStore.set(0);
    },
    toggleSearchLogic: ({ screenStore }, { tabId, logic }) => {
      screenStore.update(_.setPath(`${tabId}.logic`, logic));
    },
  },
};
