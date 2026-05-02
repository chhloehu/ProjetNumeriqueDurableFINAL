// routes/signalements.js — CRUD signalements
/*'use strict';

const express = require('express');
const TYPES_VALIDES = ['tortue_blessee', 'nid_expose', 'danger'];

module.exports = function(db, requireAuth) {
  const router = express.Router();

  // GET /api/signalements — Liste publique des signalements actifs
  router.get('/', (req, res) => {
    const rows = db.prepare(`
      SELECT s.id, s.type_signal, s.espece, s.lieu_texte,
             s.latitude, s.longitude, s.urgent, s.etat, s.cree_le,
             u.telephone AS auteur
      FROM   signalements s
      JOIN   utilisateurs u ON s.user_id = u.id
      WHERE  s.etat = 'actif'
      ORDER  BY s.cree_le DESC
      LIMIT  100
    `).all();
    res.json(rows);
  });

  // GET /api/signalements/mes — Mes signalements (connecté)
  router.get('/mes', requireAuth, (req, res) => {
    const rows = db.prepare(`
      SELECT id, type_signal, espece, lieu_texte,
             latitude, longitude, urgent, etat, cree_le
      FROM   signalements
      WHERE  user_id = ?
      ORDER  BY cree_le DESC
    `).all(req.session.userId);
    res.json(rows);
  });

  // POST /api/signalements — Créer un signalement
  router.post('/', requireAuth, (req, res) => {
    const { type_signal, espece, lieu_texte, latitude, longitude, urgent } = req.body;

    if (!type_signal || !TYPES_VALIDES.includes(type_signal))
      return res.status(400).json({ erreur: 'Type de signalement invalide' });

    if (!lieu_texte && (!latitude || !longitude))
      return res.status(400).json({ erreur: 'Veuillez indiquer un lieu ou des coordonnées GPS' });

    const info = db.prepare(`
      INSERT INTO signalements
        (user_id, type_signal, espece, lieu_texte, latitude, longitude, urgent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.session.userId,
      type_signal,
      espece     || null,
      lieu_texte || null,
      latitude   ? parseFloat(latitude)  : null,
      longitude  ? parseFloat(longitude) : null,
      urgent     ? 1 : 0
    );

    res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
  });

  // PUT /api/signalements/:id — Modifier (auteur ou admin)
  router.put('/:id', requireAuth, (req, res) => {
    const s = db.prepare('SELECT * FROM signalements WHERE id = ?').get(req.params.id);
    if (!s) return res.status(404).json({ erreur: 'Signalement introuvable' });

    if (Number(s.user_id) !== req.session.userId && req.session.role !== 'admin')
      return res.status(403).json({ erreur: 'Non autorisé' });

    const { type_signal, espece, lieu_texte, latitude, longitude, urgent, etat } = req.body;

    db.prepare(`
      UPDATE signalements SET
        type_signal = COALESCE(?, type_signal),
        espece      = COALESCE(?, espece),
        lieu_texte  = COALESCE(?, lieu_texte),
        latitude    = COALESCE(?, latitude),
        longitude   = COALESCE(?, longitude),
        urgent      = COALESCE(?, urgent),
        etat        = COALESCE(?, etat)
      WHERE id = ?
    `).run(
      type_signal || null,
      espece      || null,
      lieu_texte  || null,
      latitude    ? parseFloat(latitude)  : null,
      longitude   ? parseFloat(longitude) : null,
      urgent !== undefined ? (urgent ? 1 : 0) : null,
      etat        || null,
      req.params.id
    );

    res.json({ ok: true });
  });

  // DELETE /api/signalements/:id — Supprimer (auteur ou admin)
  router.delete('/:id', requireAuth, (req, res) => {
    const s = db.prepare('SELECT * FROM signalements WHERE id = ?').get(req.params.id);
    if (!s) return res.status(404).json({ erreur: 'Signalement introuvable' });

    if (Number(s.user_id) !== req.session.userId && req.session.role !== 'admin')
      return res.status(403).json({ erreur: 'Non autorisé' });

    db.prepare('DELETE FROM signalements WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};*/
