import { get } from 'svelte/store';
import { query } from '../actions/queryApi';
import * as _ from 'lamb';

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
              on: {
                SEARCHED: {
                  target: 'Dirty.Pending',
                },
              },
              states: {
                Idle: {},
                Pending: {
                  invoke: {
                    id: 'Pending',
                    src: 'apiRequest',
                  },
                  entry: 'sharePending',
                  onDone: {
                    target: '#Matching',
                    actions: 'shareSuccess',
                  },
                  onError: {
                    target: 'Fail',
                  },
                },
                Fail: {
                  id: 'Fail',
                  entry: 'shareFail',
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
    sharePending: () => {},
    shareSuccess: () => {},
    shareFail: () => {},
    shareMatching: () => {},
  },
  services: {
    apiRequest: async ({ screenStore, queryObj, currentTab }) => {
      const tab = get(currentTab);
      const currentQuery = get(queryObj)[tab];

      try {
        const q = await query(currentQuery);

        screenStore.update(tabs => ({
          ...tabs,
          [tab]: {
            ...tabs[tab],
            results: { data: q.data.All, queryObj: currentQuery },
          },
        }));
      } catch (e) {
        throw new Error(e);
      }
    },
  },
};
