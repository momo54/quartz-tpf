/* file : query-engine.js
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

const processor = require('./analyzer/processor.js');
const ldf = require('../Client.js/ldf-client.js');
const _ = require('lodash');
// load default config with common prefixes
const defaultConfig = require('../Client.js/config-default.json');
ldf.Logger.setLevel('EMERGENCY');

/**
 * Build the physical query execution plan for a query and a set of endpoints
 * @param {string} query            - The SPARQL query to process
 * @param {Object} endpoints        - The endpoints used for localization
 * @param {Object|undefined} config - (optional) Additional configuration options for LDF FragmentsClients & SparqlIterator
 * @return {AsyncIterator} The root of the physical query execution plan
 */
const buildIterator = (query, endpoints, config = defaultConfig) => {
  const queryPlan = processor(query, endpoints);
  const defaultClient = new ldf.FragmentsClient(endpoints[0], config);
  const virtualClients = {};
  endpoints.forEach(e => virtualClients[e] = new ldf.FragmentsClient(e, config));
  const options = _.merge({
    fragmentsClient: defaultClient,
    virtualClients
  }, config);
  return new ldf.SparqlIterator(queryPlan, options);
};

module.exports = buildIterator;
