/* eslint-disable indent */
import { endpointScannerSearch, size, requiredFields } from '../config';

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
const makeFieldMatch = ({ field }) => makeFieldExist(field);

export const makeQuery = querystring => {
  return {
    bool: {
      must: [
        { query_string: { query: querystring } },
        {
          bool: {
            should: Object.keys(requiredFields).map(index => ({
              bool: {
                must: requiredFields[index].map(makeFieldMatch),
              },
            })),
          },
        },
      ],
    },
  };
};

function generateBody(querystring) {
  return {
    query: makeQuery(querystring),
    size,
  };
}

class SearchError extends Error {
  constructor(type, reason) {
    super(`${type}: ${reason}`);
    this.name = 'SearchError';
    this.type = type;
    this.reason = reason;
  }
}

export async function query(querystring) {
  const body = generateBody(querystring);
  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  let result;

  try {
    let response = await fetch(`${endpointScannerSearch}`, options);

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
