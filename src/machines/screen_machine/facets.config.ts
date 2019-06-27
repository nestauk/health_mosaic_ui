export const facets_config = {
  id: 'Facet',
  initial: 'Interactive',
  on: {
    PENDING: {
      target: '#Disabled',
      actions: () => console.log('PENDING'),
    },
    SUCCESS: {
      target: '#Interactive',
      actions: () => console.log('SUCCESS'),
    },
    ERROR: {
      actions: () => console.log('ERROR'),
    },
    MATCHING: {
      actions: () => console.log('MATCHING'),
    },
    DIRTY: {
      actions: () => console.log('DIRTY'),
    },
    ROUTE_CHANGED: {
      target: '#Disabled',
      actions: ['changeRoute'],
    },
  },
  states: {
    Interactive: {
      id: 'Interactive',
    },
    Disabled: {
      id: 'Disabled',
      on: {
        ROUTE_CHANGE_COMPLETED: {
          target: '#Interactive',
        },
      },
    },
  },
};
