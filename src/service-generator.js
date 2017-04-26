/* file : service-generator.js
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

const formulas = require('./analyzer/formulas.js');
const rdf = require('../Client.js/lib/util/RdfUtil.js');
const _ = require('lodash');

// sort patterns with the same algorithm used by TPF + sort triple by number of variables
const sortPatterns = (pattern, cardinalities) => _.sortBy(rdf.findConnectedPatterns(pattern), patterns => {
  const distinctVariableCount = _.union.apply(_, patterns.map(rdf.getVariables)).length;
  return -(pattern.length * distinctVariableCount + patterns.length);
}).map(patterns => _.sortBy(patterns, pattern => cardinalities[JSON.stringify(pattern)] || Infinity));

/**
 * Build a SPARQL service subquery
 * @param  {Object} triple    - The unique triple pattern of the subquery
 * @param  {string} endpoint  - The endpoint of the service query
 * @param  {Object} stats     - Metadata about the triple pattern to localize
 * @return {Object} The related SPARQL service subquery
 */
const buildService = (triple, endpoint, stats) => {
  let limit = formulas.computeLimit(stats.totalTriples, stats.index, stats.nbVirtuals, stats.coef, stats.sumCoefs);
  const offset = formulas.computeOffset(stats.totalTriples, stats.index, stats.nbVirtuals, stats.coef, stats.sumCoefs);
  if (limit === stats.totalTriples || limit <= -1)
    limit = undefined;
  return {
    type: 'service',
    name: endpoint + '/query',
    silent: false,
    patterns: [
      {
        type: 'query',
        queryType: 'SELECT',
        limit,
        offset,
        variables: [ '*' ],
        where: [
          {
            type: 'bgp',
            triples: [ _.merge({}, triple) ]
          }
        ]
      }
    ]
  };
};

const localizeService = (bgp, endpoints, model) => {
  const triples = _.flatten(sortPatterns(bgp.triples, model.nbTriples));
  const stats = {
    totalTriples: model.nbTriples[JSON.stringify(triples[0])],
    nbVirtuals: _.values(model.coefficients).length,
    coef: _.values(model.coefficients),
    sumCoefs: model.sumCoefs
  };
  if (stats.totalTriples === 1)
    return bgp;
  if (triples.length === 1)
    return {
      type: 'union',
      patterns: [
        {
          type: 'group',
          patterns: [
            buildService(triples[0], endpoints[1], _.merge({index: 1}, stats)),
            {
              type: 'bgp',
              triples: triples.slice(1)
            }
          ]
        },
        {
          type: 'bgp',
          triples: triples
        }
      ]
    };
  return {
    type: 'union',
    patterns: [
      {
        type: 'group',
        patterns: [
          buildService(triples[0], endpoints[1], _.merge({index: 1}, stats)),
          {
            type: 'bgp',
            triples: triples.slice(1)
          }
        ]
      },
      {
        type: 'group',
        patterns: [
          buildService(triples[0], endpoints[1], _.merge({index: 2}, stats)),
          {
            type: 'bgp',
            triples: triples.slice(1)
          }
        ]
      }
    ]
  };
};

const generateService = (node, endpoints, model) => {
  const type = node.type.toLowerCase();
  switch (type) {
    case 'bgp':
      return localizeService(node, endpoints, model);
    case 'query': {
      const query = _.merge({}, node);
      query.where = _.flatten(query.where.map(p => generateService(p, endpoints, model)));
      return query;
    }
    case 'union':
    case 'group':
    case 'optional':
      return {
        type,
        patterns: node.patterns.map(p => generateService(p, endpoints, model))
      };
    case 'filter':
      return node;
    default:
      throw new SyntaxError(`Unsupported type during generation: ${node.type.toLowerCase()}`);
  }
};

module.exports = generateService;
