/* file : localization.js
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

const formulas = require('../model/formulas.js');
const sortPatterns = require('./join-ordering.js');
const _ = require('lodash');

/**
 * Find the relevant sources for a triple pattern in a source selection
 * @param  {Object} triple                - A triple pattern
 * @param  {Object} sourceSelection       - The corresponding source selection
 * @param  {string|string[]} defaultValue - Default value if no source selection is found
 * @return {string|string[]} the relevant sources for the triple pattern in the source selection
 */
const relevantSources = (triple, sourceSelection, defaultValue) => {
  const key = JSON.stringify(triple);
  if (key in sourceSelection)
    return sourceSelection[key];
  return defaultValue;
};

/**
 * Build a SPARQL service subquery
 * @param  {Object} triple    - The unique triple pattern of the subquery
 * @param  {string} endpoint  - The endpoint of the service query
 * @param  {Object} stats     - Metadata about the triple pattern to localize
 * @return {Object} The related SPARQL service subquery
 */
const buildService = (triple, endpoint, stats) => {
  return {
    type: 'service',
    name: endpoint,
    queryType: 'SELECT',
    silent: false,
    limit: formulas.computeLimit(stats.totalTriples, stats.index, stats.nbVirtuals, stats.coef, stats.sumCoefs),
    offset: formulas.computeOffset(stats.totalTriples, stats.index, stats.nbVirtuals, stats.coef, stats.sumCoefs),
    variables: [ '*' ],
    where: [
      {
        type: 'bgp',
        triples: [ _.merge({}, triple) ]
      }
    ]
  };
};

/**
 * Perform localization of a triple pattern, i.e. if the relation is fragmented, creates an union with all fragments
 * @param  {Object} triple    - A triple pattern to localize
 * @param  {Object} endpoints - The endpoints used for localization
 * @return {Object} The localized triple
 */
const localizeTriple = (triple, endpoints) => {
  if (endpoints.length === 1) return _.merge({
    operator: {
      type: 'classic',
      endpoint: endpoints[0]
    }
  }, triple);

  return {
    type: 'union',
    patterns: _.map(endpoints, (endpoint, i) => _.merge({
      operator: {
        type: 'vtp',
        endpoint,
        virtualIndex: i + 1,
        nbVirtuals: endpoints.length
      }
    }, triple))
  };
};

/**
 * Perform localization of a triple pattern, i.e. if the relation is fragmented, creates an union with all fragments.
 * Localize triple patterns into SPARQL service subqueries.
 * @param  {Object} triple    - A triple pattern to localize
 * @param  {Object} endpoints - The endpoints used for localization
 * @return {Object} The localized triple
 */
const localizeService = (triple, endpoints) => {
  if (endpoints.length === 1) return triple;

  return {
    type: 'union',
    patterns: _.map(endpoints, (endpoint, i) => buildService(triple, endpoint, i + 1, endpoints.length))
  };
};

/**
 * Perform localization on each triple pattern of a BGP
 * @param  {Object} bgp            - A BGP to localize
 * @param  {Object} endpoints      - The endpoints used for localization
 * @param  {Object} cardinalities  - The cardinality associated with each triple pattern of the BGP
 * @param  {int} limit             - The maximum number of triples to localize in the BGP (default to all triples)
 * @param  {boolean} usePeneloop   - Use peneloop to process joins if set to True
 * @param  {Object} sourceSelection - The source selection for this query
 * @return {Object} The localized BGP
 */
const localizeBGP = (bgp, endpoints, cardinalities = {}, limit = -1, usePeneloop = true, sourceSelection = {}) => {
  // sort triples like TPF does, to ensure the order of the localized triples match the order in which TPF execute triples
  let triples = _.flattenDeep(sortPatterns(bgp.triples, cardinalities));
  const cardFirstTriple = cardinalities[JSON.stringify(triples[0])];
  if (cardFirstTriple > 1) {
    if (limit > 0) {
      const localized = triples.slice(0, limit).map(tp => localizeTriple(tp, relevantSources(tp, sourceSelection, endpoints)));
      triples = localized.concat(triples.slice(limit).map(tp => _.merge({
        operator: {
          type: (usePeneloop ? 'peneloop' : 'classic'),
          endpoints: relevantSources(tp, sourceSelection, endpoints)
        }
      }, tp)));
    } else if (limit === -1) {
      triples = triples.map(tp => localizeTriple(tp, relevantSources(tp, sourceSelection, endpoints)));
    }
  }

  if ((limit === 0 || cardFirstTriple === 1) && usePeneloop) {
    triples = triples.map(tp => _.merge({
      operator: {
        type: 'peneloop',
        endpoints: relevantSources(tp, sourceSelection, endpoints)
      }
    }, tp));
  }
  return {
    type: 'bgp',
    triples
  };
};

/**
 * Recursively perform localization on each BGP of a query
 * @param  {Object} node      - A SPARQL node to localize
 * @param  {Object} endpoints - The endpoints used for localization
 * @param  {Object} cardinalities  - The cardinality associated with each triple pattern of the BGP
 * @param  {Object} sourceSelection - The source selection for this query
 * @param  {int} limit        - The maximum number of triples to localize in each BGP (default to all triples)
 * @param  {boolean} usePeneloop   - Use peneloop to process joins if set to True
 * @return {Object} The localized query
 */
const localizeQuery = (node, endpoints, cardinalities = {}, sourceSelection = {}, limit = 0, usePeneloop = true) => {
  const type = node.type.toLowerCase();
  switch (type) {
    case 'bgp':
      return localizeBGP(node, endpoints, cardinalities, limit, usePeneloop, sourceSelection);
    case 'query': {
      const query = _.merge({}, node);
      query.where = query.where.map(p => localizeQuery(p, endpoints, cardinalities, sourceSelection, limit, usePeneloop));
      return query;
    }
    case 'union':
    case 'group':
    case 'optional':
      return {
        type,
        patterns: node.patterns.map(p => localizeQuery(p, endpoints, cardinalities, sourceSelection, limit, usePeneloop))
      };
    case 'filter':
      return node;
    default:
      throw new SyntaxError(`Unsupported type during localization: ${node.type.toLowerCase()}`);
  }
};

module.exports = {
  localizeTriple,
	localizeService,
  localizeBGP,
  localizeQuery
};
