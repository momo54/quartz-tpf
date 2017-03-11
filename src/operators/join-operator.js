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

const TransformIterator = require('asynciterator').TransformIterator;
const FragmentPages = require('../fragments/fragment-pages.js');
const TripleOperator = require('./triple-operator.js');
const _ = require('lodash');

/**
 * A Join Operator perform a Nested Loop Join between another operator and a triple pattern
 * @extends TransformIterator
 * @author Thomas Minier
 */
class JoinOperator extends TransformIterator {
	/**
	 * Constructor
	 * @param {AsyncIterator} leftSource - An iterator that emits triples from the external relation
	 * @param {string} rightFragment - The fragment url of the internal relation
	 * @param {Object} rightPattern - The triple pattern matching the internal relation
	 * @param {LRU} cache - The LRU cached used to cached framgent pages
	 */
	constructor (leftSource, rightFragment, rightPattern, cache) {
		super(leftSource);
		this._rightFragment = rightFragment;
		this._rightPattern = rightPattern;
		this._cache = cache;
	}

	/**
	 * Perform Nested Loop Join using bindings from upstream iterator
	 * @param {Object} item - Set of mappings fetched from upstream iterator
	 * @param {function} done - To be called when transformation is completed
	 * @return {void}
	 */
	_transform (item, done) {
			// creates a new triple by injecting set of mappings into the internal relation
			const triple = _.mapValues(this._rightPattern, (v, k) => {
				if (v.startsWith('?') && k in item) return item[k];
				return v;
			});

			// build a new triple operator from this new triple pattern
			const pages = new FragmentPages('http://fragments.mementodepot.org/dbpedia_201510', triple, this._cache, 1);
			const rightOperator = new TripleOperator(pages, triple);

			rightOperator.on('data', mappings => this._push(_.assign(item, mappings)));
			rightOperator.on('end', () => done());
			// TODO: find how to handle errors from both left and right sources...
	}
}

module.exports = JoinOperator;
