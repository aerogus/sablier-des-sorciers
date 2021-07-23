#!/usr/bin/env node

/**
 * Serveur temps réel du moteur du sablier des sorciers
 * reçoit et broadcast des messages websocket
 */

 'use strict';

 const express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , io = require('socket.io')(server);

const settings = require('./lib/settings')
  , log = require('./lib/log')
  , utils = require('./lib/utils')
  , rooms = require('./lib/rooms');

// connexion d'un client
io.on('connection', socket => {

  log(`client connecté : ${socket.handshake.headers.host}`);

  // demande le contenu de la mémoire
  socket.on('DUMP', () => {
    log('DUMP reçu');
    socket.emit('DUMP', {
      "rooms": rooms.dump()
    });
    log('DUMP émis');
  });

  // START compteur
  socket.on('START', params => {
    log(params);
    log(`START reçu pour salle ${params.room}`);
    rooms.start(params.room);
    log(`START émis pour salle ${params.room}`);
  });

  // PAUSE compteur
  socket.on('PAUSE', params => {
    log(params);
    log(`PAUSE reçu pour salle ${params.room}`);
    rooms.pause(params.room);
    log(`PAUSE émis pour salle ${params.room}`);
  });

  // RESET compteur
  socket.on('RESET', params => {
    log(params);
    log(`RESET reçu pour salle ${params.room}`);
    rooms.reset(params.room);
    log(`RESET émis pour salle ${params.room}`);
  });

  // déconnexion du client
  socket.on('disconnect', () => {
    log(`client déconnecté : ${socket.handshake.headers.host}`);
  });

});

log('Liste des interfaces réseau:')
log(utils.getIp());

settings.set('host', utils.getIp()['en0'][0]);
rooms.init();
log(rooms.dump());

// démarrage serveur
log(`serveur ${settings.get('host')} en cours de démarrage...`);

server.listen(settings.get('port'), () => {
  log(`écoute sur le port ${settings.get('port')}`);
  log(`------`);
  log(`version : ${settings.get('version')}`);
  log(`auteur  : ${settings.get('author')}`);
  log(`url     : ${settings.get('url')}`);
  log(`------`);
});

app.disable('x-powered-by');

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

// route principale
app.get('/:room([A-Z])?', (req, res) => {
  res.render('index', {
    room: req.params.room,
    ws_host: settings.get('host'),
    ws_port: settings.get('port')
  });
});

app.use(express.static(`${__dirname}/../public`), (req, res, next) => {
  // cache busting
  req.url = req.url.replace(/\/([^\/]+)\.[0-9]+\.(min\.)?(css|js)$/, '/$1.$2$3');
  next();
});
app.use(express.static(`${__dirname}/../public`));

// écoute le signal TERM (ex: kill)
process.on('SIGTERM', () => {
  log(`SIGTERM: arrêt du serveur ${settings.get('host')}...`);
  process.exit();
});

// écoute le signal INT (ex: Ctrl-C)
process.on('SIGINT', () => {
  log(`SIGINT: arrêt du serveur ${settings.get('host')}...`);
  process.exit();
});
