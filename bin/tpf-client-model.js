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

/**
 * Measure the reponse time of a endpoint
 * @param  {string} url - The url of the endpoint
 * @return {Promise} A promise fullfilled with the reponse time of the endpoint (in milliseconds)
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

program
  .description('generate the cost model & save it in json format')
  .option('-o, --output <output>', 'save the model in the given file (default: model.json)', './model.json')
  .parse(process.argv);

// check number of endpoints
if (program.args.length < 1) {
  process.stderr.write('Error: you must specify at least one endpoint to compute the cost model.\nSee ./tpf-client model --help for more details.\n');
  process.exit(1);
}

// generate the cost model, then save it in a file
Promise.all(program.args.map(measureResponseTime))
.then(times => {
  const model = computeModel(program.args, times);
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
