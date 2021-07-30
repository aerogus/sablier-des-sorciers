/*globals settings, io */

'use strict';

// tableau des salles
let rooms = [];

// id de la salle courante
let room = null;

// timer de la salle courante
//let timer = null;

// compteur de la salle courante
//let counter = 0;

// connexion ws
let socket = null;

// initialisation de l'application
function init() {
  console.log('init');

  socket = io(settings.server);
  socket.emit('DUMP'); // demande du contenu mémoire du serveur

  // quelques écouteurs boutons + clavier
  handleKeyPressed();
  handleBtnsCmd();
  handleBtnsGo();

  // aller dans la bonne salle
  room = settings.room;
  goToRoom(room);

  socket.on('connect', () => {
    console.log(`[OK] connecté à ${settings.server}`);
  });

  socket.on('connect_error', () => {
    console.log(`[KO] ${settings.server} non démarré ?`);
  });

  socket.on('disconnect', () => {
    console.log(`[OK] déconnecté de ${settings.server}`);
  });

  socket.on('DUMPED', (data) => {
    console.log('DUMPED reçu');
    // traitement des données initiales reçues
    console.log(data);
    rooms = data.rooms;
    rooms.forEach((room, idx) => {
      console.log('dump ' + room.id);
      if (rooms[idx].started) {
        console.log('lancement chrono pour room ' + room.id);
        rooms[idx].timer = setInterval(() => {
          updateTimer(room.id);
        }, 1000);
      }
    });
  });

  // reçu l'événement START
  socket.on('START', (roomId) => {
    console.log(`START reçu pour room ${roomId}`);
    startTimer(roomId);
  });

  // reçu l'événement PAUSE
  socket.on('PAUSE', (roomId) => {
    console.log(`PAUSE reçu pour room ${roomId}`);
    pauseTimer(roomId);
  });

  // reçu l'événement RESET
  socket.on('RESET', (roomId) => {
    console.log(`RESET reçu pour room ${roomId}`);
    resetTimer(roomId);
  });
}

function handleBtnsGo() {
  document.querySelectorAll('.btn_go').forEach((btn) => {
    btn.addEventListener('click', () => {
      goToRoom(btn.dataset.go);
    });
  });
}

function handleBtnsCmd() {
  document.querySelectorAll('.btn_cmd').forEach((btn) => {
    btn.addEventListener('click', () => {
      switch (btn.dataset.cmd) {
        case 'START':
          startTimer(room);
          break;
        case 'PAUSE':
          pauseTimer(room);
          break;
        case 'RESET':
          resetTimer(room);
          break;
      }
    });
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
        if (room) {
          console.log(`touche S pressée pour room ${room}`);
          startTimer(room);
        }
        break;

      case "P": // PAUSE
        if (room) {
          console.log(`touche P pressée pour room ${room}`);
          pauseTimer(room);
        }
        break;

      case "Z": // RESET
        if (room) {
          console.log(`touche Z pressée pour room ${room}`);
          resetTimer(room);
        }
        break;
    }

  }, false);

}

// retourne la clé de la salle à partir de l'id
function keyById(id) {
  let idx = rooms.findIndex(item => item.id === id);
  if (idx === -1) {
    return;
  }
  return idx;
}

// préciser le n° de salle
function displayClock(roomId) {
  let idx = keyById(roomId);
  console.log('idx = ' + idx);
  let counter = rooms[idx].counter;
  let struct = {
    min: Math.floor(counter / 60),
    sec: counter % 60
  };
  document.getElementById('min').innerHTML = struct.min.toString().padStart(2, '0');
  document.getElementById('sec').innerHTML = struct.sec.toString().padStart(2, '0');
}

// changement de salle
function goToRoom(roomId) {
  room = roomId;

  let title = '';

  document.querySelector('.btn_go.selected').classList.remove('selected');
  document.querySelector('.btn_go[data-go="'+roomId+'"]').classList.add('selected');

  if (!roomId) {
    title = 'Tableau de bord';
    document.getElementById('btns_cmd').style.display = 'none';
  } else {
    title= `Salle ${roomId}`;
    document.getElementById('btns_cmd').style.display = 'flex';
  }

  document.getElementById('room-name').innerHTML = title
}

// démarre le timer de la salle courante
function startTimer(roomId) {
  if (!roomId) return;

  socket.emit('START', {room: roomId});

  let idx = keyById(roomId);

  displayClock();
  document.getElementById('dot').classList.toggle('tictac');
  counter++;
  rooms[idx].timer = setInterval(() => {
    updateTimer(roomId);
  }, 1000);
}

function updateTimer(roomId) {

}

// met en pause le timer de la salle courante
function pauseTimer(roomId) {
  if (!roomId) return;

  let idx = keyById(roomId);

  if (counter > 0) {
    counter--;
  }

  socket.emit('PAUSE', {room: roomId});

  clearInterval(rooms[idx].timer);
}

// remet à zéro le timer de la salle courante
function resetTimer(roomId) {
  if (!roomId) return;

  let idx = keyById(roomId);

  socket.emit('RESET', {room: roomId});

  if (rooms[idx].started) {
    clearInterval(rooms[idx].timer);
  }

  rooms[idx].counter = 0;

  displayClock();
}

export {
  init,
};
