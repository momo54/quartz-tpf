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
const Model = require('./model.js');
const Cache = require('lru-cache');
const SparqlParser = require('sparqljs').Parser;
const URL = require('url');
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
  constructor (fragmentClient, options = {}) {
    this._fClient = fragmentClient;
    this._modelCache = options.modelCache || new Cache({ max: 500 });
    this._metadataCache = options.metaCache || new Cache({ max: 500 });
    this._bias = new Map();
    this._parser = new SparqlParser();
  }

  /**
   * Indicates if the models have bias
   * @return {Boolean} True if the models have bias
   */
  get hasBias () {
    return this._bias.size > 0;
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
   * @private
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
   * @param  {Object} query             - A query, normalized in the format of sparql.js
   * @param  {string[]} servers       - A set of TPF servers
   * @return {Promise} A promise fullfilled with the computed {@link Model}
   */
  getModel (query, servers) {
    const cacheKey = Model.genID(query, servers);
    const cachedModel = this._modelCache.get(cacheKey);
    if (cachedModel !== undefined) {
      return Promise.resolve(cachedModel);
    }
    let latencies = [];
    let triplesPerPage = {};
    const triples = extractTriples(this._parser.parse(query));
    return Promise.all(servers.map(e => this._measureResponseTime(e)))
    .then(timesAndTriples => {
      latencies = timesAndTriples.map(v => v[0]);
      triplesPerPage = _.zipObject(servers, timesAndTriples.map(v => v[1]));
      return Promise.all(triples.map(t => this._measureCardinality(t)));
    })
    .then(cardinalities => {
      const nbTriples = _.fromPairs(cardinalities);
      let model = new Model(query, servers, latencies, nbTriples, triplesPerPage);
      if (this.hasBias) {
        model = this._applyBias(model);
        model.sumCoefs = _.keys(model.coefficients).reduce((acc, c) => acc + c, 0);
      }
      this._modelCache.set(cacheKey, model);
      return Promise.resolve(model);
    });
  }

  /**
   * Measure the reponse time and the number of triples served per page of a TPF server
   * @param  {string} url - The url of the TPF server
   * @return {Promise} A Promise fullfilled with a tuple (reponse time, triples per page) of the TPF server (time in milliseconds)
   */
  _measureResponseTime (url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let triplesPerPage = 100; // default value for most TPF server
      const newUrl = URL.parse(url);
      const httpOptions = {
        hostname: newUrl.hostname,
        port: newUrl.port,
        path: newUrl.path,
        headers: {
          accept: 'text/turtle'
        }
      };
      http.get(httpOptions, res => {
        res.once('error', err => reject(err));
        res.once('end', () => {
          const endTime = Date.now();
          resolve([ endTime - startTime, triplesPerPage ]);
        });
        res.on('data', x => {
          triplesPerPage = parseInt(x.toString('utf-8').match(/hydra:itemsPerPage "(.*)"\^\^xsd:integer/)[1] || '-1');
        });
      });
    });
  }

  /**
   * Measure the cardinality of a triple pattern
   * @param  {Object} triple  - The triple pattern
   * @return {Promise} A Promise fullfilled with a tuple (triple pattern, cardinality)
   */
  _measureCardinality (triple) {
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
