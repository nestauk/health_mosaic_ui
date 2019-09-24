import * as _ from 'lamb';

export const removeEmptyValue = _.pickIf(x => !!x.value.length);
export const removeEmpty = _.pickIf(x => !!x.length);
