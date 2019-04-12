/* eslint-disable indent */
import { endpointScannerSearch, endpointScanner, size } from '../config';

export const makeQuery = (querystring, requiredFields) => ({
  bool: {
    must: [
      {
        query_string: { query: querystring, default_operator: 'AND' },
      },
      ...(requiredFields
        ? requiredFields.reduce((acc, next) => {
            return acc.concat([
              {
                regexp: {
                  [next]: '.+',
                },
              },
              {
                exists: {
                  field: next,
                },
              },
            ]);
          }, [])
        : []),
    ],
    must_not: [
      {
        exists: {
          field: 'booleanFlag_duplicate_abstract',
        },
      },
    ],
  },
});

function generateBody(type, querystring, id = 0, requiredFields) {
  const body = {
    single: {
      endpoint: endpointScannerSearch,
      body: {
        query: makeQuery(querystring, requiredFields),
        size,
      },
    },

    scroll: {
      endpoint: `${endpointScanner}?scroll=100m`,
      body: {
        query: makeQuery(querystring, requiredFields),
        size,
      },
    },

    nextScroll: {
      endpoint: `${endpointScanner}/scroll`,
      body: {
        size,
        scroll_id: id,
      },
    },
  };
  return body[type];
}

class SearchError extends Error {
  constructor(type, reason) {
    super(`${type}: ${reason}`);
    this.name = 'SearchError';
    this.type = type;
    this.reason = reason;
  }
}

export async function query(querystring, type = 'single', id, requiredFields) {
  const data = generateBody(type, querystring, id, requiredFields);
  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data.body),
  };

  let result;

  try {
    let response = await fetch(`${data.endpoint}`, options);

    if (!response.ok)
      throw new SearchError(response.error.type, response.error.reason);

    response = await response.json();
    result =
      response.hits && response.hits.total
        ? response
        : { ...response, hits: false };
  } catch (e) {
    result = { type: e.type, reason: e.reason };
  }
  return result;
}
