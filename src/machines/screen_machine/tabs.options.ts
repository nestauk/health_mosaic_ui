import { get } from 'svelte/store';
//@ts-ignore
import * as _ from 'lamb';
import { assign, spawn } from 'xstate';
import { mergeWithMerge } from '@svizzle/utils';

import { copyObj } from '../../util/any';
import { add1 } from '../../util/number';
import { parseQueryUrl, parseSelectionUrl } from '../../util/url/parser';
import { newRuleset } from '../../util/url/query';
import { removeLast } from '../../util/string';
import { search_machine } from '../search_machine/';
import {
  extractTabsFromUrl,
  findHighestId,
  newTab,
  removeHistoryEntries
} from './utils';

export const tabs_options = {
  actions: {
    incrementId: ({idStore}) => idStore.update(add1),
    restoreTab: (
      { screenStore },
      { queryParams, selectionParams, ESIndex, ESLogic, isPageInit, currentTab }
    ) => {
      screenStore.update(
        _.setKey(
          currentTab,
          newTab(
            currentTab,
            queryParams && isPageInit
              ? parseQueryUrl(queryParams)
              : [newRuleset(true)],
            ESIndex ? ESIndex : 'all',
            selectionParams && parseSelectionUrl(selectionParams),
            ESLogic
          )
        )
      );
    },
    createTab: assign((
      ctx: any,
      { tabParams, isPageInit, route }
    ) => {

      let tabsArray: any = [];

      if (isPageInit && tabParams) {
        let extractedTabs = extractTabsFromUrl(tabParams);
        let highestId = findHighestId(extractedTabs);
        tabsArray = _.map(extractedTabs, _.fromPairs);

        const newScreenStore =
          tabsArray
          .map(tab => [
            tab.id,
            newTab(
              tab.title,
              tab.query && isPageInit
                ? parseQueryUrl(tab.query)
                : [newRuleset(true)],
              tab.indices ? tab.indices : 'all',
              tab.selections && parseSelectionUrl(tab.selections),
              tab.logic,
              route
            )]
          )
          .reduce((acc, [id, tabObj]) =>
            ({...acc, [id]: tabObj}) , {});

        ctx.screenStore.set(newScreenStore);
        ctx.idStore.set(highestId);
      } else {
        const id = get(ctx.idStore);
        ctx.screenStore.update(
          _.setKey(
            id,
            newTab(
              id,
              [newRuleset(true)],
              'all',
            )
          )
        );
      }

      return ctx;
    }),
    duplicateTabs: assign((ctx: any, { tabId }) => {
      const newSearchMachines = {};

      tabId.forEach(id => {
        const newTabId = get(ctx.idStore);

        const { index, logic, name, selections, uiQuery, results, route } =
          get(ctx.screenStore)[id];

        ctx.screenStore.update(
          _.setKey(
            newTabId,
            newTab(
              name,
              copyObj(uiQuery),
              index,
              copyObj(selections),
              logic,
              route
            )
          )
        );

        newSearchMachines[newTabId] = spawn(
          search_machine.withContext({
            ...ctx,
            id,
          }),
          id
        );

        if (results.data.length) {
          newSearchMachines[newTabId].send('QUERY_ENTERED');
          newSearchMachines[newTabId].send('QUERY_CHANGED');
          newSearchMachines[newTabId].send('SEARCHED', { tabId: newTabId });
        }

        ctx.idStore.update(add1);
      });

      return mergeWithMerge(ctx, { searchMachines: newSearchMachines });
    }),
    setCurrentTab: ({ currentTab }, { tabId = 0, activeParams = false }) => {
      const activeTab = parseInt(`${activeParams}`, 10);
      currentTab.set(isNaN(activeTab) ? tabId : +activeParams);
    },
    createSearchMachine: assign((ctx: any, { isPageInit }) => {
      const id: string = get(ctx.idStore);

      if (isPageInit) {
        const machines = {};

        Object
        .keys(get(ctx.screenStore))
        .forEach(id => {
          machines[id] = spawn(
            search_machine.withContext({
              ...ctx,
              id,
            }),
            id
          );
        })

        return _.setPathIn(ctx, `searchMachines`, machines);
      } else {
        const machine = spawn(
          search_machine.withContext({
            ...ctx,
            id,
          }),
          id
        );

        return _.setPathIn(ctx, `searchMachines.${id}`, machine);
      }
    }),
    popHistory: ({ historyStore }) => {
      historyStore.update(removeLast);
    },
    pushHistory: ({ historyStore }, { tabId = 0 }) => {
      historyStore.update(_.append(tabId));
    },
    deleteTab: (
      { screenStore, historyStore, currentTab, searchMachines },
      { tabId }
    ) => {
      let ids = tabId;
      const tabIds = Object.keys(get(screenStore));

      if (tabIds.length === tabId.length) {
        ids = tabId.filter((_, i) => i !== 0);
      }

      screenStore.update(_.skipKeys(ids));

      ids.forEach(id => {
        let _id = parseInt(id, 10);
        searchMachines[id].stop();
        delete searchMachines[_id];
        historyStore.update(removeHistoryEntries(_id));
      });

      const fallback = parseInt(
        tabIds.filter(id => !ids.includes(id))[0],
      10);

      const current = get(currentTab);
      const history: [] = get(historyStore) || [fallback];
      const prev = _.last(history) >= 0 ? _.last(history) : _.last(fallback);


      currentTab.set(ids.includes(current) ? prev : current);
    },
    setTabLabel: ({ screenStore }, { labelText, id }) => {
      screenStore.update(_.setPath(`${id}.name`, labelText));
    },
  },
};
