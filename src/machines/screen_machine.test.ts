import { screen_options, newField, screenMachineBase } from './screen_machine';
import { subjectAliases, contentAliases } from '../config';
import { Machine } from 'xstate';
import { createSearchConfig, searchOptions } from './search_machine';
import { writable } from 'svelte/store';

const {
  actions: {
    createTab,
    deleteTab,
    setCurrentTab,
    setTabLabel,
    popHistory,
    pushHistory,
    toggleLabelBinary,
    toggleLabelTernary,
    disableLabel,
    showLabelOptions,
    hideLabelOptions,
    deleteLabel,
    selectRule,
    updateCurrentRuleText,
    showRuleOptions,
    hideRuleOptions,
    disableRule,
    copyRule,
    deleteRule,
  },
} = screen_options;

let uuid = 0;

const createExpected = id => ({
  [`tab${id}`]: {
    uiQuery: [
      {
        terms: [
          {
            term: '',
            status: 'and',
          },
        ],
        fields: {
          subject: newField(subjectAliases),
          content: newField(contentAliases),
        },
        options: false,
        disabled: false,
        selected: false,
      },
    ],
    machine: Machine(createSearchConfig(screenMachineBase), searchOptions),
    name: `Tab${id}`,
  },
});

const createExpectedExcluded = id => {
  const obj = createExpected(id);
  obj[`tab${id}`].uiQuery[0].fields.content[0].status = 'included';
  obj[`tab${id}`].uiQuery[0].fields.subject[0].status = 'included';
  obj[`tab${id}`].uiQuery[0].terms[0].status = 'not';
  return obj;
};
const createExpectedBigger = id => ({
  [`tab${id}`]: {
    uiQuery: [
      {
        terms: [
          {
            term: '',
            status: 'and',
          },
        ],
        fields: {
          subject: newField(subjectAliases),
          content: newField(contentAliases),
        },
        options: false,
        disabled: false,
        selected: false,
      },
      {
        terms: [
          {
            term: '',
            status: 'and',
          },
        ],
        fields: {
          subject: newField(subjectAliases),
          content: newField(contentAliases),
        },
        options: false,
        disabled: false,
        selected: false,
      },
    ],
    machine: Machine(createSearchConfig(screenMachineBase), searchOptions),
    name: `Tab${id}`,
  },
});

test('createTab: should create a tab', () => {
  const expected = createExpected(uuid++);

  const idStore = writable(0);
  let val;
  const unsubscribe = idStore.subscribe(state => (val = state));
  const tabStore = writable({});
  let val2;
  const unsubscribe2 = tabStore.subscribe(state => (val2 = state));

  createTab({ screenStore: tabStore, idStore });
  expect(val).toEqual(1);
  expect(val2).toEqual(expected);

  unsubscribe();
  unsubscribe2();
});

test('createTab: the id should be correctly incremented', () => {
  const tabStore = writable({});
  let val;
  const unsubscribe = tabStore.subscribe(state => (val = state));
  const idStore = writable(0);

  createTab({ screenStore: tabStore, idStore });
  createTab({ screenStore: tabStore, idStore });

  expect(val.tab0.name).toEqual(`Tab0`);
  expect(val.tab1.name).toEqual(`Tab1`);
  unsubscribe();
});

test('deleteTab: should delete tab data', () => {
  const tabStore = writable({});
  let val;
  const unsubscribe = tabStore.subscribe(state => (val = state));
  const idStore = writable(0);

  createTab({ screenStore: tabStore, idStore });
  deleteTab({ screenStore: tabStore }, `tab0`);

  expect(val).toEqual({});
  unsubscribe();
});

test('deleteTab: should delete the correct tab data', () => {
  const tabStore = writable({});
  let val;
  const unsubscribe = tabStore.subscribe(state => (val = state));
  const idStore = writable(0);
  createTab({ screenStore: tabStore, idStore });
  createTab({ screenStore: tabStore, idStore });
  uuid++;
  deleteTab({ screenStore: tabStore }, `tab${uuid}`);

  expect(val[`tab${uuid - 1}`]).toBeTruthy();
  expect(val[`tab${uuid}`]).toBe(undefined);
  unsubscribe();
});

