/* eslint-disable indent */
import {
  endpointScannerSearch,
  endpointScanner,
  size,
  requiredFields,
} from '../config';

import { shallowFlatten } from 'lamb';

// This is the regexp for 'text' fields to disallow empty strings
// it destroys performance and cannot be used.

// const preventEmptyString = (field, type) =>
//   type === 'text'
//     ? {
//         regexp: {
//           [field]: '.+',
//         },
//       }
//     : false;

const makeFieldExist = field => ({ exists: { field } });

// this is where the regexp matcher would go
const makeFieldMatch = ({ field }) => [makeFieldExist(field)].filter(Boolean);

export const makeQuery = querystring => {
  return {
    bool: {
      must: [
        { query_string: { query: querystring } },
        {
          bool: {
            should: Object.keys(requiredFields).map(index => ({
              bool: {
                must: shallowFlatten(requiredFields[index].map(makeFieldMatch)),
              },
            })),
          },
        },
      ],
    },
  };
};

function generateBody(type, querystring, id = 0) {
  const body = {
    single: {
      endpoint: endpointScannerSearch,
      body: {
        query: makeQuery(querystring),
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
