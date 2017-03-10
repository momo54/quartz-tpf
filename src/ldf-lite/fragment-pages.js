'use strict';

const jsonld = require('jsonld');
const request = require('request');
const _ = require('lodash');
const metadata = require('./metadata.js');

const defaultHeaders = {
  accept: 'application/json'
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
    this.isClosed = false;
    this._buffer = [];
  }

  /**
   * Make the url to fetch a pattern from a fragment with a given page
   * @param {string} fragmentURL - The fragment url
   * @param {Object} pattern - The triple pattern to match against
   * @param {int} page - The index of the first page to use when fetching triples from pages
   * @return {string} An url
   */
  _makeFragmentURL (fragmentURL, pattern, page) {
    let url = fragmentURL;
    let tp = '';
    if ('subject' in pattern && !pattern.subject.startsWith('?')) tp += `subject=${encodeURIComponent(pattern.subject)}&`;
    if ('predicate' in pattern && !pattern.predicate.startsWith('?')) tp += `predicate=${encodeURIComponent(pattern.predicate)}&`;
    if ('object' in pattern && !pattern.object.startsWith('?')) tp += `object=${encodeURIComponent(pattern.object)}&`;
    if (tp !== '') {
      tp = tp.slice(0, -1);
      url += `?${tp}&page=${page}`;
    }
    return url;
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

    // fallback: fetch the page online
    return new Promise((resolve, reject) => {
      const options = {
        url: this._nextPage,
        headers: defaultHeaders
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
        jsonld.toRDF({ '@context': context, '@graph': graph[0]}, { format: 'application/nquads' }, (err, raw) => {
          if (err) {
            reject(err);
            return;
          }
          this._buffer = _.trim(raw).split('\n');

          // save page into the cache alongisde its metadata, then resolve promise
          this._cache.set(this._nextPage, {
            stats,
            items: this._buffer
          });
          resolve();
        });
      });
    });
  }

  /**
   * Get the next N triples from the fragment pages.
   * Only fetch the remaining triples from the pages, i.e. this function chan return less than N triples.
   * @param {int} count - Number of triples to fetch
   * @param {Object[]} previous - Triples fetched from a previous call of the function (used for recursive call)
   * @return {Promise} A Promise fullfilled with the N triples from the fragment pages.
   */
  fetch (count, previous = []) {
    if (this.isClosed) {
      // no more triples can be fetched from the fragment
      return Promise.resolve(previous);
    } else if (count <= 0) {
      return Promise.resolve(previous);
    } else if (this._buffer.length > 0) {
      let cpt = count;
      // fetch as many triples as possibles from the buffer
      const items = _.take(this._buffer, cpt);
      cpt -= items.length;
      this._buffer = _.drop(this._buffer, items.length);
      // recursive call to fetch missing triples from online fragments
      return this.fetch(cpt, _.union(previous, items));
    } else {
      // fetch triples from online fragments as last resort
      return this._refillBuffer()
      .then(() => {
        return this.fetch(count, previous);
      });
    }
  }
}

module.exports = FragmentPages;
