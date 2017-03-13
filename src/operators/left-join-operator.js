/* file : left-join-operator.js
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

const JoinOperator = require('./join-operator.js');
const _ = require('lodash');

/**
 * A LeftJoinOperator perform a Left Join, following the Nested Loop Join algorithm.
 * @extends JoinOperator
 * @author Thomas Minier
 */
class LeftJoinOperator extends JoinOperator {
	/**
	 * Constructor
	 * @param {AsyncIterator} leftSource - An iterator that emits triples from the external relation
	 * @param {string} rightFragment - The fragment url of the internal relation
	 * @param {Object} rightPattern - The triple pattern matching the internal relation
	 * @param {string} rightPattern.subject - The subject of the triple pattern
   * @param {string} rightPattern.predicate - The predicate of the triple pattern
   * @param {string} rightPattern.object - The object of the triple pattern
	 * @param {LRU} cache - The LRU cached used to cached fragment pages
	 */
	constructor (leftSource, rightFragment, rightPattern, cache) {
		super(leftSource, rightFragment, rightPattern, cache);
	}

  /**
   * _scanMappings is called on each set of mappings fetched from the internal relation
   * and perform a left join between the two relations.
   * @param {Object} left - The set of mappings joined from the external relation
   * @param {Object} right - A set of mappings from the internal relation
   * @return {Object} The left join between the two sets of mappings
   * @override
   */
  _scanMappings (left, right) {
    // ignore empty results from internal relation
    return _.assign(left, right);
  }
}

module.exports = LeftJoinOperator;
