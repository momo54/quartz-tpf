/* file : builder.js
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

const BasicGraphPatternOperator = require('../operators/basic-graph-pattern-operator.js');
const DistinctOperator = require('../operators/distinct-operator.js');
const SelectOperator = require('../operators/select-operator.js');
const TripleOperator = require('../operators/triple-operator.js');
const UnionOperator = require('../operators/union-operator.js');
const FragmentFactory = require('../fragments/fragment-factory.js');
const LDFPage = require('../fragments/ldf-page.js');

const patternToKey = pattern => {
  return JSON.stringify(pattern);
};

/**
 * Build a physical query execution plan from a logical query execution plan
 * @param  {Object} queryPlan - The logical query execution plan used to build the query
 * @param {string[]} endpoints - All the endpoints involved in the query
 * @param {LRU} cache - The cache used to cache items
 * @param {*} http - The HTTP client used to perform HTTP requests
 * @return {Promise} A Promise resolvd with the root iterator of the physical query execution plan
 */
const buildPlan = (queryPlan, endpoints, cache, http) => {
  const factories = {};
  const metadata = {}; // see FIXME in analyzePlan
  endpoints.forEach(e => factories[e] = new FragmentFactory(e, cache, http));

  // analyze most of the query plan located in the where clause
  let operator = analyzePlan(queryPlan.where, factories, metadata);

  // apply distinct modifier
  if (queryPlan.distinct) operator = new DistinctOperator(operator);

  // apply eventual offset & limit
  if (queryPlan.offset !== undefined && queryPlan.offset > 0)
    operator = operator.skip(queryPlan.offset);

  if (queryPlan.limit !== undefined && queryPlan.limit > -1)
    operator = operator.take(queryPlan.limit);

  // apply query type (select, ask, ...)
  switch (queryPlan.queryType.toLowerCase()) {
    case 'select': {
      operator = new SelectOperator(operator, queryPlan.variables);
      break;
    }
    default:
      throw new SyntaxError(`Unsupported query type: ${queryPlan.queryType.toLowerCase()}`);
  }
  return operator;
};

/**
 * Recursively analyze the current node of the query execution plan and build the associated physical operator
 * @param  {Object} queryNode - The current node to analyze
 * @param  {Object} factories - Fragment factories, index by their associated endpoint
 * @param {Object} metadata - Metadata associated with each triple pattern
 * @return {AsyncIterator} The itrerator created by the evaluation of the node
 */
const analyzePlan = (queryNode, factories, metadata) => {
  let operator = null;
  switch (queryNode.type.toLowerCase()) {
    case 'bgp': {
      // resolve BGP with one triple pattern with a dedicated operator
      // FIXME: using the triple operator required to have the metadata avialable at this time (but async nightmare here...)
      // Let Basic Graph Pattern Operator handle this ?
      if (queryNode.triples.length === 1) {
        const triple = queryNode.triples[0];
        const fragment = factories[triple.fragment.endpoint].getVirtual(triple, metadata[patternToKey(triple)]);
        operator = new TripleOperator(fragment, triple);
      } else {
        // otherwise, use a Basic Graph Pattern Operator
        // TODO ...
        operator = new BasicGraphPatternOperator();
      }
      break;
    }
    case 'union': {
      const sources = queryNode.patterns.map(p => analyzePlan(p, factories, metadata));
      operator = new UnionOperator(...sources);
      break;
    }
    default:
      throw new SyntaxError(`Unsupported query node type: ${queryNode.type.toLowerCase()}`);
  }
  return operator;
};

module.exports = buildPlan;
