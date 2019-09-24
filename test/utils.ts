import { newField } from '../src/util/url/query';
import { subjectAliases, contentAliases } from '../src/config';

export const createExpectedBigger = id => ({
  [id]: {
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
    name: `Tab${id}`,
  },
});

export const createExpected = id => ({
  [id]: {
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
        selected: true,
      },
    ],
    name: `Tab${id}`,
    index: 'all',
    results: {
      data: [],
      queryObj: [],
    },
    route: '/search',
    selected: [],
    selections: {},
    visible: true,
    logic: 'AND',
  },
});

export const createExpectedExcluded = id => {
  const obj = createExpected(id);
  obj[id].uiQuery[0].fields.content[0].status = 'included';
  obj[id].uiQuery[0].fields.subject[0].status = 'included';
  obj[id].uiQuery[0].terms[0].status = 'not';
  return obj;
};
