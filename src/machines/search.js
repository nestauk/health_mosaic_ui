import { Machine, interpret } from 'xstate';
import { writable } from 'svelte/store';
import { query } from '../actions/queryApi';

const searchMachine = Machine(
  {
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
                actions: (ctx, event) => {
                  console.log(event);
                },
              },
              onError: {
                target: 'error',
                actions: (ctx, event) => {
                  console.log('notdone', ctx, event);
                },
              },
            },
          },
          error: {},
        },
      },
    },
  },
  {
    services: {
      postRequest: async (ctx, evt) => {
        ctx.update(v => ({
          ...v,
          value: evt.value.toString(),
          pages: v.pages ? v.pages.concat(v.next) : [v.next],
        }));
        let id;
        let req = evt.req;
        if (evt.id) {
          id = evt.id;
          req = 'nextScroll';
        }
        const q = await query(evt.query, req, id);
        ctx.update(v => ({
          ...v,
          data: { ...v.data, [evt.searchId]: q.hits.hits },
        }));
      },
    },
  }
);

export const store = writable({ value: [''] });

const searchState = writable({});
const searchService = interpret(
  searchMachine.withContext({ update: store.update })
);

export const state = {
  subscribe: searchState.subscribe,
  send: searchService.send,
};

searchService.onTransition(nextState => {
  // console.log(nextState);
  searchState.set(nextState.value);
});

searchService.start();
