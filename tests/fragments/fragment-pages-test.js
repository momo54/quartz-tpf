'use strict';

require('chai').should();
const FragmentPages = require('../../src/fragments/fragment-pages.js');
const LRU = require('lru-cache');
const _ = require('lodash');

describe('FragmentPages', () => {
  it('should fetch data from server', done => {
    const cache = new LRU(50);
    const tp = { predicate: 'http://dbpedia.org/property/accessdate' };
    const pages = new FragmentPages('http://fragments.mementodepot.org/dbpedia_201510', tp, cache, 1);
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
    const pages = new FragmentPages('http://fragments.mementodepot.org/dbpedia_201510', tp, cache, 1);
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
    const pages = new FragmentPages('http://fragments.mementodepot.org/dbpedia_201510', tp, cache, 1);
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
      // console.log(triples);
      triples.length.should.equal(10);
      pages._buffer.length.should.equals(491);
      done();
    });
  });
});
