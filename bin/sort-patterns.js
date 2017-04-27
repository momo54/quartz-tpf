#!/usr/bin/env node
/* file : sort-patterns.js
MIT License

Copyright (c) 2017 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

const fs = require('fs');
const program = require('commander');
const SparqlGenerator = require('sparqljs').Generator;
const normalizer = require('../src/analyzer/normalizer.js');
const sortPatterns = require('../src/analyzer/join-ordering.js');
const _ = require('lodash');

const orderQuery = (node, cardinalities) => {
  const type = node.type.toLowerCase();
  switch (type) {
    case 'bgp':
      return {
        type: 'bgp',
        triples: _.flatten(sortPatterns(node.triples, cardinalities))
      };
    case 'query': {
      const query = _.merge({}, node);
      query.where = query.where.map(p => orderQuery(p, cardinalities));
      return query;
    }
    case 'union':
    case 'group':
    case 'optional':
      return {
        type,
        patterns: node.patterns.map(p => orderQuery(p, cardinalities))
      };
    case 'filter':
      return node;
    default:
      throw new SyntaxError(`Unsupported type during join ordering: ${node.type.toLowerCase()}`);
  }
};

// Command line interface to transform queries
program
  .description('apply join ordering to a SPARQL query')
  .usage('[model] [output] [options]')
  .option('-q, --query <query>', 'evaluates the given SPARQL query')
  .option('-f, --file <file>', 'evaluates the SPARQL query in the given file')
  .parse(process.argv);

// check number of endpoints
if (program.args.length < 2) {
  process.stderr.write('Error: invalid number of arguments.\nSee ./tpf-client --help for more details.\n');
  process.exit(1);
}

// fetch the model
const modelFile = program.args[0];
if (!fs.existsSync(modelFile)) {
  process.stderr.write('Error: you must specify a valid model file as input.\nSee ./tpf-client --help for more details.\n');
  process.exit(1);
}
const model = JSON.parse(fs.readFileSync(modelFile, 'utf-8'));

// fetch SPARQL query to execute
let query = null;
if (program.query) {
  query = program.query;
} else if (program.file && fs.existsSync(program.file)) {
  query = fs.readFileSync(program.file, 'utf-8');
} else {
  process.stderr.write('Error: you must specify a SPARQL query to execute.\nSee ./tpf-client --help for more details.\n');
  process.exit(1);
}

const sortedQuery = orderQuery(normalizer(query), model.nbTriples);
const gen = new SparqlGenerator();
fs.writeFileSync(program.args[1], gen.stringify(sortedQuery));
