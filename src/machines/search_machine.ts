import { get } from 'svelte/store';
import { query } from '../actions/queryApi';
import * as _ from 'lamb';
import { send } from 'xstate';

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
              entry: 'shareMatching',
            },
            Dirty: {
              id: 'Dirty',
              initial: 'Idle',
              entry: 'shareDirty',
              on: {
                SEARCHED: {
                  target: 'Dirty.Pending',
                },
              },
              states: {
                Idle: {},
                Pending: {
                  entry: 'sharePending',
                  invoke: {
                    id: 'Pending',
                    src: 'apiRequest',

                    onDone: {
                      target: '#Matching',
                      actions: ['updateData', 'shareSuccess'],
                    },
                    onError: {
                      target: '#Error',
                    },
                  },
                },
                Error: {
                  id: 'Error',
                  entry: 'shareError',
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
    updateData: ({ screenStore, queryObj, currentTab }, evt) => {
      const tab = get(currentTab);
      const currentQuery = get(queryObj)[tab];
      screenStore.update(tabs => ({
        ...tabs,
        [tab]: {
          ...tabs[tab],
          results: { data: evt.data.data.All, queryObj: currentQuery },
        },
      }));
    },
  },
  services: {
    apiRequest: ({ queryObj, currentTab }) => {
      const tab = get(currentTab);
      const currentQuery = get(queryObj)[tab];

      return query(currentQuery);
    },
  },
};
