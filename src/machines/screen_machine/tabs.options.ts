import { get } from 'svelte/store';
import { tick } from 'svelte';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { assign, spawn } from 'xstate';
import { mergeWithMerge } from '@svizzle/utils';

import { version } from '../../../package.json';
import { newListSortingStore } from '../../stores/facetControls';
import { cloneWritable } from '../../stores/utils';
import { copyObj } from '../../util/any';
import { removeEmpty } from '../../util/object-object';
import { makePath } from '../../util/config';
import { add1 } from '../../util/number';
import { newRuleset } from '../../util/url/query';
import { removeLast } from '../../util/string';
import { makeRouteUrl } from '../../util/url/utils';

import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/url/builder';
import { parseQueryUrl, parseSelectionUrl } from '../../util/url/parser';
import { search_machine } from '../search_machine/';
import { newTab, removeHistoryEntries } from './utils';

export const tabs_options = {
  actions: {
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
    createTab: (
      { listSortingStores, idStore, screenStore },
      { queryParams, selectionParams, ESIndex, ESLogic, isPageInit }
    ) => {
      const id = get(idStore);

      // new sorting criteria
      listSortingStores[id] = newListSortingStore();

      // new tab
      screenStore.update(
        _.setKey(
          id,
          newTab(
            id,
            queryParams && isPageInit
              ? parseQueryUrl(queryParams)
              : [newRuleset(true)],
            ESIndex ? ESIndex : 'all',
            selectionParams && parseSelectionUrl(selectionParams),
            ESLogic
          )
        )
      );

      idStore.update(add1);
    },
    duplicateTabs: assign((ctx: any, { tabId }) => {
      const newSearchMachines = {};

      tabId.forEach(id => {
        const newTabId = get(ctx.idStore);

        // new tab
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

        // new search machine
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

        // new sorting criteria
        ctx.listSortingStores[newTabId] =
          cloneWritable(ctx.listSortingStores[id]);

        ctx.idStore.update(add1);
      });

      return mergeWithMerge(ctx, { searchMachines: newSearchMachines });
    }),
    setCurrentTab: ({ currentTab }, { tabId = 0 }) => {
      currentTab.set(tabId);
    },
    createSearchMachine: assign((ctx: any) => {
      const id: string = get(ctx.idStore);
      const machine = spawn(
        search_machine.withContext({
          ...ctx,
          id,
        }),
        id
      );
      return _.setPathIn(ctx, `searchMachines.${id}`, machine);
    }),
    popHistory: ({ historyStore }) => {
      historyStore.update(removeLast);
    },
    pushHistory: ({ historyStore }, { tabId = 0 }) => {
      historyStore.update(_.append(tabId));
    },
    deleteTabs: (
      { currentTab, historyStore, listSortingStores, screenStore, searchMachines },
      { tabId }
    ) => {
      let ids = tabId;

      // delete tabs
      if (Object.keys(get(screenStore)).length === tabId.length) {
        ids = tabId.filter((_, i) => i !== 0);
      }
      screenStore.update(_.skipKeys(ids));

      // delete search machines and sorting stores
      ids.forEach(id => {
        let _id = parseInt(id, 10);
        searchMachines[id].stop();

        delete searchMachines[_id];
        delete listSortingStores[id];

        historyStore.update(removeHistoryEntries(_id));
      });

      // set new current tab
      const current = get(currentTab);
      const history: [] = get(historyStore);
      const prev = history[history.length - 1];

      currentTab.set(ids.includes(current) ? prev : current);
    },
    setUrlQuery: (
      { screenStore, currentTab, routeStore },
      { route: path, isPageInit }
    ) => {
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
      if (process.browser) {
        goto(newPath, { replaceState: isPageInit });
      }
    },
    setTabLabel: ({ screenStore }, { labelText, id }) => {
      screenStore.update(_.setPath(`${id}.name`, labelText));
    },
  },
};
