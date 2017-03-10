/*
file: fragment-pages.js
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

const jsonld = require('jsonld');
const n3 = require('n3');
const os = require('os');
const request = require('request');
const _ = require('lodash');
const metadata = require('./metadata.js');

const defaultHeaders = () => {
  return {
    'accept': 'application/json',
    'accept-charset': 'utf-8',
    'accept-encoding': 'gzip,deflate',
    'user-agent': `Triple Pattern Fragments Client Lite (${os.type()} ${os.arch()})`
  };
};

/**
 * FragmentPages allow to fetch triples that match a triple pattern from a TPF fragment
 * @author Thomas Minier
 */
class FragmentPages {

  /**
   * Constructor
   * @param {string} fragmentURL - The fragment url
   * @param {Object} pattern - The triple pattern to match against
   * @param {LRU} cache - Cache store used to cache fragment pages
   * @param {int} firstPage - (optional) The index of the first page to use when fetching triples from pages
   */
  constructor (fragmentURL, pattern, cache, firstPage = 1) {
    this._fragmentURL = fragmentURL;
    this._firstPage = this._makeFragmentURL(fragmentURL, pattern, firstPage);
    this._nextPage = this._firstPage;
    this._cache = cache;
    this._parser = new n3.Parser();
    this.isClosed = false;
    this._buffer = [];
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
   * Refill the internal buffer using the next page fetched from the cache or the online fragment
   * @return {Promise} A Promise fullfilled when the buffer has been refilled
   */
  _refillBuffer () {
    // try to fetch the page from the cache first
    const cachedPage = this._cache.get(this._nextPage);
    if (cachedPage !== undefined) {
      this._buffer = cachedPage.items;
      this.isClosed = !('hydra:next' in cachedPage.stats);
      if (!this.isClosed) this._nextPage = cachedPage.stats['hydra:next']['@id'];
      return Promise.resolve();
    }

    // otherwise, fetch the page from online fragment
    return new Promise((resolve, reject) => {
      const options = {
        url: this._nextPage,
        headers: defaultHeaders()
      };
      request.get(options, (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }
        const data = JSON.parse(body);
        const context = data['@context'];
        const graph = _.partition(data['@graph'], obj => '@id' in obj && !obj['@id'].includes('#metadata'));

        // set next page for later operations
        const stats = metadata.getStats(this._nextPage, graph[1][0]);
        this.isClosed = !('hydra:next' in stats);
        if (!this.isClosed) this._nextPage = stats['hydra:next']['@id'];

        // extract items fetched from online fragment, then fill buffer with remaining items
        jsonld.toRDF({'@context': context, '@graph': graph[0]}, { format: 'application/nquads' }, (err, raw) => {
          if (err) {
            reject(err);
            return;
          }
          this._buffer = this._parser.parse(_.trim(raw));

          // save page into the cache with its metadata, then resolve promise
          this._cache.set(options.url, {
            stats,
            items: this._buffer
          });
          resolve();
        });
      });
    });
  }

  /**
   * Fetch the next N triples from the fragment pages.
   * Only fetch the remaining triples from the pages, i.e. this function can returns less than N triples.
   * @param {int} count - Number of triples to fetch
   * @param {Object[]} previous - Triples fetched from a previous call of the function (used for recursive call)
   * @return {Promise} A Promise fullfilled with the N triples from the fragment pages.
   */
  fetch (count, previous = []) {
    // stop case 1: no more triples can be fetched from the fragment
    if (this.isClosed) {
      return Promise.resolve(previous);
    } else if (count <= 0) {
      // stop case 2: no more items needs to be fetched
      return Promise.resolve(previous);
    } else if (this._buffer.length > 0) {
      // fetch as many triples as possibles from the buffer
      let cpt = count;
      const items = _.take(this._buffer, cpt);
      cpt -= items.length;
      this._buffer = _.drop(this._buffer, items.length);
      // recursive call to fetch (eventually) missing triples
      return this.fetch(cpt, _.union(previous, items));
    } else {
      // fetch triples from online fragments, then retry fetching
      return this._refillBuffer().then(() => this.fetch(count, previous));
    }
  }
}

module.exports = FragmentPages;
