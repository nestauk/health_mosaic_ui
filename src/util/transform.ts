import * as _ from 'lamb';

export const toggle = (x: boolean): boolean => !x;
export const add1 = _.add(1);
export const removeLast = _.sliceAt(0, -1);
