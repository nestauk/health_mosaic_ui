import * as _ from 'lamb';

export const isNilWith = accessor => _.pipe([accessor, _.isNil]);
