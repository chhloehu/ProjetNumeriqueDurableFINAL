// routes/auth.js — Inscription, connexion, profil
/*'use strict';

const express = require('express');
const bcrypt  = require('bcryptjs');

module.exports = function(db) {
  const router = express.Router();

  // POST /api/auth/register — Créer un compte
  router.post('/register', (req, res) => {
    const { telephone, mot_passe } = req.body;

    if (!telephone || !mot_passe)
      return res.status(400).json({ erreur: 'Champs manquants' });

    if (mot_passe.length < 6)
      return res.status(400).json({ erreur: 'Mot de passe trop court (6 caractères minimum)' });

    const hash = bcrypt.hashSync(mot_passe, 10);

    try {
      const info = db.prepare(
        'INSERT INTO utilisateurs (telephone, mot_passe) VALUES (?, ?)'
      ).run(telephone, hash);

      req.session.userId    = Number(info.lastInsertRowid);
      req.session.telephone = telephone;
      req.session.role      = 'user';

      res.json({ ok: true, message: 'Compte créé avec succès' });
    } catch(e) {
      if (e.message && e.message.includes('UNIQUE'))
        return res.status(409).json({ erreur: 'Ce numéro est déjà utilisé' });
      console.error(e);
      res.status(500).json({ erreur: 'Erreur serveur' });
    }
  });

  // POST /api/auth/login — Connexion
  router.post('/login', (req, res) => {
    const { telephone, mot_passe } = req.body;

    if (!telephone || !mot_passe)
      return res.status(400).json({ erreur: 'Champs manquants' });

    const user = db.prepare(
      'SELECT * FROM utilisateurs WHERE telephone = ?'
    ).get(telephone);

    if (!user || !bcrypt.compareSync(mot_passe, user.mot_passe))
      return res.status(401).json({ erreur: 'Numéro ou mot de passe incorrect' });

    req.session.userId    = Number(user.id);
    req.session.telephone = user.telephone;
    req.session.role      = user.role;

    res.json({ ok: true, role: user.role });
  });

  // POST /api/auth/logout — Déconnexion
  router.post('/logout', (req, res) => {
    req.session = null;
    res.json({ ok: true });
  });

  // GET /api/auth/me — Info session courante
  router.get('/me', (req, res) => {
    if (!req.session.userId)
      return res.json({ connecte: false });

    res.json({
      connecte  : true,
      userId    : req.session.userId,
      telephone : req.session.telephone,
      role      : req.session.role
    });
  });

  // PUT /api/auth/profil — Modifier son numéro ou mot de passe
  router.put('/profil', (req, res) => {
    if (!req.session.userId)
      return res.status(401).json({ erreur: 'Non connecté' });

    const { nouveau_telephone, nouveau_mot_passe } = req.body;

    if (nouveau_telephone) {
      db.prepare('UPDATE utilisateurs SET telephone = ? WHERE id = ?')
        .run(nouveau_telephone, req.session.userId);
      req.session.telephone = nouveau_telephone;
    }
    if (nouveau_mot_passe) {
      if (nouveau_mot_passe.length < 6)
        return res.status(400).json({ erreur: 'Mot de passe trop court' });
      db.prepare('UPDATE utilisateurs SET mot_passe = ? WHERE id = ?')
        .run(bcrypt.hashSync(nouveau_mot_passe, 10), req.session.userId);
    }

    res.json({ ok: true });
  });

  // DELETE /api/auth/compte — Supprimer son compte
  router.delete('/compte', (req, res) => {
    if (!req.session.userId)
      return res.status(401).json({ erreur: 'Non connecté' });

    db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(req.session.userId);
    req.session = null;
    res.json({ ok: true });
  });

  return router;
};*/


/*
const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run(
    'INSERT INTO utilisateurs (username, password) VALUES (?, ?)',
    [username, password],
    () => res.json({ message: 'Utilisateur créé' })
  );
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    'SELECT * FROM utilisateurs WHERE username = ? AND password = ?',
    [username, password],
    (err, user) => {
      if (!user) return res.status(401).json({ error: 'Erreur login' });
      req.session.user = user;
      res.json(user);
    }
  );
});

module.exports = router;*/




