import { writable, derived } from 'svelte/store';
import { createQueryObject } from '../util/transform';
// TODO: Write a TS interface for this structure.

const initialValue = { value: [''] };

export const createSearchStore = () => writable(initialValue);

export const screenStore = writable({});
export const historyStore = writable([]);
export const idStore = writable(0);
export const currentTab = writable();
export const queryObj = derived(screenStore, $screenStore => {
  const object = {};
  console.log($screenStore);
  for (const key in $screenStore) {
    if ($screenStore[key].uiQuery) {
      console.log('query', $screenStore[key].uiQuery);
      object[key] = createQueryObject($screenStore[key].uiQuery);
    }
  }

  return object;
});
queryObj.subscribe(v => {
  console.log('derived: ', v);
});
