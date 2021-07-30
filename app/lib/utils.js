/**
 * Module utilitaire
 */

'use strict';

const { networkInterfaces } = require('os');

module.exports = {

  getIp() {
    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }

    return results;
  },

  // conversion secondes en XX:XX
  formatDate(counter) {
    let struct = {
      min: Math.floor(counter / 60),
      sec: counter % 60
    };
    return struct.min.toString().padStart(2, '0') + ':' + struct.sec.toString().padStart(2, '0');
  }

};
