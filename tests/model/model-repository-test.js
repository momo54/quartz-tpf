/* file : model-repository-test.js
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
const ldf = require('ldf-client');
const Model = require('../../src/model/model.js');
const ModelRepository = require('../../src/model/model-repository.js');
ldf.Logger.setLevel('WARNING');

describe('ModelRepository', () => {
  const client = new ldf.FragmentsClient('http://fragments.dbpedia.org/2016-04/en');
  it('should compute a model for a query and a set of TPF servers', done => {
    const repo = new ModelRepository(client);
    const query = 'select * where { ?s <http://dbpedia.org/property/page> ?o .}';
    const servers = [ 'http://fragments.dbpedia.org/2016-04/en', 'http://fragments.dbpedia.org/2016-04/en' ];
    repo.getModel(query, servers)
    .then(model => {
      model.id.should.equal(Model.genID(query, servers));
      model._query.should.equals(query);
      model._servers.should.equals(servers);
      model._cardinalities.should.deep.equals({
        '{"subject":"?s","predicate":"http://dbpedia.org/property/page","object":"?o"}': 856994
      });
      model._triplesPerPage.should.deep.equal({
        'http://fragments.dbpedia.org/2016-04/en': 100
      });
      model.getCoefficient('http://fragments.dbpedia.org/2016-04/en').should.equal(1);
      model._sumCoefs.should.equals(1);
      done();
    })
    .catch(err => done(err));
  }).timeout(500);
});
