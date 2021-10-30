#!/usr/bin/env node

/**
 * Serveur temps réel du moteur du sablier des sorciers
 * reçoit et broadcast des messages websocket
 */

'use strict';

const express = require('express')
  , fs = require('fs')
  , http = require('http')
  , https = require('https');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/sablier-des-sorciers.aerogus.net/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/sablier-des-sorciers.aerogus.net/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/sablier-des-sorciers.aerogus.net/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

const app = express();

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
const io = require('socket.io')(httpsServer);

const settings = require('./lib/settings')
  , log = require('./lib/log')
  , utils = require('./lib/utils')
  , rooms = require('./lib/rooms')
  , auth = require('./lib/auth');

// connexion d'un client
io.on('connection', socket => {

  log(`client connecté : ${socket.handshake.headers.host}`);

  // demande le contenu de la mémoire
  socket.on('DUMP', () => {
    log('DUMP reçu');
    // todo émettre qu'au client, pas à tous
    socket.emit('DUMPED', {
      "rooms": rooms.dump()
    });
    log('DUMPED émis');
    log(rooms.dump());
  });

  // START compteur
  socket.on('START', params => {
    log(`START reçu pour salle ${params.room}`);
    rooms.startCounter(params.room);
    socket.broadcast.emit('STARTED', {room: params.room});
    log(`STARTED broadcasté`);
  });

  // PAUSE compteur
  socket.on('PAUSE', params => {
    log(`PAUSE reçu pour salle ${params.room}`);
    rooms.pauseCounter(params.room);
    socket.broadcast.emit('PAUSED', {room: params.room});
    log(`PAUSED broadcasté`);
  });

  // RESET compteur
  socket.on('RESET', params => {
    log(`RESET reçu pour salle ${params.room}`);
    rooms.resetCounter(params.room);
    socket.broadcast.emit('RESETED', {room: params.room});
    log(`RESETED broadcasté`);
  });

  // déconnexion du client
  socket.on('disconnect', () => {
    log(`client déconnecté : ${socket.handshake.headers.host}`);
  });

});

log(`------`);
log(`titre   : ${settings.get('title')}`);
log(`version : ${settings.get('version')}`);
log(`auteur  : ${settings.get('author')}`);
log(`url     : ${settings.get('url')}`);
log(`------`);

log('Liste des interfaces réseau:')
log(utils.getIp());

rooms.init();
log('rooms:');
log(rooms.fullDump());

// démarrage serveur
log(`serveur ${settings.get('host')} en cours de démarrage...`);

httpServer.listen(settings.get('port'), () => {
  log(`écoute sur le port ${settings.get('port')}`);
});

httpsServer.listen(443, () => {
  log(`écoute sur le port 443`);
});

app.use(auth);

app.disable('x-powered-by');

app.use((req, res, next) => {
  req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

// route principale
app.get('/:room([A-Z])?', (req, res) => {
  res.render('index', {
    room: req.params.room,
    ws_host: settings.get('host'),
    ws_port: settings.get('port'),
    ws_port_secure: settings.get('port_secure')
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
