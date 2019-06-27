import { Machine } from 'xstate';
import { form_config } from './form.config';
import { form_options } from './form.options';
import { tabs_options } from './tabs.options';
import { tabs_config } from './tabs.config';
import { facets_options } from './facets.options';
import { facets_config } from './facets.config';

export const screen_options = {
  actions: {
    ...facets_options.actions,
    ...form_options.actions,
    ...tabs_options.actions,
  },
};

export const screen_config = {
  id: 'screen',
  type: 'parallel',
  states: {
    Form: form_config,
    Tabs: tabs_config,
    Facets: facets_config,
  },
};

//@ts-ignore
export const screen_machine = Machine(screen_config, screen_options);
