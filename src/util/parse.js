export const parseInput = valueStr => {
  return valueStr.map(parser);
};

function parser(str) {
  let current = '';
  const results = [];

  // regex
  const regexField = /^([_a-zA-Z]+):\(([^]+?)\)$/;

  const regexSingleFieldComma = /^([_a-zA-Z]+):([-\w]+?)[\s,]$/;
  const regexSingleField = /^([_a-zA-Z]+):([-\w]+?)$/;

  const regexWhitespaceComma = /^[\s,]/;
  const regexQuery = /^(-*)([\w\s+]*),$/;
  const regexFinal = /^(-*)([\w\s+]*)$/;

  // parse stuff
  parse: for (let i = 0; i < str.length; i += 1) {
    current += str[i];

    if (regexWhitespaceComma.test(current)) {
      current = '';
      continue parse;
    }

    const isSingleField = current.match(regexSingleFieldComma);
    if (isSingleField) {
      results.push({
        field: isSingleField[1],
        // run the queries within the field(...) through the parser too
        queries: parser(isSingleField[2]),
      });

      current = '';
      continue parse;
    }

    const isField = current.match(regexField);
    if (isField) {
      results.push({
        field: isField[1],
        // run the queries within the field(...) through the parser too
        queries: parser(isField[2]),
      });

      current = '';
      continue parse;
    }

    const isQuery = current.match(regexQuery);
    if (isQuery) {
      results.push({
        status: isQuery[1] === '-' ? 'not' : 'and',
        value: isQuery[2],
      });
      current = '';
      continue parse;
    }
  }

  // cos of my weird regex, we just need to test the value of current when the final loop as finished
  const finalQuerySimple = current.trim().match(regexFinal);
  const finalQueryField = current.trim().match(regexSingleField);

  if (current.length && !regexWhitespaceComma.test(current)) {
    if (finalQueryField) {
      results.push({
        field: finalQueryField[1],
        // run the queries within the field(...) through the parser too
        queries: parser(finalQueryField[2]),
      });
    } else if (finalQuerySimple) {
      results.push({
        status: finalQuerySimple[1] === '-' ? 'not' : 'and',
        value: finalQuerySimple[2],
      });
    }
  }

  return results;
}

export const querify = queryObject => {
  return queryObject.reduce(
    (acc, next, i, arr) =>
      acc +
      next.reduce((acc2, next2, i2, arr2) => {
        if (next2.value) {
          return basicQuery(acc2, next2, i2, arr2);
        } else if (next2.field) {
          return (
            acc2 +
            `${next2.field}:${next2.queries.reduce(basicQuery, '(')}` +
            (arr2[i2 + 1] ? ' ' : ')')
          );
        }
      }, '(') +
      (arr[i + 1] ? ' OR ' : ')'),
    '('
  );
};

const basicQuery = (acc, next, i, arr) =>
  acc +
  (next.status === 'not' ? '-' : '') +
  next.value +
  (arr[i + 1] ? ' ' : ')');
