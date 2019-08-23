import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';

import { contentAliases, subjectAliases } from '../../config';
import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/urlBuilder';
import { newRuleset, newField, newTerm } from '../../util/query';

import { makeRouteUrl, toggleBoolean, removeEmpty } from '../../util/transform';
import {
  toggleLabelBinaryUpdater,
  toggleLabelTernaryUpdater,
  hideTabLabelOptions,
  deselectRule,
  parseQuery,
  hideTabRuleOptions,
  toggleTerm,
} from './utils';

export const form_options = {
  actions: {
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
      console.log('ACTION', text);
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

    setUrlQuery: ({ screenStore, currentTab, routeStore }, { route: path }) => {
      const tab: any = get(currentTab);
      const currentQuery = get(screenStore)[tab];
      routeStore.set(path);

      const urlQuery = {
        q: uiQueryToUrlString(currentQuery.uiQuery),
        s: selectionToUrlString(removeEmpty(currentQuery.selections)),
        i: currentQuery.index && currentQuery.index,
        o: currentQuery.logic,
      };

      const newPath = makeRouteUrl(path, urlQuery);
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
