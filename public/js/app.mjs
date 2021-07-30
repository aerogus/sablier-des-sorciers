/*globals settings, io */

'use strict';

// tableau des salles
let rooms = [];

// id de la salle courante
let room = null;

// connexion serveur
let socket = null;

// initialisation de l'application
function init() {
  console.log('init');

  socket = io(settings.server);
  socket.emit('DUMP'); // demande du contenu mémoire du serveur

  // quelques écouteurs boutons + clavier
  handleBtnsGo();
  handleBtnsCmd();
  handleKeyPressed();

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
      } else {
        rooms[idx].timer = null;
      }
      displayClock(room.id);
    });
  });

  socket.on('STARTED', (params) => {
    console.log(`STARTED reçu pour room ${params.room}`);
    startTimer(params.room, false);
  });

  socket.on('PAUSED', (params) => {
    console.log(`PAUSED reçu pour room ${params.room}`);
    pauseTimer(params.room, false);
  });

  socket.on('RESETED', (params) => {
    console.log(`RESETED reçu pour room ${params.room}`);
    resetTimer(params.room, false);
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
          startTimer(room, true);
          break;
        case 'PAUSE':
          pauseTimer(room, true);
          break;
        case 'RESET':
          resetTimer(room, true);
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
          console.log(`touche S pressée pour room active (${room})`);
          startTimer(room, true);
        }
        break;

      case "P": // PAUSE
        if (room) {
          console.log(`touche P pressée pour room active (${room})`);
          pauseTimer(room, true);
        }
        break;

      case "Z": // RESET
        if (room) {
          console.log(`touche Z pressée pour room active (${room})`);
          resetTimer(room, true);
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

function displayClock(roomId) {
  // formatage
  let idx = keyById(roomId);
  let counter = rooms[idx].counter;
  let struct = {
    min: Math.floor(counter / 60),
    sec: counter % 60
  };
  // affichage
  document.querySelector(`.clock_outer_wrapper[data-room="${roomId}"] .min`).innerHTML = struct.min.toString().padStart(2, '0');
  document.querySelector(`.clock_outer_wrapper[data-room="${roomId}"] .dot`).classList.toggle('tictac');
  document.querySelector(`.clock_outer_wrapper[data-room="${roomId}"] .sec`).innerHTML = struct.sec.toString().padStart(2, '0');
}

// changement de salle
function goToRoom(roomId) {
  // nouvelle salle active
  room = roomId;

  // activation seulement du bouton actif
  document.querySelector('.btn_go.selected').classList.remove('selected');
  document.querySelector(`.btn_go[data-go="${roomId}"]`).classList.add('selected');

  // commande que si on est dans une salle
  if (!roomId) {
    document.getElementById('btns_cmd').style.display = 'none';
  } else {
    document.getElementById('btns_cmd').style.display = 'flex';
  }

  // affichage conditionnel des horloges
  document.querySelectorAll('.clock_outer_wrapper').forEach((item) => {
    item.style.display = 'none';
  });
  
  if (!roomId) {
    document.querySelectorAll('.clock_outer_wrapper').forEach((item) => {
      item.style.display = 'block';
    });
  } else {
    document.querySelector(`.clock_outer_wrapper[data-room="${roomId}"]`).style.display = 'block';

    let idx = keyById(roomId);
    if (rooms[idx].started) {
      document.getElementById('btn_cmd_start').style.display = 'none';
      document.getElementById('btn_cmd_pause').style.display = 'block';
    } else {
      document.getElementById('btn_cmd_start').style.display = 'block';
      document.getElementById('btn_cmd_pause').style.display = 'none';
    }
  }
}

function startTimer(roomId, emit = false) {
  if (!roomId) return;
  let idx = keyById(roomId);

  rooms[idx].started = true;
  rooms[idx].timer = setInterval(() => {
    updateTimer(roomId);
  }, 1000);

  document.getElementById('btn_cmd_start').style.display = 'none';
  document.getElementById('btn_cmd_pause').style.display = 'block';

  if (emit) { // anti larsen
    socket.emit('START', {room: roomId});
  }
}

function updateTimer(roomId) {
  if (!roomId) return;
  let idx = keyById(roomId);

  rooms[idx].counter++;

  displayClock(roomId);
}

function pauseTimer(roomId, emit = false) {
  if (!roomId) return;
  let idx = keyById(roomId);

  if (rooms[idx].started) {
    clearInterval(rooms[idx].timer);
    rooms[idx].started = false;

    document.getElementById('btn_cmd_start').style.display = 'block';
    document.getElementById('btn_cmd_pause').style.display = 'none';
  
    if (emit) { // anti larsen
      socket.emit('PAUSE', {room: roomId});
    }
  }
}

function resetTimer(roomId, emit = false) {
  if (!roomId) return;
  let idx = keyById(roomId);

  if (rooms[idx].started) {
    clearInterval(rooms[idx].timer);
  }

  rooms[idx].started = false;
  rooms[idx].counter = 0;

  displayClock(roomId);

  if (emit) { // anti larsen
    socket.emit('RESET', {room: roomId});
  }
}

export {
  init,
};
