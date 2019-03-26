// import { writable } from 'svelte/store';
import { tweened } from 'svelte/motion';

// const initialTabValue = 0;
const initialTweenValue = 0;

// export const createTabStore = (tab = initialTabValue) => writable(tab);
export const createTweenStore = (
  startValue = initialTweenValue,
  { duration = 200 }
) => tweened(startValue, { duration });
