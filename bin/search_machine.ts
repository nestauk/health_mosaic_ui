import { search_config } from '../src/machines/search_machine/search.config';
import clip from 'clipboardy';

clip.write(`Machine(${JSON.stringify(search_config, null, 2)})`);