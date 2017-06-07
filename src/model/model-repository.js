/* file : model-repository.js
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

const http = require('http');
const computeModel = require('./cost-model.js');
const Cache = require('lru-cache');
const _ = require('lodash');

/**
 * Extract all triples from a query
 * @param  {Object} query - The current node of the query
 * @return {Object[]} The triples of the query
 */
const extractTriples = query => {
  switch (query.type) {
    case 'bgp':
      return query.triples;
    case 'union':
    case 'group':
      return _.flatMap(query.patterns, p => extractTriples(p));
    case 'query':
      return _.flatMap(query.where, p => extractTriples(p));
    default:
      return [];
  }
};

/**
 * A ModelRepository give access to a cost-model with caching facilities between queries.
 * It also supports the introduction of bias in the generated models.
 * @author Thomas Minier
 */
class ModelRepository {
  /**
   * Constructor
   * @param  {FragmentsClient} fragmentClient - Fragment client used to measure cardinalities
   * @param  {Object} options - Options used to build the repository
   */
  constructor (fragmentClient, options) {
    this._fClient = fragmentClient;
    this._modelCache = options.modelCache || new Cache({ max: 500 });
    this._metadataCache = options.metaCache || new Cache({ max: 500 });
    this._bias = new Map();
  }

  /**
   * Indicates if the models have bias
   * @return {Boolean} True if the models have bias
   */
  get hasBias () {
    return this._bias.size() > 0;
  }

  /**
   * Set a fixed coefficient for a given TPF server
   * @param {string} endpoint    - The TPF server
   * @param {int} coefficient    - The fixed coefficient
   * @return {void}
   */
  setBias (endpoint, coefficient) {
    this._bias.set(endpoint, coefficient);
  }

  /**
   * Unset a fixed coefficient for a given TPF server
   * @param {string} endpoint    - The TPF server
   * @param {int} coefficient    - The fixed coefficient
   * @return {void}
   */
  unsetBias (endpoint, coefficient) {
    this._bias.delete(endpoint, coefficient);
  }

  /**
   * Apply biais on a model
   * @param  {Object} model - The model on which bias must be applied
   * @return {Object} The modified model
   */
  _applyBias (model) {
    this._bias.forEach((coef, endpoint) => {
      if (endpoint in model.coefficients) model.coefficients[endpoint] = coef;
    });
    return model;
  }

  /**
   * Fetch a cached model from the repository
   * @param  {string} key - The model key
   * @return {Model|undefined} The model from the cache, or undefined if not found
   */
  getCachedModel (key) {
    return this._modelCache.get(key);
  }

  /**
   * Compute a model for a query and a set of TPF servers
   * @param  {Object} query       - A query, normalized in the format of sparql.js
   * @param  {string[]} endpoints - A set of TPF servers
   * @param  {int} triplesPerPage - The number of triple patterns per page (default to 100)
   * @return {Promise} A promise fullfilled with the computed {@link Model}
   */
  getModel (query, endpoints, triplesPerPage = 100) {
    const cacheKey = `q=${JSON.stringify(query)}&${endpoints.sort().join('&')}`;
    const cachedModel = this._modelCache.get(cacheKey);
    if (cachedModel !== undefined) {
      return Promise.resolve(cachedModel);
    }
    let latencies = [];
    return Promise.all(endpoints.map(this.measureResponseTime))
    .then(times => {
      latencies = times.slice(0);
      return Promise.all(extractTriples(query).map(this.measureCardinality));
    })
    .then(cardinalities => {
      const nbTriples = _.fromPairs(cardinalities);
      let model = computeModel(endpoints, latencies, {nbTriples, triplesPerPage: triplesPerPage});
      model.id = cacheKey;
      if (this.hasBias) {
        model = this._applyBias(model);
        model.sumCoefs = _.keys(model.coefficients).reduce((acc, c) => acc + c, 0);
      }
      this._modelCache.set(cacheKey, model);
      return Promise.resolve(model);
    });
  }

  /**
   * Measure the reponse time of a TPF server
   * @param  {string} url - The url of the TPF server
   * @return {Promise} A Promise fullfilled with the reponse time of the TPF server (in milliseconds)
   */
  measureResponseTime (url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      http.get(url, res => {
        res.once('error', err => reject(err));
        res.once('end', () => {
          const endTime = Date.now();
          resolve(endTime - startTime);
        });
        res.resume();
      });
    });
  }

  /**
   * Measure the cardinality of a triple pattern
   * @param  {Object} triple  - The triple pattern
   * @return {Promise} A Promise fullfilled with a tuple (triple pattern, cardinality)
   */
  measureCardinality (triple) {
    const tripleKey = JSON.stringify(triple);
    const cachedMeta = this._metadataCache.get(tripleKey);
    if(cachedMeta !== undefined) {
      return Promise.resolve(cachedMeta);
    }
    return new Promise(resolve => {
      const fragment = this._fClient.getFragmentByPattern(triple);
      fragment.getProperty('metadata', metadata => {
        fragment.close();
        this._metadataCache.set(tripleKey, metadata);
        resolve([ tripleKey, metadata.totalTriples ]);
      });
    });
  }
}

module.exports = ModelRepository;
