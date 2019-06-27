
export const search_config = {
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
  },
};
