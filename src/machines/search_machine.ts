import { get } from 'svelte/store';
import { goto } from '@sapper/app';
import * as _ from 'lamb';
import { send } from 'xstate';

import { uiQueryToUrlString } from '../util/urlBuilder';
import { makeRouteUrl } from '../util/transform';
import { query } from '../actions/queryApi';

export const createSearchConfig = childMachine => ({
  id: 'search',
  type: 'parallel',
  states: {
    Search: {
      id: 'Search',
      initial: 'Empty',
      states: {
        Empty: {
          id: 'Empty',
          on: {
            QUERY_ENTERED: {
              target: 'NotEmpty',
            },
          },
        },
        NotEmpty: {
          id: 'NotEmpty',
          initial: 'Dirty',
          on: {
            QUERY_CLEARED: {
              target: '#Empty',
            },
            QUERY_MATCHED: {
              target: '#Matching',
            },
            QUERY_CHANGED: {
              target: '#Dirty',
            },
          },
          states: {
            Matching: {
              id: 'Matching',
              onEntry: 'shareMatching',
            },
            Dirty: {
              id: 'Dirty',
              initial: 'Idle',
              onEntry: 'shareDirty',
              on: {
                SEARCHED: {
                  target: 'Dirty.Pending',
                },
              },
              states: {
                Idle: {},
                Pending: {
                  onEntry: 'sharePending',
                  invoke: {
                    id: 'Pending',
                    src: 'apiRequest',

                    onDone: {
                      target: '#Matching',
                      actions: ['updateData', 'shareSuccess'],
                    },
                    onError: {
                      target: '#Error',
                      actions: (_, evt) => console.log(evt),
                    },
                  },
                },
                Error: {
                  id: 'Error',
                  onEntry: 'shareError',
                },
              },
            },
          },
        },
      },
    },
    Link: {
      invoke: {
        id: 'Link',
        src: childMachine,
      },
    },
  },
});

export const searchOptions = {
  actions: {
    sharePending: send('PENDING', { to: 'Link' }),
    shareSuccess: send('SUCCESS', { to: 'Link' }),
    shareError: send('ERROR', { to: 'Link' }),
    shareMatching: send('MATCHING', { to: 'Link' }),
    shareDirty: send('DIRTY', { to: 'Link' }),
    updateData: ({ screenStore, queryObj, currentTab, routeStore }, evt) => {
      if (!get(screenStore).hasOwnProperty(evt.data.id)) {
        return;
      }

      const tab = get(currentTab);
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
    apiRequest: ({ queryObj }, { tab }) => {
      const currentQuery = get(queryObj)[tab];

      return query(currentQuery.query, currentQuery.index, tab);
    },
  },
};
