import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';

import { uiQueryToUrlString } from '../../util/urlBuilder';
import { makeRouteUrl } from '../../util/transform';

export const facets_options = {
  actions: {
    changeRoute: ({ screenStore, currentTab, routeStore }, { route: path }) => {
      const tab: number = get(currentTab);
      const currentQuery = get(screenStore)[tab];
      routeStore.set(path);

      screenStore.update(_.setPath(`${tab}.route`, path));

      const urlQuery = {
        q: uiQueryToUrlString(currentQuery.uiQuery),
        i: currentQuery.index && currentQuery.index,
      };

      goto(makeRouteUrl(path, urlQuery));
    },
  },
};
