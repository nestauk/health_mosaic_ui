import { writable } from 'svelte/store';
import { Machine, interpret } from 'xstate';

interface ContextStore {
  subscribe: Function;
  get: Function;
  update: Function;
}

interface ContextStores {
  [x: string]: ContextStore;
}

interface MachineStore {
  machine: {
    subscribe: Function;
    send: Function;
  };
  contextStores: ContextStores;
}

/**
 * Creates an xstate machine and places it into a svelte store.
 * Also creates a svelte store to be passed to the machine as context
 *
 * @param machineConfig - A valid xstate configuration object
 * @param machineOptions - A valid xstate options object: guards, actions, services, activities
 * @param contextStores - The default store(s) to be passed to xstate as context
 * @returns An object containing two objects. One being a store containing the xstate machine, the other containing the stores passed in as context.
 *
 */

export function createMachina(
  machineConfig: any,
  machineOptions: any,
  contextStores: any
): MachineStore {
  const machine = Machine(machineConfig, machineOptions);
  const service = interpret(machine.withContext(contextStores));

  const machineStore = writable(machine.initialState, () => {
    service.start();
    return () => service.stop();
  });

  service.onTransition(nextState => {
    machineStore.set(nextState);
  });

  service.start();

  return {
    machine: {
      subscribe: machineStore.subscribe,
      send: service.send,
    },
    contextStores,
  };
}
