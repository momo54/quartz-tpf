/*
file: fragment-pages-test.js
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

const should = require('chai').should();
const Fragment = require('../../src/fragments/fragment.js');
const request = require('request').forever({timeout:1000, minSockets:40});
const LRU = require('lru-cache');
const _ = require('lodash');

describe('Fragment', () => {
  it('should fetch data from server', done => {
    const cache = new LRU(50);
    const tp = { predicate: 'http://dbpedia.org/property/accessdate' };
    const pages = new Fragment('http://fragments.mementodepot.org/dbpedia_201510', tp, { cache, http: request });
    pages.fetch(2)
    .then(triples => {
      triples.length.should.equal(2);
      pages._buffer.length.should.equals(498);
      done();
    });
  });

  it('should fetch data from server, next from buffer', done => {
    const cache = new LRU(50);
    const tp = { predicate: 'http://dbpedia.org/property/accessdate' };
    const pages = new Fragment('http://fragments.mementodepot.org/dbpedia_201510', tp, { cache, http: request });
    pages.fetch(2)
    .then(triples => {
      triples.length.should.equal(2);
      pages._buffer.length.should.equals(498);
      return pages.fetch(10);
    })
    .then(triples => {
      triples.length.should.equal(10);
      pages._buffer.length.should.equals(488);
      done();
    });
  });

  it('should refill buffer when it is empty using triples from the server', done => {
    const cache = new LRU(50);
    const tp = { predicate: 'http://dbpedia.org/property/accessdate' };
    const pages = new Fragment('http://fragments.mementodepot.org/dbpedia_201510', tp, { cache, http: request });
    pages.fetch(2)
    .then(triples => {
      triples.length.should.equal(2);
      pages._buffer.length.should.equals(498);
      return pages.fetch(10);
    })
    .then(triples => {
      triples.length.should.equal(10);
      pages._buffer.length.should.equals(488);

      // manipulate buffer to force the download of the next page
      pages._buffer = [ _.first(pages._buffer) ];
      return pages.fetch(10);
    })
    .then(triples => {
      triples.length.should.equal(10);
      pages._buffer.length.should.equals(491);
      done();
    });
  });

  it('should stop after a given last page', done => {
    const cache = new LRU(50);
    const tp = { predicate: 'http://dbpedia.org/property/accessdate' };
    const pages = new Fragment('http://fragments.mementodepot.org/dbpedia_201510', tp, { cache, http: request, lastPage: 2 });
    pages.fetch(2)
    .then(triples => {
      triples.length.should.equal(2);
      pages._buffer.length.should.equals(498);
      return pages.fetch(10);
    })
    .then(triples => {
      triples.length.should.equal(10);
      pages._buffer.length.should.equals(488);

      // manipulate buffer to force the download of the next page
      pages._buffer = [];
      return pages.fetch(10);
    })
    .then(triples => {
      should.not.exist(triples);
      done();
    });
  });
});
