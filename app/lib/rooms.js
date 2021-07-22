/**
 * Structure des données en mémoire + état initial
 */

'use strict';

let log = require('./log')
  , settings = require('./settings');

module.exports = {

  rooms: [],

  load() {
    settings.rooms.each()
  },

  save() {

  },

  create(id) {
    let room = {
        id,
        counter: 0,
        started: 0,
    };
    this.rooms.push(room);

    log(`ajout room ${id}`);
  },

  delete(id) {
    if (!this.rooms.length) {
      return;
    }

    this.rooms = this.rooms.filter(item => item.id !== id);

    log(`retrait room ${id}`);
  },

  start(id) {
    let idx;
    if (idx = this.rooms.findIndex(item => item.id === id) !== -1) {
      this.rooms[idx].counter = 0;
      this.rooms[idx].started = true;
      return true;
    }
    return false;
  },

  pause(id) {
    let idx;
    if (idx = this.rooms.findIndex(item => item.id === id) !== -1) {
      this.rooms[idx].started = false;
      return true;
    }
    return false;
  },

  reset(id) {
    let idx;
    if (idx = this.rooms.findIndex(item => item.id === id) !== -1) {
      this.rooms[idx].counter = 0;
      this.rooms[idx].started = false;
      return true;
    }
    return false;
  },

  dump() {
      return this.rooms;
  }

};
