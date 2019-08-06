import { interpret } from 'xstate';
import { writable } from 'svelte/store';
import { explore_machine } from '../machines/explore_machine/';

export const exploreService = interpret(explore_machine);

const { set, subscribe } = writable({}, () => () => exploreService.stop());
export const exploreMachine = { subscribe, send: exploreService.send };

exploreService.onTransition(set);
exploreService.start();
