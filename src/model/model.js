/* file : model.js
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
 * Model represents an instance produced by the cost model.
 * It can be accessed, updated and recomputed during execution.
 * @author Thomas Minier
 */
class Model {
  /**
   * Constructor
   * @param  {string[]} endpoints       - Set of TPF servers of the model
   * @param  {number[]} times           - Initial reponse times of each TPF server
   * @param  {Object[]} triplesPerPage  - Triples served per page per endpoint
   */
  constructor (endpoints, times, triplesPerPage) {
    this._endpoints = endpoints;
    this._times = _.zipObject(endpoints, times);
    this._triplesPerPage = Object.assign({}, triplesPerPage);
    this._weights = {};
    this._minWeight = Infinity;
    this._coefficients = {};
    this._sumCoefs = 0;
    this.computeModel();
  }

  /**
   * Get the weight for a specific endpoint
   * @param  {string} endpoint - The endpoint
   * @return {number} The weight of the endpoint
   */
  getWeight (endpoint) {
    if (!(endpoint in this._weights)) throw new Error('Cannot get the weight of an unknow endpoint/TPF server');
    return this._weights[endpoint];
  }

  /**
   * Get the coefficient for a specific endpoint
   * @param  {string} endpoint - The endpoint
   * @return {int} The coefficient of the endpoint
   */
  getCoefficient (endpoint) {
    if (!(endpoint in this._coefficients)) throw new Error('Cannot get the ceofficient of an unknow endpoint/TPF server');
    return this._coefficients[endpoint];
  }

  /**
   * Set the reponse time for an endpoint
   * @param {string} endpoint - The endpoint
   * @param {number} time     - The new reponse time of the endpoint
   * @return {void}
   */
  setResponseTime (endpoint, time) {
    this._times[endpoint] = time;
  }

  /**
   * (Re)Compute the model using the current response times
   * @return {void}
   */
  computeModel () {
    this._weights = _.mapValues(this._times, (t, e) => this._triplesPerPage[e] / t);
    this._minWeight = Math.min(..._.values(this._weights));
    this._coefficients = _.mapValues(this._weights, w => Math.floor(w / this._minWeight));
    this._sumCoefs = _.values(this._coefficients).reduce((acc, x) => acc + x, 0);
  }

}

module.exports = Model;
