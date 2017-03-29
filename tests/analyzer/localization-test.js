/* file : localization-test.js
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
const localization = require('../../src/analyzer/localization.js');

describe('Localization', () => {
  it('should localize a triple pattern with only one endpoint', () => {
    const endpoints = [ 'e1' ];
    const triple = {
      subject: 's1',
      predicate: 'p1',
      object: 'o1'
    };
    const expected = {
      subject: 's1',
      predicate: 'p1',
      object: 'o1',
      fragment: {
        endpoint: 'e1',
        virtualIndex: 1,
        nbVirtuals: endpoints.length
      }
    };

    localization.localizeTriple(triple, endpoints).should.deep.equal(expected);
  });

  it('should localize a triple pattern with multiple endpoints', () => {
    const endpoints = [ 'e1', 'e2', 'e3' ];
    const triple = {
      subject: 's1',
      predicate: 'p1',
      object: 'o1'
    };
    const expected = {
      type: 'union',
      patterns: [
        {
          subject: 's1',
          predicate: 'p1',
          object: 'o1',
          fragment: {
            endpoint: 'e1',
            virtualIndex: 1,
            nbVirtuals: endpoints.length
          }
        },
        {
          subject: 's1',
          predicate: 'p1',
          object: 'o1',
          fragment: {
            endpoint: 'e2',
            virtualIndex: 2,
            nbVirtuals: endpoints.length
          }
        },
        {
          subject: 's1',
          predicate: 'p1',
          object: 'o1',
          fragment: {
            endpoint: 'e3',
            virtualIndex: 3,
            nbVirtuals: endpoints.length
          }
        }
      ]
    };
    localization.localizeTriple(triple, endpoints).should.deep.equal(expected);
  });

  it('should localize a BGP', () => {
    const endpoints = [ 'e1', 'e2' ];
    const bgp = {
      type: 'bgp',
      triples: [
        { subject: 's1', predicate: 'p1', object: 'o1'},
        { subject: 's2', predicate: 'p2', object: 'o2'}
      ]
    };

    const expected = {
      type: 'bgp',
      triples: [
        {
          type: 'union',
          patterns: [
            {
              subject: 's1',
              predicate: 'p1',
              object: 'o1',
              fragment: {
                endpoint: 'e1',
                virtualIndex: 1,
                nbVirtuals: endpoints.length
              }
            },
            {
              subject: 's1',
              predicate: 'p1',
              object: 'o1',
              fragment: {
                endpoint: 'e2',
                virtualIndex: 2,
                nbVirtuals: endpoints.length
              }
            }
          ]
        },
        {
          type: 'union',
          patterns: [
            {
              subject: 's2',
              predicate: 'p2',
              object: 'o2',
              fragment: {
                endpoint: 'e1',
                virtualIndex: 1,
                nbVirtuals: endpoints.length
              }
            },
            {
              subject: 's2',
              predicate: 'p2',
              object: 'o2',
              fragment: {
                endpoint: 'e2',
                virtualIndex: 2,
                nbVirtuals: endpoints.length
              }
            }
          ]
        }
      ]
    };
    localization.localizeBGP(bgp, endpoints).should.deep.equal(expected);
  });

  it('should localize a BGP with a limit', () => {
    const endpoints = [ 'e1', 'e2' ];
    const bgp = {
      type: 'bgp',
      triples: [
        { subject: 's1', predicate: 'p1', object: 'o1'},
        { subject: 's2', predicate: 'p2', object: 'o2'}
      ]
    };

    const expected = {
      type: 'bgp',
      triples: [
        {
          type: 'union',
          patterns: [
            {
              subject: 's1',
              predicate: 'p1',
              object: 'o1',
              fragment: {
                endpoint: 'e1',
                virtualIndex: 1,
                nbVirtuals: endpoints.length
              }
            },
            {
              subject: 's1',
              predicate: 'p1',
              object: 'o1',
              fragment: {
                endpoint: 'e2',
                virtualIndex: 2,
                nbVirtuals: endpoints.length
              }
            }
          ]
        },
        {
          subject: 's2',
          predicate: 'p2',
          object: 'o2',
          unlocalized: true
        }
      ]
    };
    localization.localizeBGP(bgp, endpoints, 1).should.deep.equal(expected);
  });
});
