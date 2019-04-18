import { query } from '../actions/queryApi';
import { createMachina } from '../util/xstateHelper';
import { createSearchStore } from '../stores';

const searchMachineConfig = {
  id: 'search',
  initial: 'clean',
  on: {
    CHANGED: 'dirty',
    SAME: 'clean',
  },
  states: {
    clean: {},
    dirty: {
      initial: 'idle',
      id: 'dirty',
      on: {
        SEARCH: 'dirty.pending',
      },
      states: {
        idle: {},
        pending: {
          invoke: {
            src: 'postRequest',
            onDone: {
              target: '#search.clean',
              actions: () => {},
            },
            onError: {
              target: 'error',
              actions: () => {},
            },
          },
        },
        error: {},
      },
    },
  },
};

const searchMachineOptions = {
  services: {
    postRequest: async (ctx, evt) => {
      ctx.search.update(v => ({
        ...v,
        value: evt.value,
      }));

      const q = await query(evt.query);

      ctx.search.update(v => ({
        ...v,
        data: { ...v.data, [evt.searchId]: q.hits.hits },
      }));
    },
  },
};

const {
  machine: searchMachine,
  contextStores: { search: searchStore },
} = createMachina(searchMachineConfig, searchMachineOptions, {
  search: createSearchStore(),
});

export { searchMachine, searchStore };
