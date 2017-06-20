/* file : source-selection-test.js
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

require('chai').should();
const AskSourceSelection = require('../../src/source-selection/ask-source-selection.js');
const mockPages = require('../nock-utils.js').mockPages;

describe('AskSourceSelection', () => {
  it('should perform a simple ASK based source selection', done => {
    const ss = new AskSourceSelection();
    const triples = [
      { subject: '?s', predicate: 'http://dbpedia.org/property/title', object: '?o' },
      { subject: '?s', predicate: 'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#isAffiliationOf', object: '?o' },
      { subject: '?s', predicate: '?p', object: '?o' }
    ];
    const servers = [ 'http://example.first.org/en', 'http://example.second.org/scholarlydata' ];

    // setup HTTP mocks
    mockPages(triples[0], 'http://example.first.org', 'en', { headers: { accept: 'text/turtle' } });
    mockPages(triples[1], 'http://example.first.org', 'en', { cardinality: 0, headers: { accept: 'text/turtle' } });
    mockPages(triples[2], 'http://example.first.org', 'en', { headers: { accept: 'text/turtle' } });
    mockPages(triples[0], 'http://example.second.org', 'scholarlydata', { cardinality: 0, headers: { accept: 'text/turtle' } });
    mockPages(triples[1], 'http://example.second.org', 'scholarlydata', { headers: { accept: 'text/turtle' } });
    mockPages(triples[2], 'http://example.second.org', 'scholarlydata', { headers: { accept: 'text/turtle' } });

    const expected = {};
    expected[JSON.stringify(triples[0])] = [ 'http://example.first.org/en' ];
    expected[JSON.stringify(triples[1])] = [ 'http://example.second.org/scholarlydata' ];
    expected[JSON.stringify(triples[2])] = servers;

    ss.perform(triples, servers)
    .then(selection => {
      selection.should.deep.equal(expected);
      done();
    })
    .catch(err => done(err));
  }).timeout(500);
});
