
/* rouding: see https://github.com/d3/d3-path/issues/10#issuecomment-262577521 */

export const roundTo = precision => x => Number(x.toFixed(precision));
export const toInt = roundTo(0);

export const roundTo1 = roundTo(1);
