import { get, writable } from 'svelte/store';

export const cloneWritable = store => writable(get(store));
