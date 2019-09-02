import { onMount } from 'svelte';
import { derived, writable } from 'svelte/store';
import * as _ from 'lamb';

// FIXME [1]
export const registerBreakpoints = (breakpoints, useMatchesStore) => {
  onMount(() => {
    const namedMqLists =
      _.mapValues(breakpoints, mq => window.matchMedia(mq));

    const matchesStore = writable(
      _.mapValues(namedMqLists, mqList => mqList.matches)
    );

    const sensors = _.mapValues(namedMqLists, (mqList, name) => ({
      mqList,
      handler: event => {
        matchesStore.update(_.setKey(name, event.matches))
      }
    }));

    useMatchesStore(matchesStore);

    _.values(sensors).forEach(({mqList, handler}) => {
      mqList.addListener(handler);
    });

    return () => {
      _.values(sensors).forEach(({mqList, handler}) => {
        mqList.removeListener(handler);
      });
    };
  });
}

export const makeMatchingMqStore = matchesStore =>
  derived(matchesStore, namedMatches =>
    _.pairs(namedMatches)
    .reduce((acc, [name, match], index, arr) => {
      if (match) {
        // wt_1460 -> ['wt', 1460]
        const [key, numString] = name.split('_');
        const value = Number(numString);

        if (acc.value < value) {
          acc = {key, value};
        }
      }

      return acc;
    }, {value: -Infinity, key: undefined})
  ); // TODO use _.findWhere?


// [1] this version errors with 'ReferenceError: window is not defined', TBD
//
// export const registerBreakpoints = (breakpoints, useMatches) => {
//   if (window && window !== 'undefined') {
//     const namedMqLists = _.mapValues(breakpoints, mq => window.matchMedia(mq));
//     const matches = writable(_.mapValues(namedMqLists, mql => mql.matches));
//     const sensors = _.mapValues(namedMqLists, (mql, name) => ({
//       mql,
//       handler: event => {
//         matches.update(_.setKey(name, event.matches))
//       }
//     }));
//
//     useMatches(matches);
//
//     onMount(() => {
//       Object.values(sensors).forEach(({mql, handler}) => {
//         mql.addListener(handler);
//       });
//     });
//
//     onDestroy(() => {
//       Object.values(sensors).forEach(({mql, handler}) => {
//         mql.removeListener(handler);
//       });
//     });
//   }
// }
