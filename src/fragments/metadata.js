'use strict';

const request = require('request');
const _ = require('lodash');

/**
 * Get metadata from a fragment
 * @param  {string} fragment - The url on which the fragment is hosted
 * @return {Object} The fragment metadata
 */
const getMetadata = fragment => {
  const options = {
    url: fragment,
    headers: {
      'accept': 'application/json'
    }
  };
  return new Promise((resolve, reject) => {
    request.get(options, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }
      const data = JSON.parse(body);
      const index = _.findIndex(data['@graph'], obj => '@id' in obj && obj['@id'].includes('#metadata'));
      resolve(data['@graph'][index]);
    });
  });
};

/**
 * Get stats (nb triples per page, etc) from a fragment's metadata
 * @param  {string} fragment - The url on which the fragment is hosted
 * @param  {Object} metadata - The fragment metadata
 * @return {Object} The stats from a fragment's metadata
 */
const getStats = (fragment, metadata) => {
  // console.log(fragment);
  // console.log(JSON.stringify(metadata, false, 2));
  const index = _.findIndex(metadata['@graph'], obj => '@id' in obj && obj['@id'] === fragment);
  return metadata['@graph'][index];
};

module.exports = {
  getMetadata,
  getStats
};
