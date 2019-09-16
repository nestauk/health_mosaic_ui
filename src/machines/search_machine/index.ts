import { Machine } from 'xstate';
import { search_config } from './search.config';
import { search_options } from './search.options';

export const search_machine = Machine(search_config, search_options);
