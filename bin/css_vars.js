#!/usr/bin/env node -r esm

import fs from "fs";
import path from "path";
import util from "util";

import * as _ from "lamb";
import postcss from 'postcss'

import { saveObj } from "@svizzle/file";
import { tapValue } from "@svizzle/utils";

const GLOBAL_CSS = path.resolve(__dirname, "..", "static/global.css");
const GLOBAL_CSS_VARS = path.resolve(__dirname, "..", "src/global.css.json");
const readFile = util.promisify(fs.readFile); // TODO use from next svizzle
const isRoot = node => node.selector && node.selector === ':root';
const isDecl = node => node.type && node.type === 'decl';
const getNodes = _.getKey('nodes');

const getRootDecls =  _.pipe([
  getNodes,
  _.findWhere(isRoot),
  getNodes,
  _.filterWith(isDecl),
  _.indexBy(_.getKey('prop')),
  _.mapValuesWith(_.getKey('value'))
]);

readFile(GLOBAL_CSS, 'utf-8')
.then(postcss.parse)
.then(getRootDecls)
.then(tapValue)
.then(saveObj(GLOBAL_CSS_VARS, 2))
.catch(err => console.error(err));
