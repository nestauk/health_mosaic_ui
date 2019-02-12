export const removeQuery = (arr, i, j) =>
  arr
    .map((query, queryIndex) => {
      if (queryIndex === i) {
        return {
          ...query,
          value: query.value
            .split(',')
            .filter((v, index) => index !== j)
            .join(','),
        };
      } else {
        return query;
      }
    })
    .filter(v => v.value);

export const formatANDString = str =>
  str.trim()[0] === '-' //  don't even ask
    ? ` ${str //  eslint-disable-next-line
        .trim() //  eslint-disable-next-line
        .slice(1) //  eslint-disable-next-line
        .trim()}`
    : ` -${str.trim()}`;

export const negateQueryString = (arr, index, inputLocation, current) => {
  let charCount = 0;
  return arr.map((v, i) => {
    if (i !== current) return v;
    return v
      .split(',')
      .map(el => {
        charCount = charCount + el.length + 1;
        if (
          inputLocation >= charCount - el.length - 1 &&
          inputLocation <= charCount
        ) {
          return formatANDString(el);
        } else {
          return el;
        }
      }, 0)
      .join(',');
  });
};

export const negateQueryObj = (arr, vIndex, qIndex) =>
  arr.map((valArr, i) => {
    if (vIndex !== i) return valArr;
    return {
      ...valArr,
      value: valArr.value
        .split(',')
        .map((query, j) => {
          if (qIndex !== j) return query;

          return formatANDString(query);
        })
        .join(','),
    };
  });
