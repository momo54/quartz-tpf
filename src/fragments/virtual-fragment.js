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

const Fragment = require('./fragment.js');
const _ = require('lodash');

/**
 * Get the decimal part of a division
 * @param {number} x - x
 * @param {number} y - y
 * @return {int} The decimal part of a division
 */
const decimalPart = (x, y) => {
  if (x === 0 || y === 0) return 0;
  return parseInt((x / y).toFixed(2).split('.')[1], 10);
};

/**
 * A Virtual Fragment is a Triple Pattern Fragment where a virtual fragmentation is applied on the fragment.
 * A Virtual Fragment give access to a chunk i of the Fragment, whihc is divided into n chunks.
 * @extends Fragment
 * @author Thomas Minier
 */
class VirtualFragment extends Fragment {
  /**
   * Constructor
   * @param {string} fragmentURL - The fragment url
   * @param {Object} pattern - The triple pattern to match against
   * @param {int} chunkIndex - The index of the chunk available through the virtual fragment
   * @param {int} nbChunks - The number of chunks in which the original fragment is divided
   * @param {Metadata} metadata - The metadata of this fragment
   * @param {Object} options - Options passed to the Fragment pages
   * @param {LRU} options.cache - Cache store used to cache fragment pages
   */
  constructor (fragmentURL, pattern, chunkIndex, nbChunks, metadata, options) {
    // compute the first page, the last page, the limit & the offset of this chunk
    const opts = _.merge({}, options);
    const offset = (chunkIndex + ( Math.floor(metadata.totalTriples / nbChunks) * ( chunkIndex - 1) )) - 1;
    opts.firstPage = Math.trunc(offset / metadata.triplesPerPage) + 1;
    opts.lastPage = -1;
    opts.offset = decimalPart(offset, metadata.triplesPerPage);
    opts.limit = -1;
    if (chunkIndex < nbChunks) opts.limit = chunkIndex + ( Math.floor(metadata.totalTriples / nbChunks) * chunkIndex ) - 1;

    super(fragmentURL, pattern, opts);
    this._chunkIndex = chunkIndex;
    this._nbChunks = nbChunks;
  }
}

module.exports = VirtualFragment;
