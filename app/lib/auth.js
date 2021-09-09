/**
 * Protection par mot de passe
 */

'use strict';

const auth = require('basic-auth');

const admin = { name: 'harry', password: 'potter' };

module.exports = function (request, response, next) {
  let user = auth(request);
  if (!user || !admin.name || admin.password !== user.pass) {
    response.set('WWW-Authenticate', 'Basic realm="example"');
    return response.status(401).send();
  }
  return next();
}

