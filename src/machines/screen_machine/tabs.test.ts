import { writable, get } from 'svelte/store';

import { tabs_options } from './tabs.options';
const {
  createTab,
  setCurrentTab,
  popHistory,
  pushHistory,
  deleteTab,
  setTabLabel,
} = tabs_options.actions;

import { createExpected } from '../../../test/utils';

let uuid = 0;

test('createTab: should create a tab', () => {
  const expected = createExpected(uuid++);
  const idStore = writable(0);
  const tabStore = writable({});

  createTab(
    { screenStore: tabStore, idStore },
    {
      queryParams: undefined,
      selectionParams: undefined,
      ESIndex: undefined,
      isPageInit: undefined,
      ESLogic: undefined,
    }
  );
  expect(get(idStore)).toEqual(1);
  expect(get(tabStore)).toEqual(expected);
});

test('createTab: the id should be correctly incremented', () => {
  const tabStore = writable({});

  const idStore = writable(0);

  createTab(
    { screenStore: tabStore, idStore },
    {
      queryParams: undefined,
      selectionParams: undefined,
      ESIndex: undefined,
      isPageInit: undefined,
      ESLogic: undefined,
    }
  );
  createTab(
    { screenStore: tabStore, idStore },
    {
      queryParams: undefined,
      selectionParams: undefined,
      ESIndex: undefined,
      isPageInit: undefined,
      ESLogic: undefined,
    }
  );

  let val = get(tabStore);
  expect(val[0].name).toEqual(`Tab0`);
  expect(val[1].name).toEqual(`Tab1`);
});

test('deleteTab: should delete tab data', () => {
  const screenStore = writable({});
  const idStore = writable(0);
  const historyStore = writable([0]);
  const currentTab = writable(0);
  createTab(
    { screenStore, idStore },
    {
      queryParams: undefined,
      selectionParams: undefined,
      ESIndex: undefined,
      isPageInit: undefined,
      ESLogic: undefined,
    }
  );
  deleteTab(
    {
      screenStore,
      historyStore,
      currentTab,
      searchMachines: [{ stop: () => {} }],
    },
    { tabId: 0 }
  );

  expect(get(screenStore)).toEqual({});
});

test('deleteTab: should delete the correct tab data', () => {
  const screenStore = writable({});
  const idStore = writable(0);
  const historyStore = writable([0]);
  const currentTab = writable(0);
  createTab(
    { screenStore, idStore },
    {
      queryParams: undefined,
      selectionParams: undefined,
      ESIndex: undefined,
      isPageInit: undefined,
      ESLogic: undefined,
    }
  );
  createTab(
    { screenStore, idStore },
    {
      queryParams: undefined,
      selectionParams: undefined,
      ESIndex: undefined,
      isPageInit: undefined,
      ESLogic: undefined,
    }
  );
  uuid++;
  deleteTab(
    {
      screenStore,
      historyStore,
      currentTab,
      searchMachines: [
        { stop: () => {} },
        { stop: () => {} },
        { stop: () => {} },
      ],
    },
    { tabId: uuid }
  );

  let val = get(screenStore);
  expect(val[uuid - 1]).toBeTruthy();
  expect(val[uuid]).toBe(undefined);
});

test('setCurrentTab: should set the correct tab id', () => {
  const currentTab = writable(0);

  setCurrentTab({ currentTab }, { tabId: 98 });
  expect(get(currentTab)).toBe(98);
});

test('setTabLabel: should set the tab name', () => {
  uuid++;
  const screenStore = writable(createExpected(uuid));

  setTabLabel({ screenStore }, { labelText: 'My Special Tab', id: uuid });
  let val = get(screenStore);
  expect(val[uuid].name).toBe('My Special Tab');
});

test('popHistory: Should remove the last item from the history', () => {
  const historyStore = writable([0, 1, 2, 1, 3]);

  popHistory({ historyStore });
  expect(get(historyStore)).toEqual([0, 1, 2, 1]);
});

test('pushHistory: Should add an item to the history', () => {
  const historyStore = writable([0, 1, 2, 1, 3]);

  pushHistory({ historyStore }, { tabId: 27 });
  expect(get(historyStore)).toEqual([0, 1, 2, 1, 3, 27]);
});
