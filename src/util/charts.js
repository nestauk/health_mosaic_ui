import { InstituteMap, BarChartV } from '../components/Visualisations/';
import { tweened } from 'svelte/motion';

const defaultPosition = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};

const instituteMap = {
  component: InstituteMap,
  id: 1,
  name: 'instituteMap',
  transition: tweened(defaultPosition),
};

const countryBar = {
  component: BarChartV,
  name: 'countryBar',
  id: 2,
  transition: tweened(defaultPosition),
};

const cityBar = {
  component: BarChartV,
  name: 'countryBar',
  id: 3,
  transition: tweened(defaultPosition),
};

export const generateTabMap = (results, countryValues, cityValues) => ({
  tab1: {
    title: 'Tab One',
    event: 'T1',
    components: [{ ...instituteMap, props: { items: results } }],
    tabId: 1,
  },
  tab2: {
    title: 'Tab Two',
    event: 'T2',
    components: [
      { ...countryBar, props: { items: countryValues, title: 'by Country' } },
      { ...cityBar, props: { items: cityValues, title: 'by City' } },
    ],
    tabId: 2,
  },
  tab3: {
    title: 'Tab Thre',
    event: 'T3',
    components: [
      { ...instituteMap, props: { items: results } },
      { ...cityBar, props: { items: cityValues, title: 'by City' } },
    ],
    tabId: 3,
  },
  tab1to5: {
    title: 'Tab One to Three',
    event: 'T1to3',
    components: [
      { ...instituteMap, props: { items: results } },
      { ...cityBar, props: { items: cityValues, title: 'by City' } },
    ],
    tabId: 4,
  },
});
