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

const decompositions = require('./decompositions.js');
const localization = require('./localization.js');
const normalize = require('./normalizer.js');

/**
 * Process a SPARQL query, from a string representation to a logical query execution plan
 * @param  {string} query     - The SPARQL query to process
 * @param  {Object} endpoints - The endpoints used for localization
 * @param  {Object} cardinalities  - The cardinality associated with each triple pattern of the BGP
 * @param  {Object} sourceSelection - The source selection for this query
 * @param  {int}    locLimit  - The maximum number of triples to localize per BGP (default to 1)
 * @param  {boolean} usePeneloop   - Use peneloop to process joins if set to True
 * @param  {Object} prefixes  - Additional prefixes to be used by the normalizer (default to nothing)
 * @return {Object} The root of the logical query execution plan
 */
const processQuery = (query, endpoints, cardinalities, sourceSelection = {}, locLimit = 1, usePeneloop = false, prefixes = {}) => {
  let q = normalize(query, prefixes);
  q = localization.localizeQuery(q, endpoints, cardinalities, sourceSelection, locLimit, usePeneloop);
  return decompositions.decomposeQuery(q);
};

module.exports = processQuery;
