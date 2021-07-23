/**
 * Structure des données en mémoire + état initial
 */

'use strict';

let log = require('./log')
  , settings = require('./settings');

let rooms = [];

// retourne le nom de la prochaine salle créée
// 1ère = A (char 65), 2ème = B (char 66) ...
function nextId() {
  if (rooms.length > 26) return;
  return String.fromCharCode(65 + rooms.length);
}

function init() {
  for (let cpt = 0; cpt < settings.get('rooms'); cpt++) {
    create();
  }
}

// création d'une nouvelle salle
// s'appelle A,B,C,...,Z
function create() {
  log('create');
  let nId;
  if (nId = nextId()) {
    let room = {
      id: nId,
      counter: 0,
      started: false,
      timer: null
    };

    rooms.push(room);
    log(`ajout room ${room.id}`);
  }
}

// suppression d'une salle
function destroy(id) {
  if (!rooms.length) {
    return;
  }

  rooms = rooms.filter(item => item.id !== id);

  log(`retrait room ${id}`);
}

// lance le compteur d'une salle
function start(id) {
  let idx = rooms.findIndex(item => item.id === id);
  if (idx === -1) {
    return;
  }

  /*
  if (rooms[idx].started) {
    return;
  }
  */

  log(`start room ${rooms[idx].id} : ${rooms[idx].counter}`);

  rooms[idx].counter++;
  rooms[idx].started = true;
  rooms[idx].timer = setTimeout(function () {
    start(id);
  }, 1000);

  return true;
}

// met en pause une salle
function pause(id) {
  let idx = rooms.findIndex(item => item.id === id);
  if (idx === -1) {
    return;
  }

  if (!rooms[idx].started) {
    return;
  }

  if (rooms[idx].counter > 0) {
    rooms[idx].counter--;
  }

  log(`pause room ${rooms[idx].id} : ${rooms[idx].counter}`);

  clearTimeout(rooms[idx].timer);
  rooms[idx].started = false;
  return true;
}

// remet à zéro le compteur d'une salle
function reset(id) {
  let idx = rooms.findIndex(item => item.id === id);
  if (idx === -1) {
    return;
  }

  log(`reset room ${rooms[idx].id} : ${rooms[idx].counter}`);

  if (rooms[idx].started) {
    rooms[idx].started = false;
    clearTimeout(rooms[idx].timer);
  }

  rooms[idx].counter = 0;
  return true;
}

function dump() {
  return rooms;
}

module.exports = {
  init,
  create,
  destroy,
  start,
  pause,
  reset,
  dump
};
