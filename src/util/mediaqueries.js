import { derived, writable } from 'svelte/store';
import * as _ from 'lamb';

export const registerBreakpoints = (breakpoints, transformer) => {
  if (process.browser) {
    const namedMqLists =
      _.mapValues(breakpoints, mq => window.matchMedia(mq));

    const matchesStore = writable(
      _.mapValues(namedMqLists, mqList => mqList.matches),
      setup
    );

    function setup () {
      const sensors = _.mapValues(namedMqLists, (mqList, name) => ({
        mqList,
        handler: event => {
          matchesStore.update(_.setKey(name, event.matches))
        }
      }));

      _.values(sensors).forEach(({mqList, handler}) => {
        mqList.addListener(handler);
      });

      return () => {
        _.values(sensors).forEach(({mqList, handler}) => {
          mqList.removeListener(handler);
        });
      }
    }

    return derived(matchesStore, transformer);
  } else {
    return writable({});
  };
}

export const makeMatchingMqStore = namedMatches =>
  _.pairs(namedMatches)
  .reduce((acc, [name, match]) => {
    if (match) {
      // wt_1460 -> ['wt', 1460]
      const [key, numString] = name.split('_');
      const value = Number(numString);

      if (acc.value < value) {
        acc = {key, value};
      }
    }

    return acc;
  }, {value: -Infinity, key: undefined});
  // TODO use _.findWhere?
