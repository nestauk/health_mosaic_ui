import { writable, derived } from 'svelte/store';
import { createQueryObject } from '../util/transform';
// TODO: Write a TS interface for this structure.

const initialValue = { value: [''] };

export const createSearchStore = () => writable(initialValue);

export const screenStore = writable({});
export const historyStore = writable([]);
export const idStore = writable(0);
export const currentTab = writable();
export const routeStore = writable('');
export const queryObj = derived(screenStore, $screenStore => {
  const object = {};

  for (const key in $screenStore) {
    if ($screenStore[key].uiQuery) {
      let q = $screenStore[key].uiQuery;
      if (
        q[0].terms.length === 0 ||
        (q[0].terms.length === 1 && q[0].terms[0].term.length === 0)
      ) {
        object[key] = false;
      } else {
        object[key] = createQueryObject(
          $screenStore[key].uiQuery,
          $screenStore[key].index
        );
      }
    }
  }

  return object;
});

// hmmm...
export const unsubscribe = queryObj.subscribe(v => {});
