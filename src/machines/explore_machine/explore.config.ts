export const explore_config = {
  id: 'explore',
  type: 'parallel',
  on: {
    SEARCHED: {
      target: 'Search.Pending',
    },
  },
  states: {
    Search: {
      id: 'Search',
      initial: 'Idle',
      states: {
        Idle: {},
        Pending: {
          invoke: {
            id: 'Pending',
            src: 'apiRequest',
            onDone: {
              target: 'Idle',
              actions: ['updateData'],
            },
            onError: {
              target: 'Error',
              actions: (_, evt) => console.log(evt),
            },
          },
        },
        Error: {
          id: 'Error',
        },
      },
    },
  },
};
