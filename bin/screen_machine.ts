import { form_config } from '../src/machines/screen_machine/form.config';
import { tabs_config } from '../src/machines/screen_machine/tabs.config';
import { facets_config } from '../src/machines/screen_machine/facets.config';
import clip from 'clipboardy';

const screen_config = {
  id: 'screen',
  type: 'parallel',
  states: {
    Form: form_config,
    Tabs: tabs_config,
    Facets: facets_config,
  },
};

clip.write(`Machine(${JSON.stringify(screen_config, null, 2)})`);
