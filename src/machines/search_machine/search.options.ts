import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { sendParent } from 'xstate';
import { mergeObj } from '@svizzle/utils';

import { version } from '../../../package.json';
import { query } from '../../actions/queryApi';
import { searchRouteName } from '../../config';
import { makeSelectionFilter } from '../../util/object';
import { makeRouteUrl, serialiseTabs } from '../../util/url/utils';

export const search_options: any = {
  actions: {
    sharePending: sendParent('PENDING'),
    shareSuccess: sendParent('SUCCESS'),
    shareError: sendParent('ERROR'),
    shareMatching: sendParent('MATCHING'),
    shareDirty: sendParent('DIRTY'),
    updateData: (
      { screenStore, queryObj, currentTab, routeStore, restore },
      { data: { id, results } }
    ) => {
      const screen = get(screenStore);

      if (!screen.hasOwnProperty(id)) {
        return;
      }

      const responseTab = screen[id];
      const responseTabQueryObject = get(queryObj)[id];
      const tabId: number = get(currentTab);

      if (tabId === id && !restore) {
        const serialisedTabs = serialiseTabs(get(screenStore));
        const urlQuery = {
          v: version,
          active: `${get(currentTab)}`,
          tabs: serialisedTabs,
        };
        const currentRoute = get(routeStore) ? get(routeStore) : searchRouteName;
        goto(makeRouteUrl(currentRoute, urlQuery));
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
    apiRequest: (ctx, { tabId, restore, fromUrl }) => {
      const currentQuery = get(ctx.queryObj)[tabId];
      ctx.restore = restore;

      return query(
        currentQuery.query,
        currentQuery.index,
        currentQuery.logic,
        tabId,
      );
    },
  },
};
