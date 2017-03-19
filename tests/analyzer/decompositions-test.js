/* file : decompositions-test.js
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

const decompositions = require('../../src/analyzer/decompositions.js');

describe('Decompositions', () => {
  describe('Join distribution', () => {
    const joinDistribution = decompositions.joinDistribution;
    it('should reduce a BGP with one union into an union of BGPs', () => {
      const bgp = {
        type: 'bgp',
        triples: [
          { subject: 's1', predicate: 'p1', object: 'o1'},
          {
            type: 'union',
            patterns: [
              { subject: 's2', predicate: 'p2', object: 'o2'},
              { subject: 's3', predicate: 'p3', object: 'o3'}
            ]
          },
          { subject: 's4', predicate: 'p4', object: 'o4'}
        ]
      };

      const expected = {
        type: 'union',
        patterns: [
          {
            type: 'bgp',
            triples: [
              { subject: 's2', predicate: 'p2', object: 'o2'},
              { subject: 's1', predicate: 'p1', object: 'o1'},
              { subject: 's4', predicate: 'p4', object: 'o4'}
            ]
          },
          {
            type: 'bgp',
            triples: [
              { subject: 's3', predicate: 'p3', object: 'o3'},
              { subject: 's1', predicate: 'p1', object: 'o1'},
              { subject: 's4', predicate: 'p4', object: 'o4'}
            ]
          }
        ]
      };

      joinDistribution(bgp).should.deep.equal(expected);
    });

    it('should reduce a BGP with many unions into an union of BGPs', () => {
      const bgp = {
        type: 'bgp',
        triples: [
          { subject: 's1', predicate: 'p1', object: 'o1'},
          {
            type: 'union',
            patterns: [
              { subject: 's2', predicate: 'p2', object: 'o2'},
              { subject: 's3', predicate: 'p3', object: 'o3'}
            ]
          },
          {
            type: 'union',
            patterns: [
              { subject: 's4', predicate: 'p4', object: 'o4'},
              { subject: 's5', predicate: 'p5', object: 'o5'}
            ]
          }
        ]
      };

      const expected = {
        type: 'union',
        patterns: [
          {
            type: 'bgp',
            triples: [
              { subject: 's4', predicate: 'p4', object: 'o4'},
              { subject: 's2', predicate: 'p2', object: 'o2'},
              { subject: 's1', predicate: 'p1', object: 'o1'}
            ]
          },
          {
            type: 'bgp',
            triples: [
              { subject: 's4', predicate: 'p4', object: 'o4'},
              { subject: 's3', predicate: 'p3', object: 'o3'},
              { subject: 's1', predicate: 'p1', object: 'o1'}
            ]
          },
          {
            type: 'bgp',
            triples: [
              { subject: 's5', predicate: 'p5', object: 'o5'},
              { subject: 's2', predicate: 'p2', object: 'o2'},
              { subject: 's1', predicate: 'p1', object: 'o1'}
            ]
          },
          {
            type: 'bgp',
            triples: [
              { subject: 's5', predicate: 'p5', object: 'o5'},
              { subject: 's3', predicate: 'p3', object: 'o3'},
              { subject: 's1', predicate: 'p1', object: 'o1'}
            ]
          }
        ]
      };

      joinDistribution(bgp).should.deep.equal(expected);
    });

    it('should not apply join reduction when there is no union', () => {
      const bgp = {
        type: 'bgp',
        triples: [
          { subject: 's1', predicate: 'p1', object: 'o1'},
          { subject: 's4', predicate: 'p4', object: 'o4'}
        ]
      };
      joinDistribution(bgp).should.deep.equal(bgp);
    });
  });

  describe('Flatten Union', () => {
    const flattenUnion = decompositions.flattenUnion;
    it('should flatten union of unions', () => {
      const union = {
        type: 'union',
        patterns: [
          {
            type: 'union',
            patterns: [ 'foo', 'bar' ]
          },
          {
            type: 'union',
            patterns: [ 'moo' ]
          }
        ]
      };

      const expected = {
        type: 'union',
        patterns: [ 'foo', 'bar', 'moo' ]
      };

      flattenUnion(union).should.deep.equal(expected);
    });

    it('should not flatten an union where all its patterns are not unions', () => {
      const union = {
        type: 'union',
        patterns: [
          {
            type: 'union',
            patterns: [ 'foo', 'bar' ]
          },
          {
            type: 'bgp',
            triples: [ 'foo', 'bar', 'moo' ]
          }
        ]
      };

      flattenUnion(union).should.deep.equal(union);
    });
  });
});
