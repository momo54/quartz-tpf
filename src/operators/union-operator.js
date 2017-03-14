/* file : union-operator.js
MIT License

Copyright (c) 2016 Thomas Minier

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

/**
 * UnionOperator perform an union between values of several iterators.
 * This operator is heavily inspired from the original TPF Union Operator ({@link https://github.com/LinkedDataFragments/Client.js/blob/master/lib/sparql/UnionIterator.js})
 * @extends BufferedIterator
 * @author Thomas Minier
 */
class UnionOperator extends BufferedIterator {
  /**
   * Constructor
   * @param {AsyncIterator[]} sources - The sources to read from
   */
  constructor (...sources) {
    super();
    this._sources = [];
    this._sIndex = 0;
    sources.forEach(s => {
      this._sources.push(s);
      s.on('readable', () => this._fillBuffer());
      s.on('end', () => this._fillBuffer());
      s.on('error', err => this.emit(err));
    });
  }

  /**
   * Read the next available item from the remaining sources
   * @param {int} count - The number of items to generate
   * @param {function} done - To be called when reading is completed
   * @return {void}
   */
  _read (count, done) {
    let item = null;
    let source = null;
    let cycles = 0;

    // read in a round robin way
    // TODO: read count item instead of only one, see if how performance is impacted
    while ( item === null && cycles < this._sources.length) {
      source = this._sources[this._sIndex];
      item = source.read();
      // cleanup source if it was the last item readable
      if (source.ended) {
        this._sources.splice(this._sIndex, 1);
      } else {
        this._sIndex++;
      }
      if (this._sIndex >= this._sources.length) this._sIndex = 0;
      cycles++;
    }

    if (item !== null) this._push(item);
    if (this._sources.length <= 0) this.close();
    done();
  }
}

module.exports = UnionOperator;
