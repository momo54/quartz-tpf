/* file : quartz-client.js
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

const SourceSelection = require('./source-selection/source-selection.js');
const ModelRepository = require('./model/model-repository.js');
const processor = require('./analyzer/processor.js');
const ldf = require('ldf-client');
const Cache = require('lru-cache');
const _ = require('lodash');
const prefixes = require('./prefixes.json'); // some very common prefixes
// ldf.Logger.setLevel('DEBUG');
ldf.Logger.setLevel('WARNING');

/**
 * A Quartz client is a TPF client modified to use Quartz parallel query processing techniques
 * @author Thomas Minier
 */
class QuartzClient {
  /**
   * Constructor
   * @param {string} baseServerURL                      - The URL of a TPF server which can be used to calibrate the cost model
   * @param {Object} options                            - Options used to customize the behaviour of the Quartz client
   * @param {int} [options.locLimit=1]                  - Maximum number of triples pattern to localized per BGP (default to 1)
   * @param {boolean} [options.usePeneloop=true]        - Whether to use PeNeLoop to process joins or use classic TPF join operator
   * @param {SourceSelection} options.sourceSelection   - An optional algorithm used to perform the source selection (by default, {@link SourceSelection})
   * @param {Object} options.prefixes                   - Additionnal prefixes used when parsing SPARQL queries & RDF data
   */
  constructor (baseServerURL, options) {
    this._options = _.merge({
      locLimit: 1,
      usePeneloop: true,
      sourceSelection: new SourceSelection(),
      prefixes
    }, options);
    this._defaultClient = new ldf.FragmentsClient(baseServerURL);
    this._modelRepo = new ModelRepository(this._defaultClient, options);
  }

  /**
   * Set an option of the client
   * @param {string} key   - The name of the option (currently supported: locLimit, usePeneloop, prefixes)
   * @param {*} value      - The new value for the option
   * @return {void}
   */
  setOption (key, value) {
    switch (key) {
      case 'locLimit':
        this._options.locLimit = value;
        break;
      case 'usePeneloop':
        this._options.usePeneloop = value;
        break;
      default:
        break;
    }
  }

  /**
   * Build a query execution plan
   * @param  {string} query       - The query to execute
   * @param  {string[]} servers - Set of TPF servers used to execute the query
   * @return {Object} The query execution plan for the given query and servers
   */
  buildPlan (query, servers) {
    return this._modelRepo.getModel(query, servers, this._options.sourceSelection)
    .then(model => {
      const plan = processor(query, servers, model._cardinalities, model._selection, this._options.locLimit, this._options.usePeneloop, this._options.prefixes);
      return Promise.resolve(_.merge({ modelID: model.id }, plan));
    });
  }

  /**
   * Execute a query execution plan
   * @param  {Object}  queryPlan        - The query execution plan
   * @param  {Boolean} [asPromise=true] - True to return a Promise, False to return a classic LDF SparqlIterator
   * @param  {Object}  config           - Optional base configuration to build FragmentsClients
   * @return {Promise|SparqlIterator} A Promise fullfilled with the complete results or a LDF SparqlIterator for on-demand results
   */
  executePlan (queryPlan, asPromise = true, config = { prefixes }) {
    let iterator;
    const model = this._modelRepo.getCachedModel(queryPlan.modelID);
    if (model === undefined) throw new Error('Cannot find the compiled model associated with the query.');

    config.sharedCache = new Cache({ max: 5000 });
    const defaultClient = new ldf.FragmentsClient(model._servers[0], config);
    // important: main cache must not be shared with the default client!
    config.mainCache = new Cache({ max: 100 });
    const virtualClients = {};
    model._servers.forEach(e => virtualClients[e] = new ldf.FragmentsClient(e, config));
    const ldfConfig = {
      fragmentsClient: defaultClient,
      virtualClients,
      model
    };
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
   * @param  {string} query       - The query to execute
   * @param  {string[]} servers - Set of TPF servers used to execute the query
   * @param  {Object}  config     - Optional base configuration to build FragmentsClients
   * @return {Promise} A Promise fullfilled with the complete results
   */
  execute (query, servers, config = { prefixes }) {
    return this.buildPlan(query, servers).then(plan => this.executePlan(plan, true, config));
  }
}

module.exports = QuartzClient;
