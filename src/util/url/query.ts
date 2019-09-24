import { contentAliases, subjectAliases } from '../../config';
import { UIField, UITerm } from '../../stores/interfaces';

export const newTerm = (
  term: string = '',
  status: 'and' | 'not' = 'and'
): UITerm => ({
  term,
  status,
});

export const newField = (fields: string[]): UIField[] =>
  fields.map(field => ({
    field,
    status: 'default',
    options: false,
    disabled: false,
  }));

export const newRuleset = (selected = false) => ({
  terms: [newTerm()],
  fields: {
    subject: newField(subjectAliases),
    content: newField(contentAliases),
  },
  options: false,
  disabled: false,
  selected: selected,
  isEditing: true,
});
