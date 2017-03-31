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
const Cache = require('lru-cache');
ldf.Logger.setLevel('EMERGENCY');

/**
 * Build the physical query execution plan for a query, a set of endpoints and a cost model
 * @param {string} query            - The SPARQL query to process
 * @param {Object} endpoints        - The endpoints used for localization
 * @param {Object} model            - The cost model used for this execution
 * @param {Object|undefined} config - (optional) Additional configuration options for LDF FragmentsClients & SparqlIterator
 * @return {AsyncIterator} The root of the physical query execution plan
 */
const buildIterator = (query, endpoints, model, config = defaultConfig) => {
  // Default config with common prefixes & all triples localized
  const defaultConfig = {
    prefixes: {},
    locLimit: 1,
    mainCache: new Cache({ max: 100 })
  };

  const queryPlan = processor(query, endpoints, model.nbTriples, config.locLimit, config.prefixes);
  const defaultClient = new ldf.FragmentsClient(endpoints[0], config);
  const virtualClients = {};
  endpoints.forEach(e => virtualClients[e] = new ldf.FragmentsClient(e, config));
  return new ldf.SparqlIterator(queryPlan, {
    fragmentsClient: defaultClient,
    virtualClients,
    model
  });
};

module.exports = buildIterator;
