#! /usr/bin/env node -r esm

import * as _ from 'lamb';
import {__} from 'lamb';

import fetch from 'node-fetch';
import {isIterableNotEmpty, tapValue} from '@svizzle/utils';

const Ø = _.pipe;

/* Elastic Search queries */

// bool queries
const makeFieldExists = field => ({exists: {field}});
const makeStringFieldIsEmpty = field => ({term: {[field]: ""}});
const makeBoolFieldTrue = field => ({term: {[field]: true}});

/* utils */

// powerset without empty set
export const makeFilteredPowerSet = _.reduceWith((acc, value, index, array) => {
  const slicesFromIndex = _.map(
    _.range(index + 1, array.length + 1),
    last => _.slice(array, index, last)
  );

  return acc.concat(slicesFromIndex);
}, []);

// https://en.wikipedia.org/wiki/Power_set
export const makeFullPowerSet = Ø([
  makeFilteredPowerSet,
  _.append([])
]);

// const array = _.range(0, 9);
// const arrayPowerSet = makeFullPowerSet(array);
// console.log(arrayPowerSet, arrayPowerSet.length);

// _.range(1, 25).forEach(n => {
//   console.log(`${n}: ${makeFullPowerSet(_.range(0, n)).length} combinations`);
// })

const mapToAllValues = fn => Ø([_.values, _.flatten, _.mapWith(fn)]);
const makeAllFieldExists = mapToAllValues(makeFieldExists);

const allValues = Ø([_.values, _.flatten]);

const pickAndTransformValues = fnMap => Ø([
  _.pickIf((value, key) => _.has(fnMap, key)),
  _.mapValuesWith((value, key) => _.application(fnMap[key], [value]))
]);

/*
{string: [a, b], date: [c, d]}  // a, b, c, d: functions
=>
transformValues({
  string: _.mapWith(_.collect([a, b])),
  date: _.mapWith(_.collect([c, d]))
})
*/
const makeApplyRules = Ø([
  _.mapValuesWith(Ø([_.collect, _.mapWith])),
  pickAndTransformValues,
]);

// const _rules = {string: [x => 1, x => 2], date: [x => 3, x => 4]}
// console.log(makeApplyRules(_rules))

/*
// field.permutable
{
  string: [
    "foo",
    "bar",
  ],
  date: [
    "zoo",
    "jar",
  ]
}

// rules (a, b, c, are functions)
{string: [a, b], date: [c, d]}
=>
[
  a("foo"), b("foo"),
  a("bar"), b("bar"),
  c("zoo"), d("zoo"),
  c("jar"), d("jar"),
]
*/
const applyRules = (fieldTypes, rules) =>
  allValues(
    makeApplyRules(rules)(fieldTypes)
  );

// console.log(
//   applyRules(fieldTypes, {string: [makeStringFieldIsEmpty]})
// )

/*
{
  foo: ["a", "b"],
  bar: ["c", "d"]
}
=>
[
  {foo: "a"},
  {foo: "b"},
  {bar: "c"},
  {bar: "d"}
]
*/
const makeKeyedPairs = Ø([
  _.pairs,
  _.mapWith(([key, array]) =>
    _.map(array, item => ({[key]: item}))
  ),
  _.flatten,
]);

/*
[
  {foo: "a"},
  {foo: "b"},
  {bar: "c"},
  {bar: "d"}
]
=>
[
  [{foo: "a"}, {foo: "b"}],
  [{foo: "a"}, {bar: "c"}],
  [{foo: "a"}, {bar: "d"}],
  [{foo: "b"}, {bar: "c"}],
  [{foo: "b"}, {bar: "d"}],
  [{bar: "c"}, {bar: "d"}]
]
*/
const makeBiPermutations = _.reduceWith((acc, item, index, array) => {
  for (let cursor = index + 1; cursor < array.length; cursor++) {
    acc.push([item, array[cursor]]);
  }
  return acc;
}, []);

/*
[{foo: "b"}, {bar: "c"}, {bar: "d"}]
=>
{
  foo: ['b'],
  bar: ['c', 'd'],
}
*/
const groupByFieldType = Ø([
  _.mapWith(_.pairs),
  _.shallowFlatten,
  _.groupBy(_.getAt(0)),
  _.mapValuesWith(_.mapWith(_.getAt(1))),
]);

