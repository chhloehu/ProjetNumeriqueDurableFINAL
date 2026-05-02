/*const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/turtle_safe.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT,
      role TEXT DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS signalements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      lieu TEXT,
      urgent INTEGER,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;*/


/////
// db/database.js — Connexion et initialisation de la base SQLite
// Utilise le module natif Node.js 22 (node:sqlite) → zéro dépendance npm

'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'turtle_safe.sqlite'));

// Activer les clés étrangères (pour ON DELETE CASCADE)
db.exec('PRAGMA foreign_keys = ON');

// Créer les tables si elles n'existent pas encore
db.exec(`
  CREATE TABLE IF NOT EXISTS utilisateurs (
    id        INTEGER  PRIMARY KEY AUTOINCREMENT,
    telephone TEXT     NOT NULL UNIQUE,
    mot_passe TEXT     NOT NULL,
    role      TEXT     NOT NULL DEFAULT 'user',
    cree_le   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_util_tel ON utilisateurs(telephone);

  CREATE TABLE IF NOT EXISTS signalements (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER  NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    type_signal TEXT     NOT NULL,
    espece      TEXT,
    lieu_texte  TEXT,
    latitude    REAL,
    longitude   REAL,
    urgent      INTEGER  NOT NULL DEFAULT 0,
    etat        TEXT     NOT NULL DEFAULT 'actif',
    cree_le     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_sig_etat ON signalements(etat);
  CREATE INDEX IF NOT EXISTS idx_sig_user ON signalements(user_id);
`);

module.exports = db;
