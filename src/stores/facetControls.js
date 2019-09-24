import { writable } from 'svelte/store';
import { mergeObj } from '@svizzle/utils';

/* list view */

export const newListSortingStore = () => writable({
  by: 'novelty',
  criteria: [
    'continent_id',
    'cost_ref',
    'country_id',
    'name',
    'novelty',
    'score',
    'start',
  ],
  direction: 'ascending',
  directions: ['ascending', 'descending']
});

export const updateListOrder = (store, sortOptions) =>
  store.update(mergeObj(sortOptions));
