import { Machine } from 'xstate';

const defaultTransitionService = {
  invoke: {
    src: 'basicTransition',
    onDone: {
      target: 'static',
    },
  },
};

// currently unused
//
// const transitionMachine = Machine(
//   {
//     type: 'parallel',
//     states: {
//       track1: {
//         initial: 'step1',
//         states: {
//           step1: {
//             invoke: {
//               src: 'service1',
//               onDone: {
//                 target: 'step2',
//               },
//             },
//           },
//           step2: {
//             invoke: {
//               src: 'service2',
//             },
//           },
//         },
//       },
//       track2: {
//         initial: 'step1',
//         states: {
//           step1: {
//             type: 'final',
//             invoke: {
//               src: 'service3',
//             },
//           },
//         },
//       },
//     },
//   },
//   {
//     services: {
//       service1: ctx => ctx.tweenA.set(100),
//       service2: ctx => ctx.tweenA.set(43),
//       service3: ctx => ctx.tweenB.set(23, { duration: 500, delay: 500 }),
//     },
//   }
// );

const defaultTransition = {
  initial: 'transition',
  states: {
    static: {},
    transition: defaultTransitionService,
  },
};

// currently unused
//
// const complexTransition = {
//   initial: 'transition',
//   states: {
//     static: {},
//     transition: defaultTransitionService,
//     transitionFrom1: {
//       invoke: {
//         src: transitionMachine,
//         onDone: 'static',
//         data: {
//           tweenA: ctx => ctx.tweenA,
//           tweenB: ctx => ctx.tweenB,
//         },
//       },
//     },
//   },
// };

export const resultsMachineConfig = {
  id: 'results',
  type: 'parallel',
  states: {
    filtered: {
      initial: 'unselected',
      states: {
        selected: {},
        unselected: {},
      },
    },
    tabs: {
      id: 'tabs',
      initial: 'tab1',
      on: {
        T1: { target: 'tabs.tab1' },
        T2: { target: 'tabs.tab2' },
        T3: { target: 'tabs.tab3' },
      },
      states: {
        tab1: {
          ...defaultTransition,
          initial: 'static',
          on: {
            T3: {
              target: 'tab1to3',
            },
          },
        },
        tab1to3: {
          initial: 'start',
          states: {
            start: {
              on: {
                NEXT: {
                  target: 'applystart',
                },
              },
            },
            applystart: {
              on: {
                NEXT: {
                  target: 'end',
                },
              },
            },
            end: {
              on: {
                NEXT: {
                  target: 'applyend',
                },
              },
            },
            applyend: {
              on: {
                NEXT: {
                  target: '#results.tabs.tab3',
                },
              },
            },
          },
        },
        tab2: defaultTransition,
        tab3: defaultTransition,
        tab3to1: {
          initial: 'start',
          states: {
            start: {
              on: {
                NEXT: {
                  target: 'applystart',
                },
              },
            },
            applystart: {
              on: {
                NEXT: {
                  target: 'end',
                },
              },
            },
            end: {
              on: {
                NEXT: {
                  target: 'applyend',
                },
              },
            },
            applyend: {
              on: {
                NEXT: {
                  target: '#results.tabs.tab1',
                },
              },
            },
          },
        },
      },
    },
  },
};

export const resultsMachineOptions = {
  services: {
    basicTransition: ctx => ctx.tweenA.set(10),
  },
};
