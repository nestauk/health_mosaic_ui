import * as _ from 'lamb';

export const removeEmpty = _.pickIf(x => !!x.value.length);
