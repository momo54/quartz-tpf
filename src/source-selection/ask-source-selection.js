/* file : ask-source-selection.js
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

const SourceSelection = require('./source-selection.js');
const http = require('http');
const URL = require('url');
const _ = require('lodash');

/**
 * AskSourceSelection perform a simple ASK-based source selection.
 * Any replication is considered as total replication.
 * @extends SourceSelection
 * @author Thomas Minier
 */
class AskSourceSelection extends SourceSelection {
  constructor () {
    super();
  }

  /**
   * Perform the source selection for a set of triples patterns and a set of TPF servers
   * @override
   * @param  {Object[]} triples - A set of triples patterns
   * @param  {string[]} servers - A set of potentially relevant TPF servers
   * @return {Promise} A Promise fullfilled with an object ythat associate triples patterns with their relevant sources
   */
  perform (triples, servers) {
    return Promise.all(triples.map(t => this._scanTriple(t, servers)))
    .then(relevants => {
      return _.zipObject(triples.map(t => JSON.stringify(t)), relevants);
    });
  }

  /**
   * Perform the source selection of a single triple with a set of TPF servers
   * @param  {Object} triple    - A triple pattern
   * @param  {string[]} servers - A set of potentially relevant TPF servers
   * @return {Promise} A Promise fullfilled with the list of relevant servers for the given triple pattern
   */
  _scanTriple (triple, servers) {
    return Promise.all(servers.map(server => this._isRelevantSource(triple, server)))
    .then(relevants => {
      return Promise.resolve(_.compact(relevants));
    });
  }

  /**
   * Determine if a TPF server is a relevant source for a triple pattern
   * @param  {Object} triple   - A triple pattern
   * @param  {string} server  - A  potentially relevant TPF server
   * @return {Boolean} A Promise fullfilled with a boolean indicating if the server is a relevant source for the triple pattern
   */
  _isRelevantSource (triple, server) {
    return new Promise((resolve, reject) => {
      let nbTriples = 0;
      const urlArgs = _.compact(_.map(triple, (value, key) => {
        if (value.startsWith('?')) return null;
        return `${key}=${encodeURIComponent(value)}`;
      })).join('&');
      const newUrl = URL.parse(server);
      const httpOptions = {
        hostname: newUrl.hostname,
        port: newUrl.port,
        path: (urlArgs === '') ? `${newUrl.path}` : `${newUrl.path}?${urlArgs}`,
        headers: {
          accept: 'text/turtle'
        }
      };
      http.get(httpOptions, res => {
        res.once('error', err => reject(err));
        res.once('end', () => {
          resolve((nbTriples > 0) ? server : null);
        });
        res.on('data', x => {
          const totalItems = x.toString('utf-8').match(/hydra:totalItems "(.*)"\^\^xsd:integer/);
          if (totalItems !== null)
            nbTriples = parseInt(totalItems[1]);
        });
      });
    });
  }
}

module.exports = AskSourceSelection;
