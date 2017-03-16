/* file : processor.js
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

const build = require('./builder.js');
const decompositions = require('./decompositions.js');
const localization = require('./localization.js');
const normalize = require('./normalizer.js');

/**
 * Process a SPARQL query, from a string representation to a physical execution plan
 * @param  {string} query - The SPARQl query to process
 * @param  {Object} endpoints - The endpoints used for localization
 * @return {AsyncIterator} The root of the physical query execution plan
 */
const processQuery = (query, endpoints) => {
  let q = normalize(query);
  let where = localization.localizeQuery(q.where[0], endpoints);
  where = decompositions.decomposeQuery(q);
  q.where = where;
  return build(q);
};

module.exports = processQuery;
