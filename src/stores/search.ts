import { writable } from 'svelte/store';

// TODO: Write a TS interface for this structure.

const initialValue = { value: [''] };

export const createSearchStore = () => writable(initialValue);
