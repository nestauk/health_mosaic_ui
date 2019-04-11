/* eslint-disable indent */
import { baseUrl, size } from '../config';

const makeQuery = (querystring, requiredFields) => ({
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
  },
});

function generateBody(type, querystring, id = 0) {
  const body = {
    single: {
      endpoint: baseUrl,
      body: {
        query: makeQuery(querystring, [
          'title_of_project',
          'placeName_city_organisation',
          'placeName_state_organisation',
        ]),
        size,
      },
    },

    scroll: {
      endpoint: `${baseUrl}?scroll=100m`,
      body: {
        query: makeQuery(querystring, [
          'title_of_project',
          'placeName_city_organisation',
          'placeName_state_organisation',
        ]),
        size,
      },
    },

    nextScroll: {
      endpoint: `${baseUrl}/scroll`,
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

export async function query(querystring, type = 'single', id) {
  const data = generateBody(type, querystring, id);
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
