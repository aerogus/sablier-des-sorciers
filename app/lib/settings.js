/**
 * chargement des paramètres de l'app
 */

'use strict';

const fs = require('fs');

const settingsFile = `${__dirname}/../../conf/settings.json`;

module.exports = {

  data: {},
  loaded: false,

  load() {
    if (Object.keys(this.data).length === 0) {
      this.data = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      this.loaded = true;
    }
  },

  get(fieldName) {
    // lazy loading
    if (!this.loaded) {
      this.load();
    }
    return this.data[fieldName];
  },

  set(fieldName, value) {
    // lazy loading
    if (!this.loaded) {
      this.load();
    }
    this.data[fieldName] = value;
  },

  save() {
    // on n'écrase pas si pas chargé !
    if (this.loaded) {
      fs.writeFileSync(settingsFile, JSON.stringify(this.data));
    }
  }
}
