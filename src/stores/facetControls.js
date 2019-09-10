import { writable } from 'svelte/store';

/* list view */
export const listSortingStore = writable({
  by: 'novelty',
  criteria: ['country_id', 'cost_ref', 'novelty'],
  direction: 'ascending',
  directions: ['ascending', 'descending']
});

// TBD
// export const listUpdateSortBy = criterion => {
//   listSortingStore.update(
//     _.setKey('by', criterion)
//   );
// }
//
// export const listUpdateSortOrder = order => {
//   listSortingStore.update(_.setKey('order', order));
// }