test('setCurrentTab: should set the correct tab id', () => {
  const currentTab = writable(0);
  let val;
  const unsubscribe = currentTab.subscribe(state => (val = state));

  setCurrentTab({ currentTab }, 'tab98');
  expect(val).toBe('tab98');
  unsubscribe();
});

test('setTabLabel: should set the tab name', () => {
  uuid++;
  const screenStore = writable(createExpected(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));
  setTabLabel(
    { screenStore },
    { labelText: 'My Special Tab', id: `tab${uuid}` }
  );
  expect(val[`tab${uuid}`].name).toBe('My Special Tab');
  unsubscribe();
});

test('popHistory: Should remove the last item from the history', () => {
  const historyStore = writable(['tab0', 'tab1', 'tab2', 'tab1', 'tab3']);
  let val;
  const unsubscribe = historyStore.subscribe(state => (val = state));

  popHistory({ historyStore });

  expect(val).toEqual(['tab0', 'tab1', 'tab2', 'tab1']);

  unsubscribe();
});

test('pushHistory: Should add an item to the history', () => {
  const historyStore = writable(['tab0', 'tab1', 'tab2', 'tab1', 'tab3']);
  let val;
  const unsubscribe = historyStore.subscribe(state => (val = state));

  pushHistory({ historyStore }, 'tab27');

  expect(val).toEqual(['tab0', 'tab1', 'tab2', 'tab1', 'tab3', 'tab27']);

  unsubscribe();
});

test('toggleLabelBinary: should toggle a labels status between excluded and included', () => {
  const screenStore = writable(createExpectedExcluded(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  toggleLabelBinary(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].status).toBe(
    'excluded'
  );

  toggleLabelBinary(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );

  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].status).toBe(
    'included'
  );
  unsubscribe();
});

