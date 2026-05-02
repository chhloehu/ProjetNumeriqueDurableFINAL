// routes/admin.js — Gestion admin
/*'use strict';

const express = require('express');

module.exports = function(db, requireAuth, requireAdmin) {
  const router = express.Router();
  router.use(requireAuth, requireAdmin);

  // GET /api/admin/utilisateurs
  router.get('/utilisateurs', (req, res) => {
    res.json(db.prepare(
      'SELECT id, telephone, role, cree_le FROM utilisateurs ORDER BY cree_le DESC'
    ).all());
  });

  // DELETE /api/admin/utilisateurs/:id
  router.delete('/utilisateurs/:id', (req, res) => {
    db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  // GET /api/admin/signalements — Tous les signalements (actifs + résolus)
  router.get('/signalements', (req, res) => {
    res.json(db.prepare(`
      SELECT s.*, u.telephone AS auteur
      FROM   signalements s
      JOIN   utilisateurs u ON s.user_id = u.id
      ORDER  BY s.cree_le DESC
    `).all());
  });
  
  // PUT /api/admin/signalements/:id/resoudre — Marquer résolu
  router.put('/signalements/:id/resoudre', (req, res) => {
    db.prepare("UPDATE signalements SET etat = 'resolu' WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  });

  return router;
};
*/
/*
const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/users', (req, res) => {
  db.all('SELECT * FROM utilisateurs', [], (err, rows) => {
    res.json(rows);
  });
});

module.exports = router;*/


//////


// routes/admin.js — Routes réservées aux administrateurs

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// Middleware admin
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ erreur: 'Non connecté' });
  if (req.session.role !== 'admin')
    return res.status(403).json({ erreur: 'Accès réservé aux admins' });
  next();
}

router.use(requireAdmin);

// ── GET /api/admin/utilisateurs — Liste paginée ──────────────────────────
router.get('/utilisateurs', (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;

  const rows = db.prepare(
    'SELECT id, telephone, role, cree_le FROM utilisateurs ORDER BY cree_le DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);

  res.json(rows);
});

// ── PUT /api/admin/utilisateurs/:id — Modifier un utilisateur ────────────
router.put('/utilisateurs/:id', (req, res) => {
  const { telephone, role } = req.body;
  const result = db.prepare(
    'UPDATE utilisateurs SET telephone = COALESCE(?, telephone), role = COALESCE(?, role) WHERE id = ?'
  ).run(telephone || null, role || null, req.params.id);

  if (result.changes === 0) return res.status(404).json({ erreur: 'Introuvable' });
  res.json({ ok: true });
});

// ── DELETE /api/admin/utilisateurs/:id — Supprimer un utilisateur ────────
router.delete('/utilisateurs/:id', (req, res) => {
  const result = db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: 'Introuvable' });
  res.json({ ok: true });
});

// ── GET /api/admin/signalements — Tous les signalements ──────────────────
router.get('/signalements', (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;

  const rows = db.prepare(`
    SELECT s.id, s.type_signal, s.espece, s.lieu_texte,
           s.latitude, s.longitude, s.urgent, s.etat, s.cree_le,
           u.telephone AS auteur
    FROM   signalements s
    JOIN   utilisateurs u ON s.user_id = u.id
    ORDER  BY s.cree_le DESC
    LIMIT  ? OFFSET ?
  `).all(limit, offset);

  res.json(rows);
});

// ── PUT /api/admin/signalements/:id/resoudre — Marquer résolu ─────────────
router.put('/signalements/:id/resoudre', (req, res) => {
  const result = db.prepare(
    "UPDATE signalements SET etat = 'resolu' WHERE id = ?"
  ).run(req.params.id);

  if (result.changes === 0) return res.status(404).json({ erreur: 'Introuvable' });
  res.json({ ok: true });
});

module.exports = router;
