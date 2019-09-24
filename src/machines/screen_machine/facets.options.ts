import { get } from 'svelte/store';
//@ts-ignore
import * as _ from 'lamb';
import { isKeyValue } from '@svizzle/utils';

import { goto } from '@sapper/app';
import { version } from '../../../package.json';
import { updateListOrder } from '../../stores/facetControls';
import { makePath } from '../../util/config';
import { removeEmpty } from '../../util/object-object';
import { makeSelectionFilter } from '../../util/object';
import { makeRouteUrl } from '../../util/url/utils';

import {
  uiQueryToUrlString,
  selectionToUrlString,
} from '../../util/url/builder';

const isDirectionAscending = isKeyValue(['direction', 'ascending']);

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

      const urlQuery = {
        v: version,
        q: uiQueryToUrlString(currentQuery.uiQuery),
        s: selectionToUrlString(removeEmpty(currentQuery.selections)),
        i: currentQuery.index && currentQuery.index,
        o: currentQuery.logic,
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
    applySelections: (
      { screenStore },
      { tabId }
    ) => {
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

    /* list view */

    // TODO tabId
    listUpdateSortBy: (
      { listSortingStores, screenStore },
      { sortOptions, tabId }
    ) => {
      // update sorting criteria
      updateListOrder(listSortingStores[tabId], sortOptions);

      // sort selected items
      const { by, direction } = sortOptions;
      const isAscending = isDirectionAscending(sortOptions);
      const accessor = _.condition(
        _.hasKey(by),
        _.getKey(by),
        _.always(undefined),
      );
      const sorter = _.sortWith([
        isAscending
          ? accessor
          : _.sorterDesc(accessor)
      ]);

      screenStore.update(
        _.updatePath(`${tabId}.selected`, sorter)
      );
    },
  },
};
