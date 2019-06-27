import { interpret } from 'xstate';
import { writable } from 'svelte/store';

import { screen_machine } from '../machines/screen_machine/';
import {
  screenStore,
  idStore,
  historyStore,
  currentTab,
  queryObj,
  routeStore,
} from '../stores/search';

export const screenService = interpret(
  screen_machine.withContext({
    screenStore,
    idStore,
    historyStore,
    currentTab,
    queryObj,
    routeStore,
    searchMachines: {},
  })
);

const { set, subscribe } = writable({}, () => () => screenService.stop());
export const screenMachine = { subscribe, send: screenService.send };

screenService.onTransition(set);
screenService.start();
