import { Machine, interpret, send } from 'xstate';
import { writable } from 'svelte/store';

const searchMachine = Machine(
  {
    id: 'search',
    initial: 'idle',
    on: {
      SEARCH: {
        target: 'pending',
      },
    },
    states: {
      idle: {},
      pending: {
        invoke: {
          src: 'postRequest',
          onDone: {
            target: 'idle',
            actions: (ctx, event) => {
              ctx.update(v => ({ ...v, data: event.data }));
              console.log(event, data);
            },
          },
          onError: {
            target: 'error',
            actions: (ctx, event) => {
              console.log(ctx, event);
            },
          },
        },
      },
      error: {},
    },
  },
  {
    services: {
      postRequest: (ctx, evt) => fakeGet(evt.payload),
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

export const searchStore = writable({});
export const search = interpret(
  searchMachine.withContext({ update: searchStore.update })
);

search.onTransition(nextState => {
  console.log(nextState);
  searchStore.update(v => ({ ...v, state: nextState }));
});

search.start();