test('toggleLabelTernary: toggles the label status - default -> included -> excluded ', () => {
  const screenStore = writable(createExpected(0));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  expect(val[`tab0`].uiQuery[0].fields.content[0].status).toBe('default');

  toggleLabelTernary(
    { screenStore },
    { tabId: `tab0`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  expect(val[`tab0`].uiQuery[0].fields.content[0].status).toBe('included');

  toggleLabelTernary(
    { screenStore },
    { tabId: `tab0`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );

  expect(val[`tab0`].uiQuery[0].fields.content[0].status).toBe('excluded');

  toggleLabelTernary(
    { screenStore },
    { tabId: `tab0`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );

  expect(val[`tab0`].uiQuery[0].fields.content[0].status).toBe('default');
  unsubscribe();
});

test('selectRule: should set the label status to default', () => {
  const screenStore = writable(createExpectedExcluded(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].status).toBe(
    'included'
  );
  disableLabel(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].status).toBe('default');

  unsubscribe();
});

test('updateCurrentRuleText: the current text should be parsed into an object', () => {
  const expected = [
    { term: 'cheese', status: 'and' },
    { term: 'bacon', status: 'not' },
  ];
  const screenStore = writable(createExpectedExcluded(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  updateCurrentRuleText(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, text: 'cheese, -bacon' }
  );

  expect(val[`tab${uuid}`].uiQuery[0].terms).toEqual(expected);

  unsubscribe();
});

test('showLabelOptions: should set the label hovered property to true', () => {
  const screenStore = writable(createExpectedExcluded(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(false);

  showLabelOptions(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(true);

  unsubscribe();
});

test('showLabelOptions: should set all other label hovered properties to false', () => {
  const init = createExpectedExcluded(uuid);

  const screenStore = writable(init);
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(false);

  showLabelOptions(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );

  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(true);
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[1].options).toBe(false);

  showLabelOptions(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 2 }
  );

  expect(val[`tab${uuid}`].uiQuery[0].fields.content[2].options).toBe(true);
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(false);

  unsubscribe();
});

test('hideLabelOptions: should set the label hovered property to false', () => {
  const screenStore = writable(createExpectedExcluded(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(false);
  showLabelOptions(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );

  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(true);
  hideLabelOptions({ screenStore }, { tabId: `tab${uuid}` });
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].options).toBe(false);

  unsubscribe();
});

test('deleteLabel: should set the label status to default', () => {
  const screenStore = writable(createExpectedExcluded(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  deleteLabel(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].status).toBe('default');

  unsubscribe();
});

test('deleteLabel: should set the label status to default', () => {
  const screenStore = writable(createExpectedExcluded(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  deleteLabel(
    { screenStore },
    { tabId: `tab${uuid}`, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  expect(val[`tab${uuid}`].uiQuery[0].fields.content[0].status).toBe('default');

  unsubscribe();
});

test('selectRule: should make all `rules: selected` except the current one', () => {
  const screenStore = writable(createExpectedBigger(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  selectRule({ screenStore }, { tabId: `tab${uuid}`, ruleIndex: 0 });
  expect(val[`tab${uuid}`].uiQuery[0].selected).toBe(true);

  selectRule({ screenStore }, { tabId: `tab${uuid}`, ruleIndex: 1 });
  expect(val[`tab${uuid}`].uiQuery[0].selected).toBe(false);
  expect(val[`tab${uuid}`].uiQuery[1].selected).toBe(true);
  unsubscribe();
});

test('showRuleOptions: should make all `rule: options` false except the current one', () => {
  const screenStore = writable(createExpectedBigger(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  showRuleOptions({ screenStore }, { tabId: `tab${uuid}`, ruleIndex: 0 });
  expect(val[`tab${uuid}`].uiQuery[0].options).toBe(true);

  showRuleOptions({ screenStore }, { tabId: `tab${uuid}`, ruleIndex: 1 });
  expect(val[`tab${uuid}`].uiQuery[0].options).toBe(false);
  expect(val[`tab${uuid}`].uiQuery[1].options).toBe(true);
  unsubscribe();
});

test('hideRuleOptions: should make all `rule: options` false', () => {
  const screenStore = writable(createExpectedBigger(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  showRuleOptions({ screenStore }, { tabId: `tab${uuid}`, ruleIndex: 0 });
  expect(val[`tab${uuid}`].uiQuery[0].options).toBe(true);

  hideRuleOptions({ screenStore }, { tabId: `tab${uuid}` });
  expect(val[`tab${uuid}`].uiQuery[0].options).toBe(false);
  expect(val[`tab${uuid}`].uiQuery[1].options).toBe(false);
  unsubscribe();
});

test('disableRule: should toggle `rule: disabled`  boolean', () => {
  const screenStore = writable(createExpectedBigger(uuid));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  disableRule({ screenStore }, { tabId: `tab${uuid}`, ruleIndex: 0 });
  expect(val[`tab${uuid}`].uiQuery[0].disabled).toBe(true);

  disableRule({ screenStore }, { tabId: `tab${uuid}`, ruleIndex: 0 });
  expect(val[`tab${uuid}`].uiQuery[0].disabled).toBe(false);

  unsubscribe();
});

test('copyRule: should copy the selected rule and append it', () => {
  const screenStore = writable(createExpectedBigger(0));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  copyRule({ screenStore }, { tabId: `tab0`, ruleIndex: 0 });
  expect(val[`tab0`].uiQuery[1]).toEqual(val[`tab0`].uiQuery[0]);

  unsubscribe();
});

test('deleteRule: should delete the selected rule', () => {
  const screenStore = writable(createExpected(0));
  let val;
  const unsubscribe = screenStore.subscribe(state => (val = state));

  copyRule({ screenStore }, { tabId: `tab0`, ruleIndex: 0 });
  expect(val[`tab0`].uiQuery[1]).toEqual(val[`tab0`].uiQuery[0]);
  deleteRule({ screenStore }, { tabId: `tab0`, ruleIndex: 1 });
  expect(val[`tab0`].uiQuery[1]).toBeFalsy();

  unsubscribe();
});
