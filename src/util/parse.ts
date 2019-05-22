import { union } from 'lamb';
import { newFieldMappings } from '../config';

export const parseQuery = inputObject => {
  const { value } = inputObject;
  const regexQuery = /^(-*)([^]*)$/;

  return {
    ...inputObject,
    value: value
      .split(',')
      .reduce((acc, next) => {
        const isQuery = next.length
          ? next.trim().match(regexQuery)
          : next.match(regexQuery);
        return acc.concat([
          { status: isQuery[1] === '-' ? 'not' : 'and', value: isQuery[2] },
        ]);
      }, [])
      .filter(v => v.value.length),
  };
};

const filterQueryObject = ({ visible, status }) =>
  status !== 'default' && visible;

const transFormFields = (acc, { field, status }) => [
  ...acc,
  ...newFieldMappings[field].map(v => ({ title: v, status })),
];

const createValidFields = fields =>
  fields.filter(filterQueryObject).reduce(transFormFields, []);

const transformValues = ({ value, status }) => ({ query: value, status });

export const createQueryObject = queries =>
  queries.map(({ content, subject, value }) => ({
    fields: createValidFields(union(content, subject)),
    values: value.map(transformValues),
  }));
