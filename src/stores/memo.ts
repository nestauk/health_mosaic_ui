import { writable } from 'svelte/store';

type bounds = [[number, number], [number, number]];

/**
 * An individual pin
 *
 * @interface
 *
 * @property {number} id- A unique identifier for this pin.
 * @property {string} title - A name for this pin.
 * @property {string} description - A name for this pin.
 * @property {array} bounds - The geographic bounds for this pin: [swBound,  neBounds]
 */
interface Pin {
  id: number;
  title: string;
  description: string;
  bounds: bounds;
}

interface Memo {
  pins: Pin[];
  currentPin: number | boolean;
}

const defaultValue: Memo = {
  pins: [],
  currentPin: false,
};

export const createMemoStore = (initialValue = defaultValue) =>
  writable(initialValue);
