// app.js — TortueAlert
// Utilitaires partagés : session, flash, navigation active
/*
'use strict';

// ── Session (cache 30s) ───────────────────────────────────────────────────
let _session = null;
let _sessionTime = 0;

async function getSession() {
  if (_session && Date.now() - _sessionTime < 30000) return _session;
  try {
    const r = await fetch('/api/auth/me');
    _session = await r.json();
    _sessionTime = Date.now();
    return _session;
  } catch {
    return { connecte: false };
  }
}

function invalidateSession() { _session = null; }

// ── Afficher un message flash ─────────────────────────────────────────────
function flash(msg, type = 'ok') {
  let el = document.getElementById('flash-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash-msg';
    el.style.cssText = `
      position:fixed; top:20px; left:50%; transform:translateX(-50%);
      padding:12px 24px; border-radius:8px; font-weight:bold; z-index:999;
      font-size:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = type === 'ok' ? '#d4edda' : '#f8d7da';
  el.style.color       = type === 'ok' ? '#155724' : '#721c24';
  el.style.border      = type === 'ok' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
  el.style.display     = 'block';
  if (type === 'ok') setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ── POST JSON helper ──────────────────────────────────────────────────────
async function postJSON(url, data) {
  const r = await fetch(url, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(data)
  });
  return r.json();
}

// ── Adapter le lien "SE CONNECTER" selon la session ───────────────────────
async function adapterNav() {
  const s = await getSession();
  // Chercher le lien de connexion dans la nav
  const liens = document.querySelectorAll('.nav-links a');
  liens.forEach(a => {
    if (a.href.includes('login.html') || a.getAttribute('href') === 'login.html') {
      if (s.connecte) {
        a.textContent = 'MON PROFIL';
        a.href = 'profil.html';
      }
    }
    // Marquer le lien actif
    const page = location.pathname.split('/').pop() || 'accueil.html';
    const href = a.getAttribute('href');
    if (href && href !== '#' && page === href) {
      a.style.background = '#FF0000';
      a.style.color = 'white';
      a.style.padding = '10px 25px';
      a.style.borderRadius = '50px';
    }
  });
}

document.addEventListener('DOMContentLoaded', adapterNav);
*/

// app.js — Fonctions utilitaires partagées sur toutes les pages
// Ce fichier est chargé EN PREMIER sur chaque page HTML.

// app.js — Fonctions utilitaires partagées sur toutes les pages
// Ce fichier est chargé EN PREMIER sur chaque page HTML.

'use strict';

// ═══════════════════════════════════════════════════════════════
// 1. GESTION DE LA SESSION (cache 30 secondes pour limiter 
//    les requêtes BDD -> Green IT)
// ═══════════════════════════════════════════════════════════════

let _session     = null;  // données session en cache
let _sessionTime = 0;     // heure du dernier fetch

// Récupère la session depuis le serveur (ou depuis le cache)
async function getSession() {
  // Si le cache a moins de 30 secondes, on le réutilise
  if (_session && Date.now() - _sessionTime < 30000) return _session;
  try {
    // Le 'no-store' force le navigateur à vérifier l'état réel sur le serveur
    const reponse = await fetch('/api/auth/me', { cache: 'no-store' });
    _session      = await reponse.json();
    _sessionTime  = Date.now();
    return _session;
  } catch {
    return { connecte: false };
  }
}

// Vide le cache (à appeler après login/logout)
function invalidateSession() {
  _session = null;
  _sessionTime = 0;
}

// ═══════════════════════════════════════════════════════════════
// 2. AFFICHER UN MESSAGE FLASH (notification temporaire)
// ═══════════════════════════════════════════════════════════════

function flash(message, type = 'ok') {
  let el = document.getElementById('flash-msg');
  if (!el) {
    el    = document.createElement('div');
    el.id = 'flash-msg';
    Object.assign(el.style, {
      position:  'fixed',
      top:       '20px',
      left:      '50%',
      transform: 'translateX(-50%)',
      padding:   '12px 24px',
      borderRadius: '8px',
      fontWeight:   'bold',
      zIndex:       '999',
      fontSize:     '1rem',
      boxShadow:    '0 2px 8px rgba(0,0,0,0.15)'
    });
    document.body.appendChild(el);
  }

  el.textContent = message;

  if (type === 'ok') {
    el.style.background = '#d4edda';
    el.style.color      = '#155724';
    el.style.border     = '1px solid #c3e6cb';
  } else {
    el.style.background = '#f8d7da';
    el.style.color      = '#721c24';
    el.style.border     = '1px solid #f5c6cb';
  }

  el.style.display = 'block';

  if (type === 'ok') setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ═══════════════════════════════════════════════════════════════
// 3. HELPER : ENVOYER UNE REQUÊTE POST EN JSON
// ═══════════════════════════════════════════════════════════════

async function postJSON(url, donnees) {
  const reponse = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(donnees)
  });
  return reponse.json();
}

// ═══════════════════════════════════════════════════════════════
// 4. ADAPTER LA NAVIGATION selon si l'utilisateur est connecté
// ═══════════════════════════════════════════════════════════════

async function adapterNav() {
  const session = await getSession();
  const liens   = document.querySelectorAll('.nav-links a');

  liens.forEach(lien => {
    const href = lien.getAttribute('href');

    // --- GESTION DU BOUTON CONNEXION / DÉCONNEXION ---
    if (href === 'login.html') {
      if (session.connecte) {
        lien.textContent = 'SE DÉCONNECTER';
        lien.href        = '#';
        
        lien.addEventListener('click', async (e) => {
          e.preventDefault();
          
          // 1. On prévient le serveur de détruire la session
          await postJSON('/api/auth/logout', {});
          
          // 2. On vide complètement le cache local
          invalidateSession(); 
          
          // 3. Redirection vers l'accueil
          location.href = 'accueil.html';
        });
      }
    }

    // --- MISE EN SURBRILLANCE DE LA PAGE ACTIVE ---
    const pageCourante = location.pathname.split('/').pop() || 'accueil.html';
    
    // Si on est sur la page de ce lien, on ajoute la classe CSS
    if (href && href !== '#' && pageCourante === href) {
      lien.classList.add('active');
    }
  });
}

// Lancer adapterNav dès que la page est prête
document.addEventListener('DOMContentLoaded', adapterNav);