export const query = {
  0: {
    uiQuery: [
      {
        terms: [
          {
            status: 'and',
            term: 'heart plant',
          },
          {
            status: 'not',
            term: 'disease',
          },
        ],
        fields: {
          subject: [
            {
              field: 'name',
              status: 'included',
              options: false,
              disabled: false,
            },
            {
              field: 'place',
              status: 'excluded',
              options: false,
              disabled: false,
            },
          ],
          content: [
            {
              field: 'body',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'summary',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'terms',
              status: 'default',
              options: false,
              disabled: false,
            },
          ],
        },
        options: false,
        disabled: false,
        selected: false,
      },
      {
        terms: [
          { status: 'and', term: 'one' },
          { status: 'not', term: 'two' },
          { status: 'not', term: 'one two three' },
          { status: 'and', term: 'one two three' },
        ],
        fields: {
          subject: [
            {
              field: 'name',
              status: 'included',
              options: false,
              disabled: false,
            },
            {
              field: 'place',
              status: 'excluded',
              options: false,
              disabled: false,
            },
          ],
          content: [
            {
              field: 'body',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'summary',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'terms',
              status: 'default',
              options: false,
              disabled: false,
            },
          ],
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
          subject: [
            {
              field: 'name',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'place',
              status: 'default',
              options: false,
              disabled: false,
            },
          ],
          content: [
            {
              field: 'body',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'summary',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'terms',
              status: 'default',
              options: false,
              disabled: false,
            },
          ],
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
          subject: [
            {
              field: 'name',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'place',
              status: 'default',
              options: false,
              disabled: false,
            },
          ],
          content: [
            {
              field: 'body',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'summary',
              status: 'default',
              options: false,
              disabled: false,
            },
            {
              field: 'terms',
              status: 'default',
              options: false,
              disabled: false,
            },
          ],
        },
        options: false,
        disabled: false,
        selected: true,
      },
    ],
  },
};
