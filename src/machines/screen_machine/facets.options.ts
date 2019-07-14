import { get } from 'svelte/store';
//@ts-ignore
import { goto } from '@sapper/app';
import * as _ from 'lamb';

import { makeSelectionFilter } from '../../util/object';
import { makeRouteUrl, removeEmpty } from '../../util/transform';
import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/urlBuilder';

export const facets_options = {
  actions: {
    changeRoute: ({ screenStore, currentTab, routeStore }, { route: path }) => {
      const tab: number = get(currentTab);
      const currentQuery = get(screenStore)[tab];
      routeStore.set(path);

      screenStore.update(_.setPath(`${tab}.route`, path));

      const urlQuery = {
        q: uiQueryToUrlString(currentQuery.uiQuery),
        s: selectionToUrlString(removeEmpty(currentQuery.selections)),
        i: currentQuery.index && currentQuery.index,
        o: currentQuery.logic,
      };

      goto(makeRouteUrl(path, urlQuery));
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
