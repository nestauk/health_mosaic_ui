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
      on: {
        SELECTION_UPDATED: {
          target: '#Interactive',
          actions: ['updateSelections', 'applySelections', 'setUrlQuery'],
        },
      },
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
