import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';

import { makePath } from '../../util/config';
import { version } from '../../../package.json';
import { makeSelectionFilter } from '../../util/object';
import { makeRouteUrl, serialiseTabs } from '../../util/url/utils';

export const facets_options = {
  actions: {
    changeRoute: (
      { screenStore, currentTab, routeStore },
      { route: path }
    ) => {
      const tab: number = get(currentTab);
      const currentQuery = get(screenStore)[tab];
      routeStore.set(makePath(path));

      if (path) {
        screenStore.update(_.setPath(`${tab}.route`, path));
        routeStore.set(makePath(path));
      }

      const serialisedTabs = serialiseTabs(get(screenStore));
      const urlQuery = {
        v: version,
        active: tab,
        tabs: serialisedTabs,
      };

      goto(makeRouteUrl(path ? path : get(screenStore)[tab].route, urlQuery));
    },
    updateSelections: (
      { screenStore },
      { selection: { key, type, value }, tabId }
    ) => {
      screenStore.update(
        _.updatePath(
          `${tabId}.selections`,
          value ? _.setKey(key, { type, value }) : _.skipKeys([key])
        )
      );
    },
    applySelections: ({ screenStore }, { tabId }) => {
      screenStore.update(
        _.updatePath(`${tabId}`, tab => {
          const { results, selections } = tab;
          const filter = makeSelectionFilter(selections);
          return {
            ...tab,
            selected: filter(results.data),
          };
        })
      );
    },
  },
};
