#!/usr/bin/env node
/* file : quartz.js
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
const QuartzClient = require('../src/quartz-client.js');

// Command line interface to execute queries
program
  .description('execute a SPARQL query against several servers')
  .usage('<servers...> [options]')
  .option('-p, --peneloop', 'use peneloop to process joins', true)
  .option('-q, --query <query>', 'evaluates the given SPARQL query')
  .option('-f, --file <file>', 'evaluates the SPARQL query in the given file')
  .option('-l, --limit <limit>', 'limit the number of triples to localize per BGP in the query (default to 1)', 1)
  .option('-t, --type <mime-type>', 'determines the MIME type of the output (e.g., application/json)', 'application/json')
  .option('-m, --measure <output>', 'measure the query execution time (in seconds) & append it to a file', './execution_times.csv')
  .option('-s, --silent', 'do not perform any measurement (silent mode)', false)
  .parse(process.argv);

// get servers
if (program.args.length <= 0) {
  process.stderr.write('Error: you must specify at least one TPF server to use.\nSee quartz --help for more details.\n');
  process.exit(1);
}
const servers = program.args;

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
  usePeneloop: program.peneloop !== undefined,
  locLimit: (program.limit !== undefined) ? parseInt(program.limit) : 1
};

const client = new QuartzClient(servers[0], config);
client._modelRepo.setBias('http://localhost:8001/watDiv_100', 2);
client.buildPlan(query, servers)
.then(plan => {
  const sparqlIterator = client.executePlan(plan, false);
  sparqlIterator.on('error', error => {
    process.stderr.write('ERROR: An error occurred during query execution.\n');
    process.stderr.write(error.stack);
  });
  if (!program.silent) {
    sparqlIterator.on('end', () => {
      const endTime = Date.now();
      const time = endTime - startTime;
      fs.appendFileSync(program.measure, (time/1000) + '\n');
    });
  }
  const startTime = Date.now();
  sparqlIterator.on('data', data => process.stdout.write(JSON.stringify(data) + '\n'));
})
.catch(error => process.stderr.write(`${error.stack}\n`));
