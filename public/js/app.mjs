/*globals settings, $, io */

'use strict';

export class App {

  handleBtns() {
    let room = this.settings.room;
    document.addEventListener('click', function (e) {
      let action = e.target.dataset.cmd;
      switch (action) {
        case 'START':
          console.log(`click START pour room ${room}`);
          this.socket.emit('START', {room});
          break;
        case 'PAUSE':
          console.log(`click PAUSE pour room ${room}`);
          this.socket.emit('PAUSE', {room});
          break;
        case 'RESET':
          console.log(`click RESET pour room ${room}`);
          this.socket.emit('RESET', {room});
          break;
      }
    });
  }

  handleKeyPressed() {
    let room = this.settings.room;
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
          this.socket.emit('START', {room: room});
          break;

        case "P": // PAUSE
          console.log(`touche P pressée pour room ${room}`);
          this.socket.emit('PAUSE', {room: room});
          break;

        case "Z": // RESET
          console.log(`touche Z pressée pour room ${room}`);
          this.socket.emit('RESET', {room: room});
          break;
      }

    }, false);

  }

  constructor() {

    this.settings = {
      // serveur temps réel
      host: settings.ws,
      room: settings.room
    };

    this.socket = io(this.settings.host);
    this.socket.emit('DUMP');

    this.handleKeyPressed();
    this.handleBtns();

    this.socket.on('connect', () => {
      console.log(`[OK] connecté à ${this.settings.host}`);
    });

    this.socket.on('connect_error', () => {
      console.log(`[KO] ${this.settings.host} non démarré`);
    });

    this.socket.on('disconnect', () => {
      console.log(`[OK] déconnecté de ${this.settings.host}`);
    });

    this.socket.on('DUMP', () => {
      // traitement des données initiales reçues
    });

    this.socket.on('START', (roomId) => {
      console.log('START reçu');
      console.log(roomId);
    });

    this.socket.on('PAUSE', (roomId) => {
      console.log('PAUSE reçu');
      console.log(roomId);
    });

    this.socket.on('RESET', (roomId) => {
      console.log('RESET reçu');
      console.log(roomId);
    });

  }

}
