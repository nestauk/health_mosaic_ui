import * as _ from 'lamb';

// ⚠️ returns a side-effectful function
// accumulator to do group + map count in a reduce
export const makeAccAddAndCountWith = accessor =>
  (acc, obj) => {
    const key = accessor(obj);

    if (!_.has(acc, key)) {
      acc[key] = {items: [obj], count: 1};
    } else {
      acc[key].items.push(obj);
      acc[key].count++;
    }

    return acc;
  };
