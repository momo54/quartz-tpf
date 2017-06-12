#!/usr/bin/env node
/* file : reference.js
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
const ldf = require('ldf-client');
const prefixes = require('ldf-client/config-default.json').prefixes;
ldf.Logger.setLevel('EMERGENCY');

// Command line interface to execute queries
program
  .description('execute a SPARQL query using reference TPF client')
  .usage('<endpoint>')
  .option('-q, --query <query>', 'evaluates the given SPARQL query')
  .option('-f, --file <file>', 'evaluates the SPARQL query in the given file')
  .option('-m, --measure <output>', 'measure the query execution time (in seconds) & append it to a file', './execution_times_ref.csv')
  .option('-s, --silent', 'measure the query execution time (in seconds) & append it to a file', false)
  .parse(process.argv);

// check number of endpoints
if (program.args.length <= 0) {
  process.stderr.write('Error: invalid number of arguments.\nSee ./reference --help for more details.\n');
  process.exit(1);
}

// fetch SPARQL query to execute
let query = null;
if (program.query) {
  query = program.query;
} else if (program.file && fs.existsSync(program.file)) {
  query = fs.readFileSync(program.file, 'utf-8');
} else {
  process.stderr.write('Error: you must specify a SPARQL query to execute.\nSee ./reference --help for more details.\n');
  process.exit(1);
}

const config = {
  prefixes
};

const fragmentsClient = new ldf.FragmentsClient(program.args[0], config);
const iterator = new ldf.SparqlIterator(query, { fragmentsClient });
iterator.on('error', error => {
  process.stderr.write('ERROR: An error occurred during query execution.\n');
  process.stderr.write(error.stack);
});
if (!program.silent) {
  iterator.on('end', () => {
    const endTime = Date.now();
    const time = endTime - startTime;
    fs.appendFileSync(program.measure, (time/1000) + '\n');
  });
}
const startTime = Date.now();
iterator.on('data', data => process.stdout.write(JSON.stringify(data) + '\n'));
