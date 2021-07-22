/*globals settings, $, io */

'use strict';

let timer = null;
let counter = 0;
let socket = null;

function init() {
  console.log('init');
  socket = io(settings.host);
  socket.emit('DUMP');

  initRoomName();
  handleKeyPressed();
  handleBtns();

  socket.on('connect', () => {
    console.log(`[OK] connecté à ${settings.host}`);
  });

  socket.on('connect_error', () => {
    console.log(`[KO] ${settings.host} non démarré`);
  });

  socket.on('disconnect', () => {
    console.log(`[OK] déconnecté de ${settings.host}`);
  });

  socket.on('DUMP', (data) => {
    console.log('DUMP reçu');
    console.log(data);
    // traitement des données initiales reçues
  });

  socket.on('START', (roomId) => {
    console.log('START reçu');
    console.log(roomId);
  });

  socket.on('PAUSE', (roomId) => {
    console.log('PAUSE reçu');
    console.log(roomId);
  });

  socket.on('RESET', (roomId) => {
    console.log('RESET reçu');
    console.log(roomId);
  });
}

export {init};

function handleBtns() {
  document.getElementById('btn_start').addEventListener('click', () => {
    console.log(`click START pour room ${settings.room}`);
    socket.emit('START', {room: settings.room});
    startTimer();
  });
  document.getElementById('btn_pause').addEventListener('click', () => {
    console.log(`click PAUSE pour room ${settings.room}`);
    socket.emit('PAUSE', {room: settings.room});
    pauseTimer();
  });
  document.getElementById('btn_reset').addEventListener('click', () => {
    console.log(`click RESET pour room ${settings.room}`);
    socket.emit('RESET', {room: settings.room});
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
        socket.emit('START', {room: room});
        startTimer();
        break;

      case "P": // PAUSE
        console.log(`touche P pressée pour room ${room}`);
        socket.emit('PAUSE', {room: room});
        pauseTimer();
        break;

      case "Z": // RESET
        console.log(`touche Z pressée pour room ${room}`);
        socket.emit('RESET', {room: room});
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

function startTimer() {
  displayClock();
  counter++;
  timer = setTimeout(startTimer, 1000);
}

function pauseTimer() {
  clearTimeout(timer);
}

function resetTimer() {
  clearTimeout(timer);
  counter = 0;
  displayClock();
}
