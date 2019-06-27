import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { assign, spawn } from 'xstate';

import { search_machine } from '../search_machine/';
import { parseQueryUrl } from '../../util/urlParser';
import { uiQueryToUrlString } from '../../util/urlBuilder';

import { add1, makeRouteUrl, removeLast } from '../../util/transform';
import { newTab, removeHistoryEntries } from './utils';
import { newRuleset } from '../../util/query';

export const tabs_options = {
  actions: {
    createTab: (
      { screenStore, idStore },
      { queryParams, ESIndex, isPageInit }
    ) => {
      const id = get(idStore);

      screenStore.update(
        _.setKey(
          id,
          newTab(
            id,
            queryParams && isPageInit
              ? parseQueryUrl(queryParams)
              : [newRuleset(true)],
            ESIndex ? ESIndex : 'all'
          )
        )
      );
      idStore.update(add1);
    },
    setCurrentTab: ({ currentTab }, { tabId = 0 }) => {
      currentTab.set(tabId);
    },
    createSearchMachine: assign((ctx: any) => {
      const id: string = get(ctx.idStore);
      return _.setPathIn(
        ctx,
        `searchMachines.${id}`,
        spawn(search_machine, id)
      );
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
      searchMachines[tabId].stop();
      delete searchMachines[tabId];

      screenStore.update(_.skipKeys([tabId]));
      const current = get(currentTab);

      historyStore.update(removeHistoryEntries(tabId));
      const history: [] = get(historyStore);
      const prev = history[history.length - 1];

      currentTab.set(tabId === current ? prev : current);
    },
    setUrlQuery: ({ screenStore, currentTab, routeStore }, { route: path }) => {
      const tab: any = get(currentTab);
      const currentQuery = get(screenStore)[tab];
      routeStore.set(path);

      const urlQuery = {
        q: uiQueryToUrlString(currentQuery.uiQuery),
        i: currentQuery.index && currentQuery.index,
      };

      const newPath = makeRouteUrl(path, urlQuery);
      //@ts-ignore
      if (process.browser && newPath !== path) {
        goto(newPath);
      }
    },
    setTabLabel: ({ screenStore }, { labelText, id }) => {
      screenStore.update(_.setPath(`${id}.name`, labelText));
    },
  },
};
