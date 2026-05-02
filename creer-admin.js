// creer-admin.js — Script utilitaire pour créer un compte administrateur
// Usage : node --experimental-sqlite creer-admin.js
// À exécuter UNE SEULE FOIS avant la démo.

'use strict';

const { DatabaseSync } = require('node:sqlite');
const bcrypt           = require('bcryptjs');
const path             = require('path');

const db = new DatabaseSync(path.join(__dirname, 'db', 'turtle_safe.sqlite'));

// ── Paramètres du compte admin (à changer avant utilisation) ──────────────
const TELEPHONE  = '0600000000';  // ← changez ce numéro
const MOT_PASSE  = 'admin123';    // ← changez ce mot de passe

// Hacher le mot de passe avant de l'insérer en base
const hash = bcrypt.hashSync(MOT_PASSE, 10);

try {
  db.prepare(
    "INSERT INTO utilisateurs (telephone, mot_passe, role) VALUES (?, ?, 'admin')"
  ).run(TELEPHONE, hash);

  console.log(`✅ Compte admin créé avec succès !`);
  console.log(`   Téléphone : ${TELEPHONE}`);
  console.log(`   Mot de passe : ${MOT_PASSE}`);
  console.log(`   ⚠️  Pensez à changer ces identifiants avant la démo.`);

} catch(e) {
  if (e.message.includes('UNIQUE')) {
    console.log(`⚠️  Ce numéro existe déjà en base.`);
  } else {
    console.error('Erreur :', e.message);
  }
}
