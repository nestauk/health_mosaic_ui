import { Machine, interpret } from 'xstate';
import { writable } from 'svelte/store';
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
                  event.data
                    .json()
                    .then(r => ctx.update(v => ({ ...v, data: r })));
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
      postRequest: (ctx, evt) => {
        console.log('action', evt);
        ctx.update(v => ({ ...v, value: evt.value.toString() }));
        //return fakeGet(evt);
        return realGet(evt.query);
      },
    },
  }
);
import { data } from './data';
const fakeGet = () => {
  return new Promise(res => {
    setTimeout(() => {
      res(data);
    }, 2000);
  });
};

const realGet = query => {
  const endpoint = 'http://3.8.107.150:9200/rwjf_test/_search';
  const data = {
    query: {
      query_string: { query, default_operator: 'AND' },
    },
  };
  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return fetch(`${endpoint}`, options);
};

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
  console.log(nextState);
  searchState.set(nextState.value);
});

searchService.start();
