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
 * Perform localization of a triple pattern, i.e. if the relation is fragmented, creates an union with all fragments
 * @param  {Object} triple - A triple pattern to localize
 * @param  {Object} catalog - The localization catalog
 * @return {Object} The localized triple
 */
const localizeTriple = (triple, catalog) => {
  const key = `s=${triple.subject}&p=${triple.predicate}&o=${triple.object}`;
  if (key in catalog) {
    return {
      type: 'union',
      patterns: catalog[key].map(fragment => _.merge({ fragment }, triple))
    };
  }
  return _.merge({ fragment: catalog.default }, triple);
};

/**
 * Perform localization on each triple pattern of a BGP
 * @param  {Object} bgp - A BGP to localize
 * @param  {Object} catalog - The localization catalog
 * @return {Object} The localized BGP
 */
const localizeBGP = (bgp, catalog) => {
  return {
    type: 'bgp',
    triples: bgp.triples.map(tp => localizeTriple(tp, catalog))
  };
};

module.exports = {
  localizeTriple,
  localizeBGP
};
