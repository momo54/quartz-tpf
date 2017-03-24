/* file : normalizer.js
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

const SparqlParser = require('sparqljs').Parser;
const _ = require('lodash');

/**
 * Inject triples patterns in each BGP of each union
 * @param  {Object} root      - The root node
 * @param  {Object[]} triples - The triples to inject
 * @return {Object} The union where the triples have been injected
 */
const injectTriples = (root, triples) => {
  switch (root.type) {
    case 'bgp':
      return {
        type: 'bgp',
        triples: root.triples.concat(triples)
      };
    case 'union':
      return {
        type: 'union',
        patterns: root.patterns.map(p => injectTriples(p, triples))
      };
    default:
      return root;
  }
};

/**
 * Parse a SPARQL query in string format using sparql.js, then normalize it using query rewriting
 * @param  {string} query     - A SPARQL query
 * @param  {Object} prefixes  - Additional prefixes to be used by the normalizer
 * @return {Object} A normalized representation of a SPARQL query
 */
const parseQuery = (query, prefixes = {}) => {
  const parser = new SparqlParser(prefixes);
  const parsedQuery = parser.parse(query);
  // Rewrite Group Graph Patterns to move down top-level triples patterns into each BGP of each union,
  // otherwise TPF will have trouble processing the query...
  if (_.some(parsedQuery.where, [ 'type', 'bgp' ]) && _.some(parsedQuery.where, [ 'type', 'union' ])) {
    const triples = _.flatMap(parsedQuery.where.filter(p => p.type === 'bgp'), p => p.triples);
    parsedQuery.where = parsedQuery.where.filter(p => p.type !== 'bgp').map(p => {
      if (p.type !== 'union') return p;
      return injectTriples(p, triples);
    });
  }
  return parsedQuery;
};

module.exports = parseQuery;
