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
const ldf = require('../../Client.js/ldf-client.js');
const Cache = require('lru-cache');
const UnionStream = require('./union-stream.js');
const _ = require('lodash');
ldf.Logger.setLevel('DEBUG');

const buildMultiUnion = (plan, ldfConfig) => {
  return plan.where[0].patterns.map(pattern => {
    const newPlan = _.pickBy(plan, key => key !== 'where');
    newPlan.where = [ pattern ];
    return new ldf.SparqlIterator(newPlan, ldfConfig);
  });
};

/**
 * Build the physical query execution plan for a query, a set of endpoints and a cost model
 * @param {string} query            - The SPARQL query to process
 * @param {Object} endpoints        - The endpoints used for localization
 * @param {Object} model            - The cost model used for this execution
 * @param {Object|undefined} config - (optional) Additional configuration options for LDF FragmentsClients & SparqlIterator
 * @return {AsyncIterator} The root operator of the physical query execution plan
 */
const buildIterator = (query, endpoints, model, config = {}) => {
  const queryPlan = processor(query, endpoints, model.nbTriples, config.locLimit, config.usePeneloop, config.prefixes);
  // console.log(JSON.stringify(queryPlan, false, 2));
  config.sharedCache = new Cache({ max: 5000 });
  const defaultClient = new ldf.FragmentsClient(endpoints[0], config);
  // important: main cache must not be shared with the default client!
  config.mainCache = new Cache({ max: 1 });
  const virtualClients = {};
  endpoints.forEach(e => virtualClients[e] = new ldf.FragmentsClient(e, config));
  const ldfConfig = {
    fragmentsClient: defaultClient,
    virtualClients,
    model
  };
  // performance hack: transform a top level union into an union of SparqlIterors
  if (queryPlan.where.length === 1 && queryPlan.where[0].type === 'union')
    return new UnionStream(buildMultiUnion(queryPlan, ldfConfig));
  return new ldf.SparqlIterator(queryPlan, ldfConfig);
};

module.exports = buildIterator;
