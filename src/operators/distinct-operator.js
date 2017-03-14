/* file : filter-operator.js
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

const TransformIterator = require('asynciterator').TransformIterator;
const crypto = require('crypto');

/**
 * DistinctOperator applies a DISTINCT modifier on the output of another operator.
 * This implementation is based on the exisiting DistinctIterator ({@link https://github.com/LinkedDataFragments/Client.js/blob/master/lib/sparql/DistinctIterator.js}).
 * @extends TransformIterator
 * @author Thomas Minier
 */
class DistinctOperator extends TransformIterator {
  /**
   * Constructor
   * @param {AsyncIterator} source - The source operator
   * @param {Object} options - Options passed to iterator
   */
  constructor (source, options = {}) {
    super(source, options);
    this._values = {};
  }

  /**
   * Filter unique mappings from the source operator
   * @param {Object} item - The set of mappings to filter
   * @param {function} done - To be called when filtering is done
   * @return {void}
   */
  _transform (item, done) {
    const hash = this._hash(item);
    if (!(hash in this._values)) {
      this._values[hash] = true;
      this._push(item);
    }
    done();
  }

  /**
   * Hash an item and produce an unique value
   * @param {Object} item - The item to hash
   * @return {string} An unique hash which identify the item
   */
  _hash (item) {
    const hash = crypto.createHash('sha1');
    hash.update(JSON.stringify(item));
    return hash.digest('base64');
  }
}

module.exports = DistinctOperator;
