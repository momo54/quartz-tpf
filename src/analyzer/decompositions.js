/* file : decompositions.js
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

// Merge two arrays when using _.mergeWith
const mergeArray = (target, src) => {
  if (_.isArray(target)) return target.concat(src);
};

/**
 * Apply join reduction on a BGP which contains at least one union
 * @param  {Object} bgp - The BGP to decompose
 * @return {Object} The decomposed BGP
 */
const joinDistribution = bgp => {
  let patterns = [ { type: 'bgp', triples: [] } ];

  // no union found in the bgp
  if (! _.some(bgp.triples, [ 'type', 'union' ])) return bgp;

  // decompose each union we found
  bgp.triples.forEach(tp => {
    if ('type' in tp && tp.type === 'union') {
      patterns = _.flatMap(tp.patterns, unionPattern => {
        return patterns.map(pattern => {
          return _.mergeWith({ triples: [ unionPattern ] }, pattern, mergeArray);
        });
      });
    } else {
      patterns.forEach(p => p.triples.push(tp));
    }
  });
  return {
    type: 'union',
    patterns,
  };
};

// TODO

/**
 * Recursively decompose each part of a query
 * @param  {Object} node - A SPARQL node to decompose
 * @return {Object} The decomposed query
 */
const decomposeQuery = node  => {
  const type = node.type.toLowerCase();
  switch (type) {
    case 'bgp':
      return joinDistribution(node);
    case 'query': {
      const query = _.merge({}, node);
      query.where = query.where.map(p => decomposeQuery(p));
      return query;
    }
    case 'union':
    case 'group':
    case 'optional':
      return {
        type,
        patterns: node.patterns.map(p => decomposeQuery(p))
      };
    case 'filter':
      return node;
    default:
      throw new SyntaxError(`Unsupported type during decomposition: ${node.type.toLowerCase()}`);
  }
};

module.exports = {
  joinDistribution,
  decomposeQuery
};
