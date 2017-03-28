/* file : cost-model.js
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
 * Compute the cost model using a list of endpoints and their respective reponse times
 * @param  {string[]} endpoints - The endpoints of the model
 * @param  {number[]} times     - The reponse time of each endpoint
 * @return {Object} The coefficient of the cost model for each endpoint and the sum of all coefficients
 */
const computeModel = (endpoints, times) => {
  const weights = times.map(t => 1 / t);
  const minWeight = Math.min(...weights);
  const coefs = weights.map(w => Math.floor(w / minWeight));
  return {
    coefficients: _.zipObject(endpoints, coefs),
    sumCoefs: coefs.reduce((acc, c) => acc + c, 0)
  };
};

module.exports = computeModel;
