/* file : tpf-client-run.js
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
const queryEngine = require('../src/query-engine.js');
const ldf = require('../Client.js/ldf-client.js');
const prefixes = require('../Client.js/config-default.json').prefixes;

// Command line interface to execute queries
program
  .description('execute a SPARQL query against several endpoints')
  .option('-q, --query <query>', 'evaluates the given SPARQL query')
  .option('-f, --file <file>', 'evaluates the SPARQL query in the given file')
  .option('-l, --limit <limit>', 'limit the number of triples to localize per BGP in the query (default to 1)', 1)
  .option('-t, --type <mime-type>', 'determines the MIME type of the output (e.g., application/json)', 'application/json')
  .parse(process.argv);

// check number of endpoints
if (program.args.length < 1) {
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

// build configuration for the query analyzer
const config = {
  prefixes,
  locLimit: program.limit
};

const sparqlIterator = queryEngine(query, program.args.slice(1), model, config);
const writer = ldf.SparqlResultWriter.instantiate(program.type, sparqlIterator);
writer.on('data', data => process.stdout.write(data));
writer.on('error', error => {
  process.stderr.write('ERROR: An error occurred during query execution.\n');
  process.stderr.write(error.stack);
});
