/*
file: fragment.js
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

// keep http connection open for this fragment url
const request = require('request');
const _ = require('lodash');
const LDFPage = require('./ldf-page.js');

/**
 * Fragment allow to fetch triples that match a triple pattern from a TPF fragment
 * @author Thomas Minier
 */
class Fragment {

  /**
   * Constructor
   * @param {string} fragmentURL - The fragment url
   * @param {Object} pattern - The triple pattern to match against
   * @param {Object} options - Options passed to the Fragment pages
   * @param {LRU} options.cache - Cache store used to cache fragment pages
   * @param {int} options.firstPage - (optional) The index of the first page to use when fetching triples from pages
   * @param {int} options.lastPage - (optional) The index of the last page to read from this fragment
   * @param {int} options.offset - (optional) The offset applied on the triples fetched from this fragment
   * @param {int} options.limit - (optional) The limit applied on the triples fetched from this fragment
   */
  constructor (fragmentURL, pattern, options) {
    this._fragmentURL = fragmentURL;
    this._pattern = pattern;
    this._firstPageIndex = options.firstPage || 1;
    this._lastPageIndex = options.lastPage || -1;
    this._firstPage = this._makeFragmentURL(this._fragmentURL, this._pattern, this._firstPageIndex);
    this._nextPage = this._firstPage;
    this._offset = options.offset || 0;
    this._limit = options.limit || -1;
    this._cache = options.cache;
    this._http = options.http || request.forever({timeout:1000, minSockets:40});
    this.isClosed = false;
    this._buffer = [];
    this._stats = null;
  }

  /**
   * Make the url to fetch a pattern from a fragment with a given page
   * @param {string} fragmentURL - The fragment url
   * @param {Object} pattern - The triple pattern to match against
   * @param {string} pattern.subject - The subject of the triple pattern
   * @param {string} pattern.predicate - The predicate of the triple pattern
   * @param {string} pattern.object - The object of the triple pattern
   * @param {int} page - The index of the first page to use when fetching triples from pages
   * @return {string} An url
   */
  _makeFragmentURL (fragmentURL, pattern, page) {
    let tp = '';
    if ('subject' in pattern && !pattern.subject.startsWith('?')) tp += `subject=${encodeURIComponent(pattern.subject)}&`;
    if ('predicate' in pattern && !pattern.predicate.startsWith('?')) tp += `predicate=${encodeURIComponent(pattern.predicate)}&`;
    if ('object' in pattern && !pattern.object.startsWith('?')) tp += `object=${encodeURIComponent(pattern.object)}&`;
    return `${fragmentURL}?${tp}page=${page}`;
  }

  /**
   * Fetch the next N triples from the fragment pages.
   * Only fetch the remaining triples from the pages, i.e. this function can returns less than N triples.
   * @param {int} count - Number of triples to fetch
   * @param {Object[]} previous - Triples fetched from a previous call of the function (used for recursive call)
   * @return {Promise} A Promise fullfilled with the N triples from the fragment pages.
   */
  fetch (count, previous = []) {
    // no need to fetch more items
    if (count <= 0) {
      return Promise.resolve(previous);
    } else if (this._buffer.length > 0) {
      // fetch as many triples as possibles from the buffer
      let cpt = count;
      const items = _.take(this._buffer, cpt);
      cpt -= items.length;
      this._buffer = _.drop(this._buffer, items.length);
      // recursive call to fetch (eventually) missing triples
      return this.fetch(cpt, previous.concat(items));
    } if (this.isClosed && previous.length > 0) {
      return Promise.resolve(previous);
    } else if (this.isClosed) {
      return Promise.resolve(null);
    } else {
      // fetch triples from online fragments, then retry fetching
      return LDFPage.getPage(this._nextPage, this._http, this._cache)
      .then(page => {
        if (_.isNull(page)) {
          this.isClosed = true;
          return this.fetch(count, previous);
        }
        this._buffer = this._buffer.concat(page.items);
        this.isClosed = (!page.stats.hasNextPage || (page.stats.hasNextPage && page.stats.nextPage.includes(`page=${this._lastPageIndex}`)));
        if (!this.isClosed) this._nextPage = page.stats.nextPage;
        return this.fetch(count, previous);
      });
    }
  }
}

module.exports = Fragment;
