/* file : fragment-factory.js
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

const FragmentPages = require('./fragment-pages.js');

/**
 * FragmentFactory is a factory used to build {@link FragmentPages} with the same fragment url and cache,
 * but with a given pattern and first page.
 * @author Thomas Minier
 */
class FragmentFactory {
	/**
	 * Constructor
	 * @param {string} url - The fragment url
	 * @param {LRU|undefined} cache - (optional) Cache store used to cache fragment pages
	 */
	constructor (url, cache) {
		this._fragmentURL = url;
		// by default, use a fake cache that does not store anything
		this._cache = cache || {
			get: () => undefined,
			set: () => {}
		};
	}

	/**
	 * Create a new {@link FragmentPages} for a given pattern and first page
	 * @param  {Object} pattern - The triple pattern to match against
	 * @param  {int} [firstPage=1] - (optional) The index of the first page to use when fetching triples from pages
	 * @return {FragmentPages} A new FragmentPages
	 */
	get (pattern, firstPage = 1) {
		return new FragmentPages(this._fragmentURL, pattern, this._cache, firstPage);
	}
}

module.exports = FragmentFactory;
