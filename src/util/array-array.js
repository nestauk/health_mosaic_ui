import * as _ from 'lamb';

export const removeUndefinedAt1 = _.filterWith(x => !!x[1]);
