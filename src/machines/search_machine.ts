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
                  target: '#Pending',
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
                },
                Fail: {
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
    apiRequest: () => Promise.resolve,
  },
};
