/* file : tpf-client-model.js
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
const http = require('http');
const program = require('commander');
const computeModel = require('../src/analyzer/cost-model.js');
const SparqlParser = require('sparqljs').Parser;
const _ = require('lodash');
const ldf = require('../Client.js/ldf-client.js');
const prefixes = require('../Client.js/config-default.json').prefixes;
ldf.Logger.setLevel('EMERGENCY');

/**
 * Measure the reponse time of a endpoint
 * @param  {string} url - The url of the endpoint
 * @return {Promise} A Promise fullfilled with the reponse time of the endpoint (in milliseconds)
 */
const measureResponseTime = url => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let cpt = 0;
    http.get(url, res => {
      res.on('data', () => cpt++);
      res.once('error', err => reject(err));
      res.once('end', () => {
        const endTime = Date.now();
        resolve(endTime - startTime);
      });
    });
  });
};

/**
 * Extract all triples from a query
 * @param  {Object} query - The current node of the query
 * @return {Object[]} The triples of the query
 */
const extractTriples = query => {
  switch (query.type) {
    case 'bgp':
      return query.triples;
    case 'union':
    case 'group':
      return _.flatMap(query.patterns, p => extractTriples(p));
    case 'query':
      return _.flatMap(query.where, p => extractTriples(p));
    default:
      return [];
  }
};

/**
 * Find the cardinality of a triple pattern
 * @param  {Object} triple   - The triple pattern
 * @param  {FragmentsClient} client - The fragment client used to fetch the data
 * @return {Promise} A Promise fullfilled with the triple associated with its cardinality (as a tuple)
 */
const findCardinality = (triple, client) => {
  return new Promise(resolve => {
    const fragment = client.getFragmentByPattern(triple);
    fragment.getProperty('metadata', metadata => {
      fragment.close();
      resolve([ JSON.stringify(triple), metadata.totalTriples ]);
    });
  });
};

program
  .description('generate the cost model & save it in json format')
  .option('-q, --query <query>', 'evaluates the given SPARQL query')
  .option('-f, --file <file>', 'evaluates the SPARQL query in the given file')
  .option('-s, --size <page-size>', 'the number of triples per page (default: 100)', 100)
  .option('-o, --output <output>', 'save the model in the given file (default: model.json)', './model.json')
  .parse(process.argv);

// check number of endpoints
if (program.args.length < 1) {
  process.stderr.write('Error: you must specify at least one endpoint to compute the cost model.\nSee ./tpf-client model --help for more details.\n');
  process.exit(1);
}

// fetch SPARQL query to analyze
let query = null;
if (program.query) {
  query = program.query;
} else if (program.file && fs.existsSync(program.file)) {
  query = fs.readFileSync(program.file, 'utf-8');
} else {
  process.stderr.write('Error: you must specify a SPARQL query to analyze.\nSee ./tpf-client model --help for more details.\n');
  process.exit(1);
}

const client = new ldf.FragmentsClient(program.args[0], {});
const parser = new SparqlParser(prefixes);
const parsedQuery = parser.parse(query);
let latencies = [];

// find the latencies of the endpoints first, then the metadata of each triple in the query
Promise.all(program.args.map(measureResponseTime))
.then(times => {
  latencies = times.slice(0);
  return Promise.all(extractTriples(parsedQuery).map(t => findCardinality(t, client)));
})
.then(cardinalities => {
  // generate the cost model, and save it in a file
  const nbTriples = _.fromPairs(cardinalities);
  const model = computeModel(program.args, latencies, {nbTriples, triplesPerPage: program.size});
  model.coefficients['http://localhost:8000/watDiv_100'] = 1;
  model.coefficients['http://localhost:8001/watDiv_100'] = 2;
  model.sumCoefs = 3;
  fs.writeFile(program.output, JSON.stringify(model, false, 2), err => {
    if (err) {
      process.stderr.write(err);
      process.exit(1);
    }
    process.stdout.write(`Cost-model successfully computed and stored in ${program.output}\n`);
    process.exit(0);
  });
})
.catch(err => {
  process.stderr.write(err);
  process.exit(1);
});
