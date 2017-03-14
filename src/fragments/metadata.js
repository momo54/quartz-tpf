/*
file: metadata.js
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

const request = require('request');
const _ = require('lodash');

/**
 * Get metadata from a fragment
 * @param  {string} fragment - The url on which the fragment is hosted
 * @return {Object} The fragment metadata
 */
const getMetadata = (fragment, cache) => {
  const options = {
    url: fragment,
    headers: {
      'accept': 'application/json'
    }
  };
  return new Promise((resolve, reject) => {
    request.get(options, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }
      const data = JSON.parse(body);
      const index = _.findIndex(data['@graph'], obj => '@id' in obj && obj['@id'].includes('#metadata'));
      resolve(data['@graph'][index]);
    });
  });
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

module.exports = {
  getMetadata,
  getStats
};
