/*
file: ldf-page.js
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
const _ = require('lodash');

const defaultHeaders = {
  'accept': 'application/json',
  'accept-charset': 'utf-8',
  'accept-encoding': 'gzip,deflate',
  'user-agent': `Triple Pattern Fragments Client Lite (${os.type()} ${os.arch()})`
};

/**
 * Get stats (nb triples per page, etc) from a fragment's metadata
 * @param  {string} fragment - The url on which the fragment is hosted
 * @param  {Object} metadata - The fragment metadata
 * @return {Object} The stats from a fragment's metadata
 */
const getStats = (fragment, metadata) => {
  const index = _.findIndex(metadata['@graph'], obj => '@id' in obj && obj['@id'] === fragment);
  return metadata['@graph'][index];
};

/**
 * Get data & metadata from an LDF page
 * @param  {string} url - The url to query
 * @param {*} http - Http client used to perform HTTP request
 * @param {LRU} cache - The cache used to cache items
 * @return {Promise} A Promise fullfilled whith the page data and stats
 */
const getPage = (url, http, cache) => {
  // try to fetch the page from the cache first
  const cachedPage = cache.get(url);
  if (cachedPage !== undefined) return Promise.resolve({ items: cachedPage.items, stats: cachedPage.stats });

  // otherwise, fetch the page from online fragment
  const parser = new n3.Parser();
  return new Promise((resolve, reject) => {
    const options = {
      url,
      headers: defaultHeaders
    };
    http.get(options, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }
      const data = JSON.parse(body);
      const context = data['@context'];
      const graph = _.partition(data['@graph'], obj => '@id' in obj && !obj['@id'].includes('#metadata'));

      // no triples match this pattern for this fragment
      if (graph[1].length === 0) {
        resolve(null);
        return;
      }
      const stats = getStats(url, graph[1][0]);

      // extract items fetched from the online fragment, then fill buffer with remaining items
      jsonld.toRDF({'@context': context, '@graph': graph[0]}, { format: 'application/nquads' }, (err, raw) => {
        if (err) {
          reject(err);
          return;
        }
        const items = parser.parse(_.trim(raw));
        // save page into the cache with its metadata, then resolve promise
        cache.set(options.url, {
          stats,
          items
        });
        resolve({items, stats});
      });
    });
  });
};

module.exports = {
  getPage,
  getStats
};
