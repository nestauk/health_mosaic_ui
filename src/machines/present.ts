import { get } from 'svelte/store';

const presentMachineConfig = {
  id: 'present',
  type: 'parallel',
  states: {
    document: {
      id: 'document',
      initial: 'idle',
      on: {
        TRANSLATEUP: {
          target: '#present.document.translateup',
        },
        TRANSLATEDOWN: {
          target: '#present.document.translatedown',
          actions: ['changePin'],
        },
      },
      states: {
        idle: {},
        translateup: {
          on: {
            TXEND: {
              target: '#present.document.idle',
              actions: ['changePin'],
            },
          },
        },
        translatedown: {
          on: {
            TXEND: {
              target: '#present.document.idle',
            },
          },
        },
      },
    },
  },
};

const presentMachineOptions = {
  actions: {
    changePin: (ctx, evt) => {
      let oldPin;

      ctx.memo.update(memo => {
        oldPin = memo.currentPin;
        if (memo.currentPin === evt.pin) return memo;
        return { ...memo, currentPin: evt.pin };
      });

      if (oldPin !== evt.pin) {
        ctx.bounds.set(get(ctx.memo).pins[evt.pin].bounds);
      }
    },
  },
};

export { presentMachineConfig, presentMachineOptions };
