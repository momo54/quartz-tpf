#!/usr/bin/env node
/* file : proxy.js
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
const url = require('url');
const HttpProxy = require('http-proxy');
const program = require('commander');
const _ = require('lodash');

const tripleEquals = (left, right) => {
  return (left.subject === right.subject) && (left.predicate === right.predicate) && (left.object === right.object);
};

program
  .description('deploy a reverse proxy to monitor a target HTTP server')
  .usage('<target> <model>')
  .option('-p, --port <port>', 'the port on which the reverse proxy will be running', 8000)
  .option('-o, --output <file>', 'the output file to store results', 'http-calls.csv')
  .option('-s, --start <name>', 'the name of the first query (start query) of the workload', 'query0')
  .option('-m, --minus <value>', 'value to substract from the final value', 0)
  .parse(process.argv);

if (program.args.length < 2) {
  process.stderr.write('Error: invalid number of arguments.\nSee ./proxy.js -h for usage\n');
  process.exit(1);
}

const proxyConfig = {
  target: program.args[0]
};

// load model & search for the the first triple pattern evaluated
if (!fs.existsSync(program.args[1])) {
  process.stderr.write('Error: invalid model supplied, no file found\n');
  process.exit(1);
}
const model = JSON.parse(fs.readFileSync(program.args[1], 'utf-8'));
let refTriple = null, min = Infinity;
_.forEach(model.nbTriples, (count, triple) => {
  if (count < min) {
    refTriple = JSON.parse(triple);
    min = count;
  }
});

// replace vars by undefined values
refTriple = _.mapValues(refTriple, v => {
  if (v.startsWith('?')) return undefined;
  return v;
});

let currentQuery = program.start.split('query')[1] || '0';
let httpCalls = 0, triple = {};
const proxy = HttpProxy.createProxyServer();
const proxyServer = http.createServer((req, res) => {
  if (!req.url.includes('move-to-query')) {
    triple = _.pick(url.parse(req.url, true).query, [ 'subject', 'predicate', 'object' ]);
    if (tripleEquals(refTriple, triple)) httpCalls++;
    proxy.web(req, res, proxyConfig);
  } else {
    // write results to file
    if (currentQuery !== '0') fs.appendFileSync(program.output, `${currentQuery},${httpCalls - program.minus},"${proxyConfig.target}"\n`);
    httpCalls = 0;
    // move to next query
    const query = url.parse(req.url, true);
    currentQuery = query.query.name.split('query')[1];
    process.stdout.write(`current results saved, moving to query ${currentQuery}\n`);
    res.end();
  }
});

if (fs.existsSync(program.output)) {
  process.stdout.write('Deleting previous results file\n');
  fs.unlinkSync(program.output);
}
fs.appendFileSync(program.output, 'query,calls,server\n');

process.stdout.write(`Reverse proxy up and running on port ${program.port}\n`);
proxyServer.listen(program.port);
