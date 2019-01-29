import { Machine, interpret } from 'xstate';
import { writable } from 'svelte/store';
const searchMachine = Machine(
  {
    id: 'search',
    initial: 'ready',
    on: {
      CHANGED: 'dirty',
      SAME: 'ready',
    },
    states: {
      ready: {},
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
                target: '#search.ready',
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
    },
  },
  {
    services: {
      postRequest: (ctx, evt) => {
        ctx.update(v => ({ ...v, value: evt.value }));
        return fakeGet(evt.payload);
      },
    },
  }
);
// const searchMachine = Machine(
//   {
//     id: 'search',
//     initial: 'ready',
//     on: {
//       SEARCH: {
//         target: 'pending',
//       },
//       CHANGED: 'dirty',
//       SAME: 'ready',
//     },
//     states: {
//       ready: {},
//       dirty: {},
//       pending: {
//         invoke: {
//           src: 'postRequest',
//           onDone: {
//             target: 'ready',
//             actions: (ctx, event) => {
//               ctx.update(v => ({ ...v, data: event.data }));
//               console.log(event, data);
//             },
//           },
//           onError: {
//             target: 'error',
//             actions: (ctx, event) => {
//               console.log(ctx, event);
//             },
//           },
//         },
//       },
//       error: {},
//     },
//   },
//   {
//     services: {
//       postRequest: (ctx, evt) => {
//         ctx.update(v => ({ ...v, value: evt.value }));
//         return fakeGet(evt.payload);
//       },
//     },
//   }
// );
import { data } from './data';
const fakeGet = () => {
  return new Promise(res => {
    setTimeout(() => {
      res(data);
    }, 2000);
  });
};

export const searchStore = writable({ value: [''] });
export const search = interpret(
  searchMachine.withContext({ update: searchStore.update })
);

search.onTransition(nextState => {
  console.log(nextState);
  searchStore.update(v => ({ ...v, state: nextState }));
});

search.start();
