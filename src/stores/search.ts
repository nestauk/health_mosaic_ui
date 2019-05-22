import { writable } from 'svelte/store';

// TODO: Write a TS interface for this structure.

const initialValue = { value: [''] };

export const createSearchStore = () => writable(initialValue);

export const screenStore = writable({});
export const historyStore = writable([]);
export const idStore = writable(0);
export const currentTab = writable();
