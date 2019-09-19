export const capitalise = s => s.charAt(0).toUpperCase() + s.slice(1);
export const kebabcaseToCamelcase = s =>
  s
    .split('-')
    .map(capitalise)
    .join('');
export const titleCase = s =>
  s.replace(/(?:^|\s)\w/g, match => match.toUpperCase());

export const truncateText = str => {
  let length = 0;

  const stringArray = str.split(' ');
  const index = stringArray.findIndex(word => {
    length += word.length;

    return length < 200 ? false : true;
  });

  return stringArray.slice(0, index).join(' ') + '...';
};
