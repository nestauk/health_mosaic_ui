import { get } from 'svelte/store';

/**
 * Statechart for map memoning functionality
 *
 * @states
 * - idle
 * - transforming
 * - memoned
 * - editing
 *
 * @initial idle
 *
 * @idle_events
 * - TXSTART: transforming
 * - SELECTmemo: memoned
 * - memo: editing
 *
 * @transforming_events
 * - TXEND: idle
 * -
 *
 * @memoned_events
 * - SELECTmemo: memoned
 * - EDITmemo: editing
 * - DELETEmemo: idle
 * - TXSTART: transforming
 *
 * @editing_events
 */

const memoMachineConfig = {
  id: 'map',
  initial: 'idle',
  states: {
    idle: {
      on: {
        TXSTART: {
          target: 'transforming',
        },
        SELECTPIN: {
          target: 'pinned',
          actions: ['showPin'],
        },
        PIN: {
          target: 'editing',
          actions: ['createPin'],
        },
      },
    },
    transforming: {
      on: {
        TXEND: {
          target: 'idle',
          actions: ['saveCurrentBounds'],
        },
      },
    },
    pinned: {
      on: {
        SELECTPIN: {
          target: 'pinned',
          actions: ['showPin'],
        },
        EDITPIN: {
          target: 'editing',
        },
        DELETEPIN: {
          target: 'idle',
          actions: ['deletePin', 'deselectPin'],
        },
        TXSTART: {
          target: 'transforming',
          actions: ['deselectPin'],
        },
      },
    },
    editing: {
      type: 'parallel',
      on: {
        UPDATEPIN: {
          target: 'pinned',
          actions: ['updatePin'],
        },
        DISCARDEDIT: {
          target: 'pinned',
          actions: ['confirmBounds'],
        },
        DELETEPIN: {
          target: 'idle',
          actions: ['deletePin', 'deselectPin'],
        },
      },
      states: {
        map: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                TXSTART: {
                  target: 'transforming',
                },
              },
            },
            transforming: {
              on: {
                TXEND: {
                  target: 'idle',
                  actions: ['saveCurrentBounds'],
                },
              },
            },
          },
        },
        note: {
          initial: 'idle',
          on: {
            CHANGE: {
              target: 'dirty',
            },
          },
          states: {
            idle: {},
            dirty: {},
          },
        },
        crop: {
          initial: 'freetransform',
          states: {
            freetransform: {
              on: {
                TXSTART: {
                  target: 'transforming',
                },
                ENABLECROP: {
                  target: 'croppable',
                },
              },
            },
            transforming: {
              on: {
                TXEND: {
                  target: 'freetransform',
                },
              },
            },
            croppable: {
              on: {
                DISABLECROP: {
                  target: 'freetransform',
                },
                CROP: {
                  target: 'cropped',
                },
              },
            },
            cropped: {
              on: {
                CROP: {
                  target: 'cropped',
                },
                DISCARDCROP: {
                  target: 'croppable',
                },
              },
            },
          },
        },
      },
    },
  },
};

const memoMachineOptions = {
  actions: {
    createPin: ctx => {
      ctx.memo.update(memo => {
        const newPins = memo.pins.concat({
          id: memo.pins.length ? memo.pins[memo.pins.length - 1].id + 1 : 0,
          title: '',
          description: '',
          bounds: get(ctx.bounds),
        });
        const currentPin = newPins[newPins.length - 1].id;

        return { currentPin, pins: newPins };
      });
    },
    showPin: (ctx, evt) => {
      const { id: currentPin } = evt;
      ctx.memo.update(memo => ({ ...memo, currentPin }));
      ctx.bounds.set(get(ctx.memo).pins[currentPin].bounds);
    },
    updatePin: (ctx, evt) => {
      ctx.memo.update(memo => {
        const { currentPin, pins } = memo;
        const newPins = [].concat(pins);

        newPins[currentPin] = {
          ...newPins[currentPin],
          ...evt.updates,
          bounds: get(ctx.bounds),
        };

        return { ...memo, pins: newPins };
      });
    },
    deselectPin: ctx => {
      ctx.memo.update(memo => {
        return { ...memo, currentPin: false };
      });
    },
    deletePin: ctx => {
      ctx.memo.update(memo => {
        const newPins = []
          .concat(memo.pins)
          .filter((_, i) => i !== memo.currentPin);

        return {
          ...memo,
          pins: newPins,
        };
      });
    },
    saveCurrentBounds: (ctx, evt) => {
      ctx.bounds.set(evt.bounds);
    },
    confirmBounds: ctx => {
      const memo = get(ctx.memo);
      ctx.bounds.set(memo.pins[memo.currentPin].bounds);
    },
  },
};

export { memoMachineConfig, memoMachineOptions };
