import * as _ from 'lamb';

export const filterFields = ({ disabled, status }) =>
  disabled || status !== 'default';

export const filterRuleset = ruleset =>
  !ruleset.disabled && ruleset.terms.every(({ term }) => term.length);

export const stringifyTerms = ({ status, term }) =>
  (status === 'not' ? '-' : '') + term.trim().replace(/ /g, '+');

export const stringifyFields = ({ status, field }) =>
  (status === 'excluded' ? '-' : '') + field;

export const filterQuery = uiQuery =>
  uiQuery.filter(filterRuleset).map(query => ({
    terms: query.terms.filter(({ term }) => term.length),
    fields: [].concat(
      query.fields.subject.filter(filterFields),
      query.fields.content.filter(filterFields)
    ),
  }));

export const queryToUrlString = query =>
  query
    .map(query => ({
      terms: query.terms.map(stringifyTerms).join(','),
      fields: query.fields.map(stringifyFields).join(','),
    }))
    .reduce((acc, { terms, fields }) => `${acc}(${terms},in:${fields})`, '');