/////////

// routes/auth.js — Inscription, connexion, déconnexion, profil
// node:sqlite utilise des "prepared statements" → protection injections SQL

'use strict';

const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const db      = require('../db/database');

// Middleware : utilisateur connecté
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ erreur: 'Non connecté' });
  next();
}

// ── POST /api/auth/register — Créer un compte ─────────────────────────────
router.post('/register', (req, res) => {
  const { telephone, mot_passe } = req.body;

  if (!telephone || !mot_passe)
    return res.status(400).json({ erreur: 'Champs manquants' });
  if (mot_passe.length < 6)
    return res.status(400).json({ erreur: 'Mot de passe trop court (6 caractères min)' });

  const hash = bcrypt.hashSync(mot_passe, 10);

  try {
    // Requête préparée = protection injection SQL
    const stmt   = db.prepare('INSERT INTO utilisateurs (telephone, mot_passe) VALUES (?, ?)');
    const result = stmt.run(telephone, hash);

    req.session.userId    = Number(result.lastInsertRowid);
    req.session.telephone = telephone;
    req.session.role      = 'user';
    res.json({ ok: true });

  } catch(e) {
    if (e.message && e.message.includes('UNIQUE'))
      return res.status(409).json({ erreur: 'Ce numéro est déjà utilisé' });
    console.error(e);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
});

// ── POST /api/auth/login — Connexion ─────────────────────────────────────
router.post('/login', (req, res) => {
  const { telephone, mot_passe } = req.body;

  if (!telephone || !mot_passe)
    return res.status(400).json({ erreur: 'Champs manquants' });

  // SELECT uniquement les colonnes utiles (pas de SELECT *)
  const user = db.prepare(
    'SELECT id, telephone, mot_passe, role FROM utilisateurs WHERE telephone = ?'
  ).get(telephone);

  if (!user || !bcrypt.compareSync(mot_passe, user.mot_passe))
    return res.status(401).json({ erreur: 'Numéro ou mot de passe incorrect' });

  req.session.userId    = Number(user.id);
  req.session.telephone = user.telephone;
  req.session.role      = user.role;
  res.json({ ok: true, role: user.role });
});

// ── POST /api/auth/logout — Déconnexion ──────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erreur: 'Erreur lors de la déconnexion' });
    }

    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// ── GET /api/auth/me — Info session ──────────────────────────────────────
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId)
    return res.json({ connecte: false });
  res.json({
    connecte  : true,
    userId    : req.session.userId,
    telephone : req.session.telephone,
    role      : req.session.role
  });
});

// ── GET /api/auth/utilisateurs — Liste paginée (admin seulement) ─────────
router.get('/utilisateurs', requireAuth, (req, res) => {
  if (req.session.role !== 'admin')
    return res.status(403).json({ erreur: 'Accès refusé' });

  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = 20;
  const offset = (page - 1) * limit;

  const rows = db.prepare(
    'SELECT id, telephone, role, cree_le FROM utilisateurs ORDER BY cree_le DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);

  res.json(rows);
});

// ── PUT /api/auth/utilisateurs/:id — Modifier (admin) ────────────────────
router.put('/utilisateurs/:id', requireAuth, (req, res) => {
  if (req.session.role !== 'admin')
    return res.status(403).json({ erreur: 'Accès refusé' });

  const { telephone, role } = req.body;
  const result = db.prepare(
    'UPDATE utilisateurs SET telephone = COALESCE(?, telephone), role = COALESCE(?, role) WHERE id = ?'
  ).run(telephone || null, role || null, req.params.id);

  if (result.changes === 0) return res.status(404).json({ erreur: 'Utilisateur introuvable' });
  res.json({ ok: true });
});

// ── DELETE /api/auth/utilisateurs/:id — Supprimer (admin) ────────────────
router.delete('/utilisateurs/:id', requireAuth, (req, res) => {
  if (req.session.role !== 'admin')
    return res.status(403).json({ erreur: 'Accès refusé' });

  const result = db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ erreur: 'Utilisateur introuvable' });
  res.json({ ok: true });
});

module.exports = router;
