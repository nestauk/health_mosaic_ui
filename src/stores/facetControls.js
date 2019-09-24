import { writable } from 'svelte/store';
import { mergeObj } from '@svizzle/utils';

/* list view */

export const newListSortingStore = () => writable({
  by: 'novelty',
  criteria: ['country_id', 'cost_ref', 'novelty'],
  direction: 'ascending',
  directions: ['ascending', 'descending']
});

export const updateListOrder = (store, sortOptions) =>
  store.update(mergeObj(sortOptions));
