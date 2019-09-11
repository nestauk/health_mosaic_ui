import { searchRouteName } from '../config';

export const makePath = path => (path ? path : searchRouteName);
