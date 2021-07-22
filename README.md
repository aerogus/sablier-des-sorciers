# Sablier des sorciers

Compteurs multi salles pour un escape game autour du thème de Harry Potter

## Prérequis

* node.js stable (actuellement v14)
* npm
* git

Une ou plusieurs machines/écran reliées au même réseau local (via wifi ou ethernet). Pas besoin de la connectivité internet, tout peut tourner localement.

## Installation

Récupération des sources

```
git clone https://github.com/aerogus/sablier-des-sorciers.git
cd sablier-des-sorciers
```

Adaptez le fichier `conf/settings.json` pour saisir l'ip de la machine serveur, le nombre de rooms...

Si Docker est installé, vous pouvez utiliser la commande suivante :

```
docker run -p 80:80 .
```

sinon

```
npm install
npm start
```

Devrait afficher

```
> sablier-des-sorciers@1.0.0 start /Users/gus/workspace/sablier-des-sorciers
> ./app/server.js

[2021-07-13 11:35:29] '127.0.0.1 server starting...'
[2021-07-13 11:35:29] 'listening to port 80'
```

Allez maintenant avec votre navigateur à l'url `http://127.0.0.1`

Pour lancer le serveur au démarrage de la machine, sous Debian avec systemd, en root (ou préfixé par sudo) :

```
cp ./services/sablier-des-sorciers.service /etc/systemd/system
systemctl daemon-reload
systemctl enable sablier-des-sorciers
systemctl start sablier-des-sorciers
```

## Ressources

* exemple de décompte, vidéo YouTube: https://www.youtube.com/watch?v=UeQAarcw000
* Utilisation du logiciel Max: https://www.youtube.com/watch?v=xA_VLpMBRZE
