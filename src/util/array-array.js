import * as _ from 'lamb';

export const removeUndefinedOrNotNumberAt1 = _.filterWith(x => !!x[1] || typeof x[1] === 'number');
