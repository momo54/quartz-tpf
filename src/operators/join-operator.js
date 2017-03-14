/* file : join-operator.js
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

const AsyncIt = require('asynciterator');
const MultiTransformIterator = AsyncIt.MultiTransformIterator;
const EmptyIterator = AsyncIt.EmptyIterator;
const FragmentFactory = require('../fragments/fragment-factory.js');
const TripleOperator = require('./triple-operator.js');
const _ = require('lodash');

/**
 * A Join Operator perform a Nested Loop Join between another operator and a triple pattern
 * @extends MultiTransformIterator
 * @author Thomas Minier
 */
class JoinOperator extends MultiTransformIterator {
  /**
   * Constructor
   * @param {AsyncIterator} leftSource - An iterator that emits mappings from the external relation
   * @param {string} rightFragment - The fragment url of the internal relation
   * @param {Object} rightPattern - The triple pattern matching the internal relation
   * @param {string} rightPattern.subject - The subject of the triple pattern
   * @param {string} rightPattern.predicate - The predicate of the triple pattern
   * @param {string} rightPattern.object - The object of the triple pattern
   * @param {LRU} cache - The LRU cached used to cache fragment pages
   */
  constructor (leftSource, rightFragment, rightPattern, cache) {
    super(leftSource);
    this._rightFragment = rightFragment;
    this._rightPattern = rightPattern;
    this._fragmentFactory = new FragmentFactory(this._rightFragment, cache);
    leftSource.on('error', err => this.emit(err));
  }

  /**
   * _scanMappings is called on each set of mappings fetched from the internal relation
   * and perform a full join between the two relations.
   * @param {Object} left - The set of mappings joined from the external relation
   * @param {Object} right - A set of mappings from the internal relation
   * @return {Object} The join between the two sets of mappings
   */
  _scanMappings (left, right) {
    // empty results from internal relation means no results from the join
    if (_.size(right) === 0) return null;
    return _.assign(left, right);
  }

  /**
   * Perform Nested Loop Join using mappings from upstream iterator
   * @param {Object} item - Set of mappings fetched from upstream iterator
   * @return {AsyncIterator} The next iterator in the query execution plan
   */
  _createTransformer (item) {
      // if there is no commons variables between the mappings & the internal relation => no matches !
      if(_.findKey(this._rightPattern, v => v in item) === undefined) return new EmptyIterator();

      // creates a new triple by injecting set of mappings into the internal relation
      const triple = _.mapValues(this._rightPattern, v => {
        if (v.startsWith('?') && v in item) return item[v];
        return v;
      });

      // build a new triple operator from this new triple pattern
      const pages = this._fragmentFactory.get(triple);
      const rightOperator = new TripleOperator(pages, triple);
      return rightOperator.map(mappings => this._scanMappings(item, mappings));
  }
}

module.exports = JoinOperator;
