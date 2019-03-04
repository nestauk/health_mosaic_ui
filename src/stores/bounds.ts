import { writable } from 'svelte/store';

type bounds = boolean | [[number, number], [number, number]];

const initialValue: bounds = [[-180, -90], [180, 90]];

export const createBoundsStore = (bounds = initialValue) => writable(bounds);
