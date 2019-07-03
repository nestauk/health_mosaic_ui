import { form_options } from './form.options';

import { writable, get } from 'svelte/store';
const {
  changeIndex,
  copyRule,
  createRuleset,
  deleteLabel,
  deleteRule,
  disableLabel,
  disableRule,
  hideRuleOptions,
  hideLabelOptions,
  resetQuery,
  resetStore,
  selectRule,
  setUrlQuery,
  showLabelOptions,
  showRuleOptions,
  toggleLabelBinary,
  toggleLabelTernary,
  toggleTermStatus,
  updateCurrentRuleText,
} = form_options.actions;

import {
  createExpected,
  createExpectedBigger,
  createExpectedExcluded,
} from '../../../test/utils';

let uuid = 0;

test('changeIndex: should change the current ES index', () => {
  const screenStore = writable(createExpected(0));
  let val = get(screenStore);
  expect(val[0].index).toBe('all');
  changeIndex({ screenStore }, { tabId: 0, ESIndex: 'papers' });
  val = get(screenStore);
  expect(val[0].index).toBe('papers');
});

test('copyRule: should copy the selected rule and append it', () => {
  const screenStore = writable(createExpectedBigger(0));

  copyRule({ screenStore }, { tabId: 0, ruleIndex: 0 });

  const val = get(screenStore);
  expect(val[`0`].uiQuery[1]).toEqual(val[0].uiQuery[0]);
});

test('deleteLabel: should set the label status to default', () => {
  const screenStore = writable(createExpectedExcluded(uuid));

  deleteLabel(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );

  const val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].status).toBe('default');
});

test('deleteRule: should delete the selected rule', () => {
  const screenStore = writable(createExpected(0));

  copyRule({ screenStore }, { tabId: 0, ruleIndex: 0 });
  let val = get(screenStore);
  expect(val[0].uiQuery[1]).toEqual(val[0].uiQuery[0]);

  deleteRule({ screenStore }, { tabId: 0, ruleIndex: 1 });
  val = get(screenStore);
  expect(val[0].uiQuery[1]).toBeFalsy();
});

test('disableLabel: should set the label status to default', () => {
  const screenStore = writable(createExpectedExcluded(uuid));

  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].disabled).toBe(false);

  disableLabel(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].disabled).toBe(true);
});

test('disableRule: should toggle `rule: disabled`  boolean', () => {
  const screenStore = writable(createExpectedBigger(uuid));

  disableRule({ screenStore }, { tabId: uuid, ruleIndex: 0 });
  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].disabled).toBe(true);

  disableRule({ screenStore }, { tabId: uuid, ruleIndex: 0 });

  val = get(screenStore);
  expect(val[uuid].uiQuery[0].disabled).toBe(false);
});

test('hideRuleOptions: should make all `rule: options` false', () => {
  const screenStore = writable(createExpectedBigger(uuid));

  showRuleOptions({ screenStore }, { tabId: uuid, ruleIndex: 0 });
  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].options).toBe(true);

  hideRuleOptions({ screenStore }, { tabId: uuid });
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].options).toBe(false);
  expect(val[uuid].uiQuery[1].options).toBe(false);
});

test('hideLabelOptions: should set the label hovered property to false', () => {
  const screenStore = writable(createExpectedExcluded(uuid));

  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(false);

  showLabelOptions(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(true);

  hideLabelOptions({ screenStore }, { tabId: uuid });
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(false);
});

test('selectRule: should make all `rules: selected` except the current one', () => {
  const screenStore = writable(createExpectedBigger(uuid));

  selectRule({ screenStore }, { tabId: uuid, targetIndex: 0 });
  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].selected).toBe(true);

  selectRule({ screenStore }, { tabId: uuid, targetIndex: 1 });
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].selected).toBe(false);
  expect(val[uuid].uiQuery[1].selected).toBe(true);
});

test('showLabelOptions: should set the label hovered property to true', () => {
  const screenStore = writable(createExpectedExcluded(uuid));

  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(false);

  showLabelOptions(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(true);
});

test('showLabelOptions: should set all other label hovered properties to false', () => {
  const screenStore = writable(createExpectedExcluded(uuid));

  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(false);

  showLabelOptions(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(true);
  expect(val[uuid].uiQuery[0].fields.content[1].options).toBe(false);

  showLabelOptions(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 2 }
  );

  val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[2].options).toBe(true);
  expect(val[uuid].uiQuery[0].fields.content[0].options).toBe(false);
});

test('showRuleOptions: should make all `rule: options` false except the current one', () => {
  const screenStore = writable(createExpectedBigger(uuid));

  showRuleOptions({ screenStore }, { tabId: uuid, ruleIndex: 0 });
  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].options).toBe(true);

  showRuleOptions({ screenStore }, { tabId: uuid, ruleIndex: 1 });
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].options).toBe(false);
  expect(val[uuid].uiQuery[1].options).toBe(true);
});

test('toggleLabelBinary: should toggle a labels status between excluded and included', () => {
  const screenStore = writable(createExpectedExcluded(uuid));

  toggleLabelBinary(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].status).toBe('excluded');

  toggleLabelBinary(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[uuid].uiQuery[0].fields.content[0].status).toBe('included');
});

test('toggleLabelTernary: toggles the label status - default -> included -> excluded ', () => {
  const screenStore = writable(createExpected(0));

  let val = get(screenStore);
  expect(val[0].uiQuery[0].fields.content[0].status).toBe('default');

  toggleLabelTernary(
    { screenStore },
    { tabId: 0, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[0].uiQuery[0].fields.content[0].status).toBe('included');

  toggleLabelTernary(
    { screenStore },
    { tabId: 0, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[0].uiQuery[0].fields.content[0].status).toBe('excluded');

  toggleLabelTernary(
    { screenStore },
    { tabId: 0, ruleIndex: 0, section: 'content', labelIndex: 0 }
  );
  val = get(screenStore);
  expect(val[0].uiQuery[0].fields.content[0].status).toBe('default');
});

test('updateCurrentRuleText: the current text should be parsed into an object', () => {
  const expected = [
    { term: 'cheese', status: 'and' },
    { term: 'bacon', status: 'not' },
  ];
  const screenStore = writable(createExpectedExcluded(uuid));

  updateCurrentRuleText(
    { screenStore },
    { tabId: uuid, ruleIndex: 0, text: 'cheese, -bacon' }
  );
  let val = get(screenStore);
  expect(val[uuid].uiQuery[0].terms).toEqual(expected);
});
