/**
 * Structure des données en mémoire + état initial
 */

'use strict';

let log = require('./log')
  , settings = require('./settings');

let rooms = [];

// retourne l'identifiant de la prochaine salle créée
// 1ère = A (char 65), 2ème = B (char 66) ...
function nextId() {
  if (rooms.length > 26) return;
  return String.fromCharCode(65 + rooms.length);
}

// création initiale des salles
function init() {
  let nb_rooms_to_create = settings.get('rooms');
  for (let cpt = 0; cpt < nb_rooms_to_create; cpt++) {
    create();
  }
}

// création d'une nouvelle salle
function create() {
  let nId;
  if (nId = nextId()) {
    let room = {
      id: nId,
      counter: 0,
      started: false,
      timer: null
    };

    rooms.push(room);
    log(`ajout room ${room.id} OK`);
    return true;
  } else {
    log(`c'est complet`);
    return false;
  }
}

// suppression d'une salle
function destroy(id) {
  let idx = keyById();

  rooms = rooms.filter(item => item.id !== id);
  log(`retrait room ${id} OK`);
}

// lance le compteur d'une salle
function start(id) {
  let idx = keyById(id);

  if (rooms[idx].started) {
    throw new Error(`chrono déjà lancé pour salle ${id}`)
  }

  log(`start room ${id}`);

  rooms[idx].started = true;
  rooms[idx].timer = setInterval(() => {
    updateCounter(id);
  }, 1000);

  return true;
}

function updateCounter(id) {
  let idx = keyById(id);

  rooms[idx].counter++;

  if (rooms[idx].counter >= (60 * 60)) {
    rooms[idx].counter = 0; // 1 heure max
  }

  log(`room ${id} : ${rooms[idx].counter}`)

  return true;
}

function keyById(id) {
  let idx = rooms.findIndex(item => item.id === id);
  if (idx === -1) {
    throw new Error(`salle ${id} introuvable`);
  }
  return idx;
}

// met en pause une salle
function pause(id) {
  let idx = keyById(id);

  if (!rooms[idx].started) {
    throw new Error(`chrono n'était pas lancé pour salle ${id}`)
  }

  log(`pause room ${rooms[idx].id}`);

  clearInterval(rooms[idx].timer);
  rooms[idx].started = false;

  return true;
}

// remet à zéro le compteur d'une salle
function reset(id) {
  let idx = keyById(id);

  log(`reset room ${rooms[idx].id}`);

  if (rooms[idx].started) {
    rooms[idx].started = false;
    clearTimeout(rooms[idx].timer);
  }

  rooms[idx].counter = 0;

  return true;
}

function fullDump() {
  return rooms;
}

function dump() {
  return rooms.map(item => {
    return {
      id: item.id,
      counter: item.counter,
      started: item.started
    }
  });
}

module.exports = {
  init,
  create,
  destroy,
  start,
  pause,
  reset,
  fullDump,
  dump
};
