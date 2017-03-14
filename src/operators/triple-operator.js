/* file : triple-operator.js
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

const BufferedIterator = require('asynciterator').BufferedIterator;
const _ = require('lodash');

/**
 * TripleOperator is a source in a query execution plan which yields mappings from triples
 * fetched from a Triple Pattern Fragment using a {@link FragmentPages}
 * @extends BufferedIterator
 * @author Thomas Minier
 */
class TripleOperator extends BufferedIterator {
  /**
   * Constructor
   * @param {FragmentPages} fragmentPages - The pages used to read triples
   * @param {Object} pattern - The triple pattern releated to
   */
  constructor (fragmentPages, pattern) {
    super();
    this._pattern = pattern;
    this._pages = fragmentPages;
    this._projection = _.pickBy(this._pattern, v => v.startsWith('?'));
  }

  /**
   * Apply a projection on a triple pattern
   * @param {Object} triple - The triple pattern on which the projection is applied
   * @return {Object} A set of mappings resulting from the projection
   */
  _project (triple) {
    const subset = _.pickBy(triple, (v, k) => k in this._projection);
    return _.mapKeys(subset, (v, k) => this._projection[k]);
  }

  /**
   * Read a given number of mappings from triples
   * @param {int} count - The number of items to generate
   * @param {function} done - To be called when reading is completed
   * @return {void}
   */
  _read (count, done) {
    this._pages.fetch(count)
    .then(triples => {
      if (triples === null) {
        this.close();
      } else {
        triples.forEach(t => this._push(this._project(t)));
      }
      done();
    });
    // TODO: see how to catch errors...
  }
}

module.exports = TripleOperator;
