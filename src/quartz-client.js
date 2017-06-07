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

const ModelRepository = require('./model/model-repository.js');
const processor = require('./analyzer/processor.js');
const ldf = require('../Client.js/ldf-client.js');
const UnionStream = require('./union-stream.js');
const Cache = require('lru-cache');
const _ = require('lodash');
// ldf.Logger.setLevel('DEBUG');
ldf.Logger.setLevel('WARNING');

const buildMultiUnion = (plan, ldfConfig) => {
  return plan.where[0].patterns.map(pattern => {
    const newPlan = _.pickBy(plan, key => key !== 'where');
    newPlan.where = [ pattern ];
    return new ldf.SparqlIterator(newPlan, ldfConfig);
  });
};

/**
 * A Quartz client is a TPF client modified to use Quartz parallel query processing techniques
 * @author Thomas Minier
 */
class QuartzClient {
  /**
   * Constructor
   */
  constructor () {
    this._modelRepo = new ModelRepository(this._defaultClient, {});
  }

  /**
   * Build a query execution plan
   * @param  {string} query       - The query to execute
   * @param  {string[]} endpoints - Set of TPF servers used to execute the query
   * @param  {Object} options     - Options used to customize plan construction
   * @return {Object} The query execution plan for the given query and endpoints
   */
  buildPlan (query, endpoints, options) {
    const model = options.model || this._modelRepo.getModel(query, endpoints, options.triplesPerPage);
    const plan = processor(query, endpoints, model.nbTriples, options.locLimit || 1, options.usePeneloop || true, options.prefixes || {});
    plan.modelId = model.id;
    return plan;
  }

  /**
   * Execute a query execution plan
   * @param  {Object}  queryPlan        - The query execution plan
   * @param  {Boolean} [asPromise=true] - True to return a Promise, False to return a classic LDF SparqlIterator
   * @param  {Object}  [config={}]      - Optional base configuration to build FragmentsClients
   * @return {Promise|SparqlIterator}   - A Promise fullfilled with the complete results or a LDF SparqlIterator for on-demand results
   */
  executePlan (queryPlan, asPromise = true, config = {}) {
    let iterator;
    const model = this._modelRepo.getCachedModel(queryPlan.modelId);
    config.sharedCache = new Cache({ max: 5000 });
    const defaultClient = new ldf.FragmentsClient(model._endpoints[0], config);
    // important: main cache must not be shared with the default client!
    config.mainCache = new Cache({ max: 1 });
    const virtualClients = {};
    model._endpoints.forEach(e => virtualClients[e] = new ldf.FragmentsClient(e, config));
    const ldfConfig = {
      fragmentsClient: defaultClient,
      virtualClients,
      model
    };
    // performance hack: transform a top level union into an union of SparqlIterors
    if (queryPlan.where.length === 1 && queryPlan.where[0].type === 'union')
      iterator = new UnionStream(buildMultiUnion(queryPlan, ldfConfig));
    iterator = new ldf.SparqlIterator(queryPlan, ldfConfig);

    if (!asPromise) return iterator;
    return new Promise((resolve, reject) => {
      const acc = [];
      iterator.on('error', err => reject(err));
      iterator.on('end', () => resolve(acc));
      iterator.on('data', mappings => acc.push(mappings));
    });
  }

  /**
   * Execute a query
   * @param  {string} query             - The query to execute
   * @param  {string[]} endpoints       - Set of TPF servers used to execute the query
   * @param  {Boolean} [asPromise=true] - True to return a Promise, False to return a classic LDF SparqlIterator
   * @param  {Object}  [config={}]      - Optional base configuration to build FragmentsClients
   * @return {Promise|SparqlIterator}   - A Promise fullfilled with the complete results or a LDF SparqlIterator for on-demand results
   */
  execute (query, endpoints, asPromise = true, config = {}) {
    return this.executePlan(this.buildPlan(query, endpoints), asPromise, config);
  }
}

module.exports = QuartzClient;
