/* file : join-operator-test.js
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
const JoinOperator = require('../../src/operators/join-operator.js');
const TripleOperator = require('../../src/operators/triple-operator.js');
const FragmentFactory = require('../../src/fragments/fragment-factory.js');

describe('JoinOperator', () => {
  const factory = new FragmentFactory('http://fragments.mementodepot.org/dbpedia_201510');
  it('should perform a join between two triple patterns', done => {
    const leftPattern = { subject: '?s', predicate: 'http://dbpedia.org/property/accessdate', object: '?o' };
    const pages = factory.get(leftPattern);
    const left = new TripleOperator(pages, leftPattern);

    const rightPattern = {
      subject: '?s',
      predicate: 'http://dbpedia.org/property/isCitedBy',
      object: '?citedBy'
    };
    const join = new JoinOperator(left.take(1), 'http://fragments.mementodepot.org/dbpedia_201510', rightPattern);

    join.take(1).on('data', m => {
      m.should.have.keys('?s', '?o', '?citedBy');
      m['?s'].should.not.be.empty;
      m['?o'].should.not.be.empty;
      m['?citedBy'].should.not.be.empty;
      done();
    });
  });
});
