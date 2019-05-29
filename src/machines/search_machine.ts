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
                    entry: 'sharePending',
                    onDone: {
                      target: '#Matching',
                      actions: ['updateData'],
                    },
                    onError: {
                      target: '#Fail',
                    },
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
  },
});

export const searchOptions = {
  actions: {
    sharePending: () => {},
    shareSuccess: () => {},
    shareFail: () => {},
    shareMatching: () => {},
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
