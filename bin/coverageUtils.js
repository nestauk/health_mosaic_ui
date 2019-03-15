#! /usr/bin/env node -r esm

import path from 'path';

import * as _ from 'lamb';
import fetch from 'node-fetch';
import {tapValue} from '@svizzle/utils';
import {saveObj} from '@svizzle/file';

const Ø = _.pipe;

/* Elastic Search queries */

// bool queries
const makeFieldExists = field => ({exists: {field}});
const makeStringFieldIsEmpty = field => ({term: {[field]: ""}});
const makeBoolFieldTrue = field => ({term: {[field]: true}});

/* utils */

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

// test
// const _rules = {string: [x => 1, x => 2], date: [x => 3, x => 4]}
// console.log(makeApplyRules(_rules))

/*
// field.types
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

// test
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

const makeBody = fields => ({
  query: {
    bool: {
      must: [
        ...makeAllFieldExists(fields.types),
        ...applyRules(fields.meta, {
          bool_good: [makeBoolFieldTrue],
        })
      ],
      must_not: [
        ...applyRules(fields.types, {
          string: [makeStringFieldIsEmpty],
        }),
        ...applyRules(fields.meta, {
          bool_bad: [makeBoolFieldTrue],
        })
      ]
    }
  }
});

// const fields = {
//   types: {
//     string: ["title_of_organisation"],
//     coords: ["coordinate_of_organisation"],
//   },
//   meta: {
//     bool_bad: ["booleanFlag_duplicate_abstract"]
//   }
// };
// console.log(JSON.stringify(makeBody(fields), null, 2))
const fields = {
  types: {
    string: [
      "name_of_organisation",
    ],
    coords: [
      "coordinates_of_city",
    ]
  },
  meta: {
    bool_good: [
      "booleanFlag_health_organization"
    ]
  }
};
console.log(JSON.stringify(makeBody(fields), null, 2))

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

const makeSelfPermutations = _.mapWith(item => [item, item]);

const makePermutationsTree = Ø([
  makeKeyedPairs,
  Ø([
    _.collect([
      makeSelfPermutations,
      makeBiPermutations,
    ]),
    _.shallowFlatten,
    // arr => _.shallowFlatten(arr),
  ]),
  groupBiPermutationByFirstFieldName,
  _.mapValuesWith(indexBiPermutationBySecondFieldName)
]);

/* {types: {}, meta: {}}*/
export const makeQueriesTree = fields => {
  const {types, meta} = fields;

  const typesPermutationsTree = makePermutationsTree(types);

  return _.mapValues(typesPermutationsTree,
    _.mapValuesWith(Ø([
      typePermutations => ({
        types: groupByFieldType(typePermutations),
        meta
      }),
      makeBody
    ]))
  )
};

/*
// TODO make recursive, now hard-coded 2 depth levels
{a: {b: 1, c: 2}, d: {e: 3, f: 4}}
=>
[1, 2, 3, 4]
*/
const flattenTree2 = Ø([
  _.mapValuesWith(_.values),
  _.values,
  _.flatten
]);

// test
// const promises = flattenTree2({a: {b: 1, c: 2}, d: {e: 3, f: 4}});
// console.log(promises);

export const fetchPermutations = (endpoint, tree) => {
  const data = {}
  const todo = {}

  const promisesTree = _.mapValues(tree, (targetsObj, sourceKey) => {
    data[sourceKey] = {};

    return _.mapValues(targetsObj, (body, targetKey) =>
      fetch(endpoint, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(res => res.json())
      .then(json => {
        data[sourceKey][targetKey] = json.count
        console.log(sourceKey, targetKey, json.count)
      })
      .catch(err => {
        console.log("!!!", sourceKey, targetKey, err.message)
        if (!_.has(todo, sourceKey)) {
          todo[sourceKey] = [targetKey]
        } else {
          todo[sourceKey].push(targetKey)
        }
      })
    )
  });
  const promises = flattenTree2(promisesTree);

  return Promise.all(promises)
  .then(() => data)
  .catch(err => {
    console.log("err: data", JSON.stringify(data, null, 2))
    console.log("err: todo", JSON.stringify(todo, null, 2))
  })
}
