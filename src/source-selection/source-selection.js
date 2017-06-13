/* file : source-selection.js
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
const _ = require('lodash');

/**
 * SourceSelection is an abtract, default source selection strategy.
 * If not override by a subclass, it select all servers for all triples patterns.
 * @abstract
 * @author Thomas Minier
 */
class SourceSelection {

  /**
   * Perform the source selection for a set of triples patterns and a set of TPF servers
   * @param  {Object[]} triples - A set of triples patterns
   * @param  {string[]} servers - A set of potentially relevant TPF servers
   * @return {Promise} A Promise fullfilled with an object ythat associate triples patterns with their relevant sources
   */
  perform (triples, servers) {
    return Promise.resolve(_.zipObject(triples, servers));
  }
}

module.exports = SourceSelection;
