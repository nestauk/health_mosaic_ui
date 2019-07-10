import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { sendParent, Machine } from 'xstate';
import { mergeObj } from '@svizzle/utils';

import { makeSelectionFilter } from '../../util/object';
import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/urlBuilder';
import { makeRouteUrl, removeEmpty } from '../../util/transform';
import { query } from '../../actions/queryApi';

export const search_options: any = {
  actions: {
    sharePending: sendParent('PENDING'),
    shareSuccess: sendParent('SUCCESS'),
    shareError: sendParent('ERROR'),
    shareMatching: sendParent('MATCHING'),
    shareDirty: sendParent('DIRTY'),
    updateData: (
      { screenStore, queryObj, currentTab, routeStore },
      { data: { id, results } }
    ) => {
      const screen = get(screenStore);

      if (!screen.hasOwnProperty(id)) {
        return;
      }

      const responseTab = screen[id];
      const responseTabQueryObject = get(queryObj)[id];
      const tabId: number = get(currentTab);

      if (tabId === id) {
        const currentQuery = screen[tabId];
        const urlQuery = {
          q: uiQueryToUrlString(currentQuery.uiQuery),
          s: selectionToUrlString(removeEmpty(currentQuery.selections)),
          i: currentQuery.index.toLowerCase(),
          o: currentQuery.logic,
        };
        goto(makeRouteUrl(get(routeStore), urlQuery));
      }

      const newData = Object.values(results.data)[0];
      const filter = makeSelectionFilter(responseTab.selections);
      const selected = filter(newData);

      screenStore.update(
        _.updatePath(
          id,
          mergeObj({
            results: {
              data: newData,
              queryObj: responseTabQueryObject,
              prevQuery: responseTab.uiQuery,
              lastIndex: responseTab.index,
              lastLogic: responseTab.logic,
            },
            selected,
          })
        )
      );
    },
  },
  services: {
    apiRequest: ({ queryObj }, { tabId }) => {
      const currentQuery = get(queryObj)[tabId];

      return query(
        currentQuery.query,
        currentQuery.index,
        currentQuery.logic,
        tabId
      );
    },
  },
};
