/*globals settings, $, io */

'use strict';

// timer de la salle courante
let timer = null;
// compteur de la salle courante
let counter = 0;
let socket = null;

// initialisation de l'application
function init() {
  console.log('init');

  socket = io(settings.server);
  socket.emit('DUMP');

  initRoomName();
  handleKeyPressed();
  handleBtns();

  socket.on('connect', () => {
    console.log(`[OK] connecté à ${settings.server}`);
  });

  socket.on('connect_error', () => {
    console.log(`[KO] ${settings.server} non démarré`);
  });

  socket.on('disconnect', () => {
    console.log(`[OK] déconnecté de ${settings.server}`);
  });

  socket.on('DUMP', (data) => {
    console.log('DUMP reçu');
    console.log(data);
    // traitement des données initiales reçues
  });

  // reçu l'événement START
  socket.on('START', (room) => {
    console.log('START reçu');
    if (settings.room === '' || settings.room === room) {
      console.log(`traitement START ${room}`);
    }
  });

  // reçu l'événement PAUSE
  socket.on('PAUSE', (room) => {
    console.log('PAUSE reçu');
    if (settings.room === '' || settings.room === room) {
      console.log(`traitement PAUSE ${room}`);
    }
  });

  // reçu l'événement RESET
  socket.on('RESET', (room) => {
    console.log('RESET reçu');
    if (settings.room === '' || settings.room === room) {
      console.log(`traitement RESET ${room}`);
    }
  });
}

export {init};

function handleBtns() {
  document.getElementById('btn_start').addEventListener('click', () => {
    console.log(`click START pour room ${settings.room}`);
    startTimer();
  });
  document.getElementById('btn_pause').addEventListener('click', () => {
    console.log(`click PAUSE pour room ${settings.room}`);
    pauseTimer();
  });
  document.getElementById('btn_reset').addEventListener('click', () => {
    console.log(`click RESET pour room ${settings.room}`);
    resetTimer();
  });
}

function handleKeyPressed() {
  let room = settings.room;
  document.addEventListener("keydown", (e) => {
    let key = e.key.toUpperCase();
    switch (key) {

      case "F": // Full Screen on/off
        console.log(`touche F pressée pour room ${room}`);
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen(); 
          }
        }
        break;

      case "S": // START
        console.log(`touche S pressée pour room ${room}`);
        startTimer();
        break;

      case "P": // PAUSE
        console.log(`touche P pressée pour room ${room}`);
        pauseTimer();
        break;

      case "Z": // RESET
        console.log(`touche Z pressée pour room ${room}`);
        resetTimer();
        break;
    }

  }, false);

}

function displayClock() {
  let struct = {
    min: Math.floor(counter / 60),
    sec: counter % 60
  };
  document.getElementById('min').innerHTML = struct.min.toString().padStart(2, '0');
  document.getElementById('sec').innerHTML = struct.sec.toString().padStart(2, '0');
}

function initRoomName() {
  document.getElementById('room-name').innerHTML = `Salle ${settings.room}`;
}

// démarre le timer de la salle courante
function startTimer() {
  if (!settings.room) return;

  socket.emit('START', {room: settings.room});

  displayClock();
  document.getElementById('dot').classList.toggle('tictac');
  counter++;
  timer = setTimeout(startTimer, 1000);
}

// met en pause le timer de la salle courante
function pauseTimer() {
  if (!settings.room) return;

  if (counter > 0) {
    counter--;
  }

  socket.emit('PAUSE', {room: settings.room});

  clearTimeout(timer);
}

// remet à zéro le timer de la salle courante
function resetTimer() {
  if (!settings.room) return;

  socket.emit('RESET', {room: settings.room});

  clearTimeout(timer);
  counter = 0;
  displayClock();
}
