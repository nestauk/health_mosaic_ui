import { interpret } from 'xstate';
import { writable } from 'svelte/store';

import { log } from '../config';
import { logTransition } from '../util/xstateHelper';
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
log.transitions && screenService.onTransition(logTransition);

screenService.start();
