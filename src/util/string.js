export const capitalise = s => s.charAt(0).toUpperCase() + s.slice(1);
export const kebabcaseToCamelcase = s =>
  s
    .split('-')
    .map(capitalise)
    .join('');
export const titleCase = s =>
  s.replace(/(?:^|\s)\w/g, match => match.toUpperCase());