/*
const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/', (req, res) => {
  const { description, lieu, urgent } = req.body;

  db.run(
    'INSERT INTO signalements (description, lieu, urgent) VALUES (?, ?, ?)',
    [description, lieu, urgent],
    () => res.json({ message: 'Signalement ajouté' })
  );
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM signalements', [], (err, rows) => {
    res.json(rows);
  });
});

module.exports = router;*/


/////
// routes/signalements.js — CRUD complet des signalements
// Pagination LIMIT/OFFSET + colonnes explicites = Green IT

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

const TYPES_VALIDES = ['tortue_blessee', 'nid_expose', 'danger'];

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ erreur: 'Vous devez être connecté' });
  next();
}

// ── GET /api/signalements — Liste publique paginée ────────────────────────
router.get('/', (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;

  const rows = db.prepare(`
    SELECT s.id, s.type_signal, s.espece, s.lieu_texte,
           s.latitude, s.longitude, s.urgent, s.etat, s.cree_le,
           u.telephone AS auteur
    FROM   signalements s
    JOIN   utilisateurs u ON s.user_id = u.id
    WHERE  s.etat = 'actif'
    ORDER  BY s.cree_le DESC
    LIMIT  ? OFFSET ?
  `).all(limit, offset);

  res.json(rows);
});

// ── GET /api/signalements/mes — Mes signalements (connecté) ──────────────
router.get('/mes', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, type_signal, espece, lieu_texte,
           latitude, longitude, urgent, etat, cree_le
    FROM   signalements
    WHERE  user_id = ?
    ORDER  BY cree_le DESC
    LIMIT  50
  `).all(req.session.userId);

  res.json(rows);
});

// ── POST /api/signalements — Créer un signalement ────────────────────────
router.post('/', requireAuth, (req, res) => {
  const { type_signal, espece, lieu_texte, latitude, longitude, urgent } = req.body;

  if (!type_signal || !TYPES_VALIDES.includes(type_signal))
    return res.status(400).json({ erreur: 'Type de signalement invalide' });
  if (!lieu_texte && (!latitude || !longitude))
    return res.status(400).json({ erreur: 'Indiquez un lieu ou des coordonnées GPS' });

  const result = db.prepare(`
    INSERT INTO signalements
      (user_id, type_signal, espece, lieu_texte, latitude, longitude, urgent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.session.userId,
    type_signal,
    espece     || null,
    lieu_texte || null,
    latitude   ? parseFloat(latitude)  : null,
    longitude  ? parseFloat(longitude) : null,
    urgent     ? 1 : 0
  );

  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
});

// ── PUT /api/signalements/:id — Modifier (auteur ou admin) ───────────────
router.put('/:id', requireAuth, (req, res) => {
  const s = db.prepare('SELECT id, user_id FROM signalements WHERE id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ erreur: 'Signalement introuvable' });

  if (Number(s.user_id) !== req.session.userId && req.session.role !== 'admin')
    return res.status(403).json({ erreur: 'Non autorisé' });

  const { type_signal, espece, lieu_texte, latitude, longitude, urgent, etat } = req.body;

  db.prepare(`
    UPDATE signalements SET
      type_signal = COALESCE(?, type_signal),
      espece      = COALESCE(?, espece),
      lieu_texte  = COALESCE(?, lieu_texte),
      latitude    = COALESCE(?, latitude),
      longitude   = COALESCE(?, longitude),
      urgent      = COALESCE(?, urgent),
      etat        = COALESCE(?, etat)
    WHERE id = ?
  `).run(
    type_signal || null,
    espece      || null,
    lieu_texte  || null,
    latitude    ? parseFloat(latitude)  : null,
    longitude   ? parseFloat(longitude) : null,
    urgent !== undefined ? (urgent ? 1 : 0) : null,
    etat        || null,
    req.params.id
  );

  res.json({ ok: true });
});

// ── DELETE /api/signalements/:id — Supprimer (auteur ou admin) ───────────
router.delete('/:id', requireAuth, (req, res) => {
  const s = db.prepare('SELECT id, user_id FROM signalements WHERE id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ erreur: 'Signalement introuvable' });

  if (Number(s.user_id) !== req.session.userId && req.session.role !== 'admin')
    return res.status(403).json({ erreur: 'Non autorisé' });

  db.prepare('DELETE FROM signalements WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
