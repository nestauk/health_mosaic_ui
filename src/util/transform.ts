import * as _ from 'lamb';
import { newFieldMappings } from '../config';

export const toggle = (x: boolean): boolean => !x;
export const add1 = _.add(1);
export const removeLast = _.sliceAt(0, -1);

const filterQueryObject = ({ disabled, status }) => {
  console.log(disabled, status);
  return status !== 'default' && !disabled;
};

const transFormFields = (acc, { field, status }) => [
  ...acc,
  ...newFieldMappings[field].map(v => ({ title: v, status })),
];

const createValidFields = fields =>
  fields.filter(filterQueryObject).reduce(transFormFields, []);

const transformValues = ({ term, status }) => ({ query: term, status });

export const createQueryObject = queries =>
  queries.map(({ terms, fields: { subject, content } }) => ({
    fields: createValidFields(_.union(content, subject)),
    values: terms.map(transformValues),
  }));
