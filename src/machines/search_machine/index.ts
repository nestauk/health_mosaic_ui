import { Machine } from 'xstate';
import { search_config } from './search.config';
import { search_options } from './search.options';
import {
  screenStore,
  currentTab,
  queryObj,
  routeStore,
} from '../../stores/search';

export const search_machine = Machine(
  search_config,
  search_options
).withContext({ screenStore, queryObj, currentTab, routeStore });
