#! /usr/bin/env node -r esm

import * as _ from 'lamb';
import fetch from 'node-fetch';
import {tapValue} from '@svizzle/utils';

import {endpointNIHCount} from '../src/config';

/* utils */

const allValues = _.pipe([_.values, _.flatten]);

const pickAndTransformValues = fnMap => _.pipe([
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
const makeApplyRules = _.pipe([
  _.mapValuesWith(_.pipe([_.collect, _.mapWith])),
  pickAndTransformValues,
]);

// test
// const _rules = {string: [x => 1, x => 2], date: [x => 3, x => 4]}
// console.log(makeApplyRules(_rules))

/*
// fieldTypes
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
const applyTypeRules = (fieldTypes, rules) =>
  allValues(
    makeApplyRules(rules)(fieldTypes)
  );

// test
// console.log(
//   applyTypeRules(fieldTypes, {string: [makeStringFieldIsNotEmpty]})
// )

const mapToAllValues = fn => _.pipe([_.values, _.flatten, _.mapWith(fn)]);

// Elastic Search queries
const makeFieldExists = field => ({exists: {field}}); // exists
const makeStringFieldIsNotEmpty = field => ({term: {[field]: ""}}); // bool

const makeAllFieldExists = mapToAllValues(makeFieldExists);

/* coverage */

const fieldTypes = {
  string: [
    "id_of_project",
    "title_of_organisation",
    "title_of_project",
    "textBody_descriptive_project",
    "textBody_abstract_project",
    "terms_descriptive_project",
    "terms_mesh_abstract",
    "placeName_country_organisation",
    "placeName_state_organisation",
    "placeName_city_organisation",
    "placeName_zipcode_organisation",
    "id_iso2_country",
    "id_iso3_country",
    "id_of_continent",
    "currency_total_cost",
    // "terms_sdg_project",
  ],
  date: [
    "date_start_project",
    "date_end_project",
  ],
  number: [
    "id_isoNumeric_country",
    "year_fiscal_funding",
    "cost_total_project",
    // "score_crossPollination_project",
    // "score_growth_project"
  ],
  coords: [
    "coordinate_of_organisation",
  ]
};

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
const makeKeyedPairs = _.pipe([
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
const makeFieldTypes = _.pipe([
  _.mapWith(_.pairs),
  _.shallowFlatten,
  _.groupBy(_.getAt(0)),
  _.mapValuesWith(_.mapWith(_.getAt(1))),
  // tapValue,
]);

const makeBody = fieldTypes => ({
  query: {
    bool: {
      must: makeAllFieldExists(fieldTypes),
      must_not: [
        ...applyTypeRules(fieldTypes, {
          string: [makeStringFieldIsNotEmpty]
        })
        // ...strings.map(makeStringFieldIsNotEmpty)
        , {term: {booleanFlag_duplicate_abstract: true}}
      ]
    }
  }
});

// console.log(JSON.stringify(makeBody(fieldTypes), null, 2))

const groupBiPermutationByFirstFieldName = _.groupBy(_.pipe([
  _.getAt(0),
  _.pairs,
  _.getPath("0.1")]
));
const indexBiPermutationBySecondFieldName = _.indexBy(_.pipe([
  _.getAt(1),
  _.pairs,
  _.getPath("0.1")]
));

const makeQueriesTree = _.pipe([
  // tapValue,
  makeKeyedPairs,
  makeBiPermutations,
  groupBiPermutationByFirstFieldName, // bi-permutations by field name
  _.mapValuesWith(
    _.pipe([
      indexBiPermutationBySecondFieldName,
      _.mapValuesWith(
        _.pipe([
          makeFieldTypes,
          makeBody
        ])
      )
    ])
  )
  // _.mapValuesWith(
  //   _.mapWith(_.pipe([
  //     makeFieldTypes,
  //     makeBody
  //   ]))
  // )
]);

/*
// TODO make recursive, now hard-coded 2 depth levels
{a: {b: 1, c: 2}, d: {e: 3, f: 4}}
=>
[1, 2, 3, 4]
*/
const flattenObject2 = _.pipe([
  _.mapValuesWith(_.values),
  _.values,
  _.flatten
]);

// test
// const promises = flattenObject2({a: {b: 1, c: 2}, d: {e: 3, f: 4}});
// console.log(promises);

const fetchPermutations = tree => {
  const data = {}
  const todo = {}

  const promisesTree = _.mapValues(tree, (targetsObj, sourceKey) => {
    data[sourceKey] = {};

    return _.mapValues(targetsObj, (body, targetKey) =>
      fetch(endpointNIHCount, {
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
  const promises = flattenObject2(promisesTree);

  Promise.all(promises)
  .then(json => {
    console.log("ok: data", JSON.stringify(data, null, 2))
  })
  .catch(err => {
    console.log("err: data", JSON.stringify(data, null, 2))
    console.log("err: todo", JSON.stringify(todo, null, 2))
  })
}

const queryPermutations = makeQueriesTree(fieldTypes);
// console.log(JSON.stringify(queryPermutations, null, 2));

fetchPermutations(queryPermutations)

/*
nih_v2
data {
  "id_of_project": [
    1542158
    1542158
    1542158
    1689936
    1542158
    1689936
    1542158
    1464874
    1542158
    1474217
    1508551
    1508551
    1508551
    2188299
    1355228
    1357845
    1508551
    2188299
    2188299
    1478125
  ]
  "title_of_organisation": [
    1542297
    1542297
    1314012
    1542297
    1314012
    1542297
    1464877
    1542297
    1474220
    1508554
    1508554
    1508554
    1542297
    1355263
    1357878
    1508554
    1542297
    1542297
    1478128
  ]
  "title_of_project": [
    1542297
    1314012
    1542297
    1314012
    1542297
    1464877
    1542297
    1474220
    1508554
    1508554
    1508554
    1542297
    1355263
    1357878
    1508554
    1542297
    1542297
    1478128
  ]
  "textBody_descriptive_project": [
    1314012
    1542297
    1314012
    1542297
    1464877
    1542297
    1474220
    1508554
    1508554
    1508554
    1542297
    1355263
    1357878
    1508554
    1542297
    1542297
    1478128
  ]
  "textBody_abstract_project": [
    1314012
    1690057
    1314012
    1247705
    1314012
    1254523
    1282829
    1282829
    1282829
    1690057
    1146801
    1153265
    1282829
    1690057
    1690057
    1255869
  ]
  "terms_descriptive_project": [
    1314012
    1542297
    1464877
    1542297
    1474220
    1508554
    1508554
    1508554
    1542297
    1355263
    1357878
    1508554
    1542297
    1542297
    1478128
  ]
  "terms_mesh_abstract": [
    1314012
    1247705
    1314012
    1254523
    1282829
    1282829
    1282829
    1690057
    1146801
    1153265
    1282829
    1690057
    1690057
    1255869
  ]
  "placeName_country_organisation": [
    1464877
    1542297
    1474220
    1508554
    1508554
    1508554
    1542297
    1355263
    1357878
    1508554
    1542297
    1542297
    1478128
  ]
  "placeName_state_organisation": [
    1464877
    1464326
    1464876
    1464876
    1464876
    1464877
    1337759
    1340573
    1464876
    1464877
    1464877
    1464793
  ]
  "placeName_city_organisation": [
    1474220
    1508554
    1508554
    1508554
    1542297
    1355263
    1357878
    1508554
    1542297
    1542297
    1478128
  ]
  "placeName_zipcode_organisation": [
    1473874
    1473874
    1473874
    1474220
    1346931
    1349682
    1473874
    1474220
    1474220
    1473811
  ]
  "id_iso2_country": [
    1508554
    1508554
    1508554
    1353576
    1356209
    1508554
    1508554
    1508554
    1477935
  ]
  "id_iso3_country": [
    1508554
    1508554
    1353576
    1356209
    1508554
    1508554
    1508554
    1477935
  ]
  "id_of_continent": [
    1508554
    1353576
    1356209
    1508554
    1508554
    1508554
    1477935
  ]
  "currency_total_cost": [
    1355263
    1357878
    1508554
    2188438
    2188438
    1478128
  ]
  "date_start_project": [
    null
    null
    null
    null
    null
  ]
  "date_end_project": [
    null
    null
    null
    null
  ]
  "id_isoNumeric_country": [
    null
    null
    null
  ]
  "year_fiscal_funding": [
    null
    null
  ]
  "cost_total_project": [
    null
  ]
}
*/
