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

  patterns = patterns.map(p => {
    // do nothing without localization informations
    if (! ('fragment' in p.triples[0]))
      return p;
    const endpoint = _.find(p.triples, obj => 'endpoint' in obj.fragment).fragment.endpoint;
    return {
      type: 'bgp',
      triples: p.triples.map(triple => {
        if (triple.operator === 'classic')
          triple.operator.endpoint = endpoint;
        return triple;
      })
    };
  });
  return {
    type: 'union',
    patterns
  };
};

/**
 * Flatten an union of unions
 * @param  {Object} union - The union to flatten
 * @return {Object} The flattened union
 */
const flattenUnion = union => {
  // can only flatten an union where all patterns are also unions
  if(! _.every(union.patterns, pattern => 'type' in pattern && pattern.type === 'union')) return union;

  return {
    type: 'union',
    patterns: _.flatMap(union.patterns, pattern => pattern.patterns)
  };
};

/**
 * Transform a optional of unions into a set of optional
 * @param  {Object} optional - The optional clause to transform
 * @return {Object|Object[]} A set of optionals
 */
const flattenOptional = optional => {
  // can only flatten an optional where all patterns are unions
  if(! _.every(optional.patterns, pattern => 'type' in pattern && pattern.type === 'union')) return optional;

  return _.flatMap(optional.patterns, union => {
    return union.patterns.map(p => {
      return {
        type: 'optional',
        patterns: [ p ]
      };
    });
  });
};

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
      query.where = _.flatMap(query.where, p => decomposeQuery(p));
      return query;
    }
    case 'union':
      return flattenUnion({
        type,
        patterns: node.patterns.map(p => decomposeQuery(p))
      });
    case 'group':
      return {
        type,
        patterns: _.flatMap(node.patterns, p => decomposeQuery(p))
      };
    case 'optional':
      return flattenOptional({
        type,
        patterns: node.patterns.map(p => decomposeQuery(p))
      });
    case 'filter':
      return node;
    default:
      throw new SyntaxError(`Unsupported type during decomposition: ${node.type.toLowerCase()}`);
  }
};

module.exports = {
  joinDistribution,
  flattenUnion,
  flattenOptional,
  decomposeQuery
};
