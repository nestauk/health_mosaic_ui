export const parseQuery = inputObject => {
  const { value } = inputObject;
  const regexQuery = /^(-*)([^]*)$/;

  return {
    ...inputObject,
    value: value
      .split(',')
      .reduce((acc, next) => {
        const isQuery = next.trim().match(regexQuery);
        return acc.concat([
          { status: isQuery[1] === '-' ? 'not' : 'and', value: isQuery[2] },
        ]);
      }, [])
      .filter(v => v.value.length),
  };
};
const fieldBuilder = (fieldArr, q, type = '') =>
  fieldArr.reduce((acc, next) => {
    return (
      acc + ' AND ' + (type === 'exclude' ? 'NOT ' : '') + next + `:(${q})`
    );
  }, '');

const queryBuilder = query =>
  query
    .reduce((acc, next, i, arr) => {
      return (
        acc +
        (next.status === 'not' ? '-' : '') +
        `"${next.value}"` +
        (arr[i + 1] ? ' OR ' : '')
      );
    }, '')
    .trim();

export const dslBuilder = (query, fields) => {
  const q = queryBuilder(query);

  const splitFields = fields.reduce(
    (acc, next) => {
      if (!next.visible) return acc;
      acc[next.status] = acc[next.status].concat(next.field);
      return acc;
    },
    { default: [], included: [], excluded: [] }
  );

  if (splitFields.default.length === Object.keys(fields).length) {
    return q;
  }

  let queryString = splitFields.included.length
    ? `${fieldBuilder(splitFields.included, q)}`
    : q;

  if (splitFields.excluded.length) {
    queryString = `${queryString}${fieldBuilder(
      splitFields.excluded,
      q,
      'exclude'
    )}`;
  }

  return queryString
    .trim()
    .replace(/^AND/, '')
    .trim();
};

export const multiDslBuilder = (query, fieldCollection) => {
  let dslCollection = {};

  for (const key in fieldCollection) {
    dslCollection = {
      ...dslCollection,
      [key]: dslBuilder(query, fieldCollection[key]),
    };
  }
  return dslCollection;
};

const fieldMapper = (map, field) =>
  map[field.field].map(v => ({
    field: v,
    status: field.status,
    visible: field.visible,
  }));

export const createFields = (fieldMap, fields) => {
  let transformedFields = {};

  for (const key in fieldMap) {
    transformedFields = {
      ...transformedFields,
      [key]: fields.reduce((acc, next) => {
        if (!next.visible) return acc;
        return acc.concat(fieldMapper(fieldMap[key], next));
      }, []),
    };
  }
  return transformedFields;
};