const makeBody = cluster => ({
  query: {
    bool: {
      must: [
        ...makeAllFieldExists(cluster.set),
        ...applyRules(cluster.unpermutable, {
          bool_good: [makeBoolFieldTrue],
        }),
      ],
      must_not: [
        ...applyRules(cluster.set, {
          string: [makeStringFieldIsEmpty],
        }),
        ...makeAllFieldExists(cluster.difference),
        ...applyRules(cluster.unpermutable, {
          bool_bad: [makeBoolFieldTrue],
        })
      ]
    }
  }
});

// const cluster = {
//   set: {
//     string: ["sfoo", "sbar"],
//     coords: ["cfoo", "cbar"],
//   },
//   difference: {
//     string: ["dfoo"],
//   },
//   unpermutable: {
//     bool_bad: ["bbFoo"],
//     bool_good: ["bgFoo"]
//   }
// };
// console.log(JSON.stringify(makeBody(cluster), null, 2))

const groupBiPermutationByFirstFieldName = _.groupBy(Ø([
  _.getAt(0),
  _.pairs,
  _.getPath("0.1")]
));
const indexBiPermutationBySecondFieldName = _.indexBy(Ø([
  _.getAt(1),
  _.pairs,
  _.getPath("0.1")]
));

const makeSelfPermutations = _.mapWith(item => [item]);

// items
const makeComplementsPowerset = Ø([
  _.collect([
    makeFilteredPowerSet,
    _.identity
  ]),
  ([powerset, baseset]) => _.map(powerset, set => ({
    set,
    difference: _.difference(baseset, set)
  }))
]);

// const baseset = ['a', 'b', 'c']
// console.log(JSON.stringify(baseset))
// console.log(JSON.stringify(makeComplementsPowerset(baseset)))

const makeFieldsComplements = Ø([makeKeyedPairs, makeComplementsPowerset]);

// const fields = {
//   foo: ['b'],
//   bar: ['c', 'd'],
// }
// console.log(JSON.stringify(fields))
// console.log(JSON.stringify(makeFieldsComplements(fields), null, 2))

/* {foo: "b"} => 'b' */
const getValue = Ø([_.pairs, _.getPath("0.1")]);

// TODO move to svizzle
const makeWithKeys = names => _.partial(_.make, [names, __]);
const makeWithValues = values => _.partial(_.make, [__, values]);

// TODO use svizzle's new makeWith
const makeQuery = unpermutable => Ø([
  _.collect([
    Ø([_.getKey('set'), _.mapWith(getValue)]),
    Ø([
      cluster => ({
        set: groupByFieldType(cluster.set),
        difference: groupByFieldType(cluster.difference),
        unpermutable
      }),
      makeBody
    ])
  ]),
  makeWithKeys(['fields', 'queryBody'])
]);

// const cluster = {
//   set: [
//     {foo: "b"},
//     {bar: "c"}
//   ],
//   difference: [
//     {bar: "d"}
//   ]
// }
// const unpermutable = {
//   bool_bad: ["bbFoo"],
//   bool_good: ["bgFoo"]
// }
// console.log(JSON.stringify(cluster))
// console.log(JSON.stringify(makeQuery(unpermutable)(cluster), null, 2))

export const makeQueries = ({permutable, unpermutable}) => {
  const fieldsComplements = makeFieldsComplements(permutable);

  return _.map(fieldsComplements, makeQuery(unpermutable))
};

// const fields = {
//   permutable: {
//     string: ["a", "b"],
//     date: ["c"]
//   },
//   unpermutable: {
//     bool_bad: [
//       "booleanFlag_duplicate_abstract"
//     ]
//   }
// };
// console.log(JSON.stringify(fields))
// console.log(JSON.stringify(makeQueries(fields), null, 2))

export const fetchPowerset = (endpoint, queries) => {
  const data = []
  const todo = []

  const promises = _.map(queries, ({fields, queryBody}) =>
    fetch(endpoint, {
      method: 'post',
      body: JSON.stringify(queryBody),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(json => {
      data.push([fields, json.count])
      console.log(fields, json.count)
    })
    .catch(err => {
      console.log("!!!", fields, err.message)
      data.push(fields)
    })
  );

  return Promise.all(promises)
  .then(() => data)
  .catch(err => {
    console.log("err: data", JSON.stringify(data, null, 2))
    console.log("err: todo", JSON.stringify(todo, null, 2))
  })
}
