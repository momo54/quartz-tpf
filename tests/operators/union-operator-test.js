/* file : union-operator-test.js
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

const TripleOperator = require('../../src/operators/triple-operator.js');
const UnionOperator = require('../../src/operators/union-operator.js');
const FragmentFactory = require('../../src/fragments/fragment-factory.js');

describe('UnionOperator', () => {
  const factory = new FragmentFactory('http://fragments.mementodepot.org/dbpedia_201510');
  it('should perform an union between two sources', done => {
    let cpt = 0;
    const tpA = { subject: '?s1', predicate: 'http://dbpedia.org/property/accessdate', object: '?o1' };
    const tpB = { subject: '?s2', predicate: 'http://dbpedia.org/property/first', object: '?o2' };

    const firstOp = new TripleOperator(factory.get(tpA), tpA);
    const secondOp = new TripleOperator(factory.get(tpB), tpB);
    const union = new UnionOperator(firstOp.take(2), secondOp.take(2));

    union.on('data', m => {
      m.should.have.any.keys('?s1', '?o1', '?s2', '?o2');
      cpt++;
      if (cpt >= 4) done();
    });
  });
});
