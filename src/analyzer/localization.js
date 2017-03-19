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

const _ = require('lodash');

/**
 * Build a SPARQL service subquery
 * @param  {Object} triple    - The unique triple pattern of the subquery
 * @param  {string} endpoint  - The endpoint of the service query
 * @param  {int} virtualIndex - The index of the current virtual fragment
 * @param  {int} nbVirtuals   - The total number of virtual fragments
 * @return {Object} The related SPARQL service subquery
 */
const buildService = (triple, endpoint, virtualIndex, nbVirtuals) => {
  return {
    type: 'service',
    name: endpoint,
    queryType: 'SELECT',
    silent: false,
    virtualIndex,
    nbVirtuals,
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
 * @param  {Object} triple - A triple pattern to localize
 * @param  {Object} endpoints - The endpoints used for localization
 * @return {Object} The localized triple
 */
const localizeTriple = (triple, endpoints) => {
  if (endpoints.length === 1) return _.merge({
    fragment: {
      endpoint: endpoints[0],
      virtualIndex: 1,
      nbVirtuals: 1
    }
  }, triple);

  return {
    type: 'union',
    patterns: _.map(endpoints, (endpoint, i) => _.merge({
      fragment: {
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
 * @param  {Object} triple - A triple pattern to localize
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
 * @param  {Object} bgp - A BGP to localize
 * @param  {Object} endpoints - The endpoints used for localization
 * @return {Object} The localized BGP
 */
const localizeBGP = (bgp, endpoints) => {
  return {
    type: 'bgp',
    triples: bgp.triples.map(tp => localizeTriple(tp, endpoints))
  };
};

/**
 * Recursively perform localization on each BGP of a query
 * @param  {Object} node - A SPARQL node to localize
 * @param  {Object} endpoints - The endpoints used for localization
 * @return {Object} The localized query
 */
const localizeQuery = (node, endpoints) => {
  const type = node.type.toLowerCase();
  switch (type) {
    case 'bgp':
      return localizeBGP(node, endpoints);
    case 'query': {
      const query = _.merge({}, node);
      query.where = query.where.map(p => localizeQuery(p, endpoints));
      return query;
    }
    case 'union':
    case 'group':
    case 'optional':
      return {
        type,
        patterns: node.patterns.map(p => localizeQuery(p, endpoints))
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
