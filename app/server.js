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

// connexion d'un client
io.on('connection', socket => {

  log('client connected');

  // demande le contenu de la mémoire
  socket.on('DMP', () => {
    log('DMP received');
    socket.emit('DMP', {"data": "coucou"});
    log('DMP emitted');
  });

  // déconnexion du client
  socket.on('disconnect', () => {
    log('client disconnected');
  });

});

// démarrage serveur
log(`${settings.server.HOST} server starting...`);

server.listen(settings.server.PORT, () => {
  log(`listening to port ${settings.server.PORT}`);
});

app.disable('x-powered-by');

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

// route principale
app.get(/^\/$/, (req, res) => {
  res.render('index', {
    ws_host: settings.server.HOST,
    ws_port: settings.server.PORT
  });
});

// route admin
app.get(/^\/admin$/, (req, res) => {
  res.render('admin', {
    ws_host: settings.server.HOST,
    ws_port: settings.server.PORT
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
  log(`SIGTERM: shutting down ${settings.server.HOST} server...`);
  process.exit();
});

// écoute le signal INT (ex: Ctrl-C)
process.on('SIGINT', () => {
  log(`SIGINT: shutting down ${settings.server.HOST} server...`);
  process.exit();
});
