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

program
  .description('deploy a reverse proxy to monitor a target HTTP server')
  .usage('<target>')
  .option('-p, --port <port>', 'the port on which the reverse proxy will be running', 8000)
  .option('-o, --output <file>', 'the output file to store results', 'http-calls.csv')
  .option('-s, --start <name>', 'the name of the first query (start query) of the workload', 'query1')
  .parse(process.argv);

if (program.args.length < 1) {
  process.stderr.write('Error: you must supply the target HTTP server url as an argument to this script.\nSee ./proxy.js -h for usage\n');
  process.exit(1);
}

const proxyConfig = {
  target: program.args[0]
};

let currentQuery = program.start;
let httpCalls = 0;
const proxy = HttpProxy.createProxyServer();
const proxyServer = http.createServer((req, res) => {
  if (!req.url.includes('move-to-query')) {
    httpCalls++;
    proxy.web(req, res, proxyConfig);
  } else {
    // write results to file
    fs.appendFileSync(program.output, `${currentQuery},${httpCalls},"${proxyConfig.target}"\n`);
    httpCalls = 0;
    // move to next query
    const query = url.parse(req.url, true);
    currentQuery = query.query.name;
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
