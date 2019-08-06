import { Machine } from 'xstate';
import { explore_config } from './explore.config';
import { explore_options } from './explore.options';
import { aggregationStore } from '../../stores/explore';

export const explore_machine = Machine(
  explore_config,
  explore_options
).withContext({ aggregationStore });
