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

const Fragment = require('./fragment.js');
const VirtualFragment = require('./virtual-fragment.js');

/**
 * FragmentFactory is a factory used to build {@link Fragment} with the same fragment url and cache,
 * but with a given pattern and first page.
 * @author Thomas Minier
 */
class FragmentFactory {
  /**
   * Constructor
   * @param {string} url - The fragment url
   * @param {LRU|undefined} cache - (optional) Cache store used to cache fragment pages
   * @param {*} http - (optional) The HTTP client used to perform HTTP requests
   */
  constructor (url, cache, http) {
    this._fragmentURL = url;
    this._http = http;
    // by default, use a fake cache that does not store anything
    this._cache = cache || {
      get: () => undefined,
      set: () => {}
    };
  }

  /**
   * Create a new {@link Fragment} for a given pattern and first page
   * @param  {Object} pattern - The triple pattern to match against
   * @param {string} pattern.subject - The subject of the triple pattern
   * @param {string} pattern.predicate - The predicate of the triple pattern
   * @param {string} pattern.object - The object of the triple pattern
   * @param  {int} firstPage - (optional) The index of the first page to use when fetching triples from pages
   * @param  {int} lastPage - (optional) The index of the last page to read from fragment
   * @return {Fragment} A new Fragment
   */
  get (pattern, firstPage = 1, lastPage = -1) {
    return new Fragment(this._fragmentURL, pattern, {
      cache: this._cache,
      http: this._http,
      firstPage,
      lastPage
    });
  }

  getVirtual (pattern, chunkIndex, nbChunks, metadata) {
    return new VirtualFragment(this._fragmentURL, pattern, chunkIndex, nbChunks, metadata, {
      cache: this._cache,
      http: this._http
    });
  }
}

module.exports = FragmentFactory;
