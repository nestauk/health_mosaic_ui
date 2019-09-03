import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { assign, spawn } from 'xstate';

import { search_machine } from '../search_machine/';
import { parseQueryUrl, parseSelectionUrl } from '../../util/urlParser';
import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/urlBuilder';

import {
  add1,
  makeRouteUrl,
  removeLast,
  removeEmpty,
} from '../../util/transform';
import { newTab, removeHistoryEntries } from './utils';
import { newRuleset } from '../../util/query';
import { tabs_config } from './tabs.config';

export const tabs_options = {
  actions: {
    createTab: (
      { screenStore, idStore },
      { queryParams, selectionParams, ESIndex, ESLogic, isPageInit }
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
            ESIndex ? ESIndex : 'all',
            selectionParams && parseSelectionUrl(selectionParams),
            ESLogic
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
      let ids = tabId;

      if (Object.keys(get(screenStore)).length === tabId.length)
        ids = tabId.filter((_, i) => i !== 0);

      screenStore.update(_.skipKeys(ids));

      ids.forEach(id => {
        let _id = parseInt(id, 10);
        searchMachines[id].stop();
        delete searchMachines[_id];
        historyStore.update(removeHistoryEntries(_id));
      });

      const current = get(currentTab);
      const history: [] = get(historyStore);
      const prev = history[history.length - 1];

      currentTab.set(ids.includes(current) ? prev : current);
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
      if (process.browser) {
        goto(newPath);
      }
    },
    setTabLabel: ({ screenStore }, { labelText, id }) => {
      screenStore.update(_.setPath(`${id}.name`, labelText));
    },
  },
};
