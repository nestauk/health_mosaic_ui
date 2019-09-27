import { writable } from 'svelte/store';
import { mergeObj } from '@svizzle/utils';

/* list view */

export const newListSortingStore = () => writable({
  by: 'city',

  // FIXME use objects [{field, gropuBy}]
  // groupBy: 'volume' | 'initial' | 'bins'
  criteria: [
    'city',
    'continent',
    'cost_ref',
    'country',
    'name',
    'novelty',
    'score',
    // 'start',
    // 'state', // or undefined..
  ],

  // FIXME use a boolean isAscending
  direction: 'descending',
  directions: ['ascending', 'descending']

});

export const updateListOrder = (store, sortOptions) =>
  store.update(mergeObj(sortOptions));
