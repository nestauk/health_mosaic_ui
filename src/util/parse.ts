import * as _ from 'lamb';
import { fieldGroups } from '../config';

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

const isVisibleField = ({ visible, status }) =>
  status !== 'default' && visible;

const transFormFields = (acc, { field, status }) => [
  ...acc,
  ...fieldGroups[field].map(v => ({ title: v, status })),
];

const createValidFields = _.pipe([
  _.filterWith(isVisibleField),
  _.reduceWith(transFormFields, [])
]);

const transformValue = ({ value, status }) => ({ query: value, status });

export const createQueryObject = queries =>
  queries.map(({ content, subject, value }) => ({
    fields: createValidFields(_.union(content, subject)),
    values: value.map(transformValue),
  }));
