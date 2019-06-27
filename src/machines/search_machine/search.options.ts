import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { sendParent, Machine } from 'xstate';

import { uiQueryToUrlString } from '../../util/urlBuilder';
import { makeRouteUrl } from '../../util/transform';
import { query } from '../../actions/queryApi';

export const search_options: any = {
  actions: {
    sharePending: sendParent('PENDING'),
    shareSuccess: sendParent('SUCCESS'),
    shareError: sendParent('ERROR'),
    shareMatching: sendParent('MATCHING'),
    shareDirty: sendParent('DIRTY'),
    updateData: ({ screenStore, queryObj, currentTab, routeStore }, evt) => {
      if (!get(screenStore).hasOwnProperty(evt.data.id)) {
        return;
      }

      const tab: any = get(currentTab);
      const currentQueryObject = get(queryObj)[tab];
      const currentQuery = get(screenStore)[tab];

      const urlQuery = {
        q: uiQueryToUrlString(currentQuery.uiQuery),
        i: currentQuery.index.toLowerCase(),
      };
      goto(makeRouteUrl(get(routeStore), urlQuery));
      const newData = Object.values(evt.data.results.data)[0];

      screenStore.update(tabs => {
        return {
          ...tabs,
          [evt.data.id]: {
            ...tabs[evt.data.id],
            results: {
              data: newData,
              queryObj: currentQueryObject,
              prevQuery: currentQuery.uiQuery,
              lastIndex: currentQuery.index,
            },
          },
        };
      });
    },
  },
  services: {
    apiRequest: ({ queryObj }, { tabId }) => {
      const currentQuery = get(queryObj)[tabId];

      return query(currentQuery.query, currentQuery.index, tabId);
    },
  },
};
