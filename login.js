/*document.addEventListener('DOMContentLoaded', () => {
  // --- AJOUT POUR L'INJECTION DYNAMIQUE ---
  const linkContainer = document.getElementById('registration-link');
  if (linkContainer) {
    linkContainer.innerHTML = '<span id="toggle-text">Pas encore de compte ? </span><a href="#" id="toggle-register">Créer un compte</a>';
  }
  // --- FIN DE L'AJOUT ---

  const btnLogin = document.querySelector('.main-button');
  const toggleRegister = document.getElementById('toggle-register');
  const toggleText = document.getElementById('toggle-text');
  const confirmDiv = document.getElementById('confirm-div');

  if (!btnLogin || !toggleRegister || !toggleText || !confirmDiv) return;

  let modeRegister = false;

  toggleRegister.addEventListener('click', (e) => {
    e.preventDefault();
    modeRegister = !modeRegister;
    confirmDiv.style.display = modeRegister ? 'block' : 'none';
    btnLogin.textContent = modeRegister ? 'CRÉER MON COMPTE' : 'SE CONNECTER';
    toggleText.textContent = modeRegister ? 'Déjà un compte ? ' : 'Pas encore de compte ? ';
    toggleRegister.textContent = modeRegister ? 'Se connecter' : 'Créer un compte';
  });

  btnLogin.addEventListener('click', async () => {
    const telephone = document.getElementById('phone').value.trim();
    const mot_passe = document.getElementById('mdp').value;

    if (!telephone || !mot_passe) {
      if (typeof flash === 'function') flash('Remplissez tous les champs.', 'err');
      else alert('Remplissez tous les champs.');
      return;
    }

    if (modeRegister) {
      const mdp2 = document.getElementById('mdp2').value;

      if (mot_passe !== mdp2) {
        if (typeof flash === 'function') flash('Les mots de passe ne correspondent pas.', 'err');
        return;
      }

      if (mot_passe.length < 6) {
        if (typeof flash === 'function') flash('Mot de passe trop court (6 caractères min).', 'err');
        return;
      }

      const data = await postJSON('/api/auth/register', { telephone, mot_passe });

      if (data.ok) {
        invalidateSession();
        flash('Compte créé ! Redirection…', 'ok');
        setTimeout(() => { location.href = 'accueil.html'; }, 1500);
      } else {
        flash(data.erreur || 'Erreur lors de la création.', 'err');
      }
    } else {
      const data = await postJSON('/api/auth/login', { telephone, mot_passe });

      if (data.ok) {
        invalidateSession();
        flash('Connecté ! Redirection…', 'ok');
        setTimeout(() => { location.href = 'accueil.html'; }, 1200);
      } else {
        flash(data.erreur || 'Identifiants incorrects.', 'err');
      }
    }
  });
});*/



/////

// login.js — Gestion du formulaire connexion / inscription
// Chargé uniquement sur login.html (après app.js)

// login.js — Connexion et inscription
// Ce fichier contient tout ce dont il a besoin (pas de dépendance à app.js)
// car les scripts sont chargés dans le <head> sans defer.

// ── Fonctions utilitaires locales ─────────────────────────────────────────
/*
// Afficher un message de notification
function afficherMessage(message, type) {
  let el = document.getElementById('flash-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash-msg';
    el.style.cssText = [
      'position:fixed', 'top:20px', 'left:50%', 'transform:translateX(-50%)',
      'padding:12px 24px', 'border-radius:8px', 'font-weight:bold',
      'z-index:999', 'font-size:1rem', 'box-shadow:0 2px 8px rgba(0,0,0,0.15)'
    ].join(';');
    document.body.appendChild(el);
  }
  el.textContent = message;
  if (type === 'ok') {
    el.style.background = '#d4edda';
    el.style.color      = '#155724';
    el.style.border     = '1px solid #c3e6cb';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  } else {
    el.style.background = '#f8d7da';
    el.style.color      = '#721c24';
    el.style.border     = '1px solid #f5c6cb';
  }
  el.style.display = 'block';
}

// Envoyer une requête POST en JSON au serveur
async function envoyerRequete(url, donnees) {
  const reponse = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(donnees)
  });
  return reponse.json();
}

// ── Initialiser le formulaire une fois la page chargée ────────────────────
function initialiserFormulaire() {
  const btnLogin    = document.querySelector('.btn-login');
  const toggleLien  = document.getElementById('toggle-register');
  const toggleTexte = document.getElementById('toggle-text');
  const confirmDiv  = document.getElementById('confirm-div');

  // Si les éléments n'existent pas encore, réessayer dans 100ms
  if (!btnLogin || !toggleLien || !toggleTexte || !confirmDiv) {
    setTimeout(initialiserFormulaire, 100);
    return;
  }

  let modeInscription = false;

  // ── Basculer entre connexion et inscription ─────────────────────────────
  toggleLien.addEventListener('click', (e) => {
    e.preventDefault();
    modeInscription = !modeInscription;

    confirmDiv.style.display = modeInscription ? 'block' : 'none';
    btnLogin.textContent     = modeInscription ? 'CRÉER MON COMPTE' : 'SE CONNECTER';
    toggleTexte.textContent  = modeInscription ? 'Déjà un compte ? ' : 'Pas encore de compte ? ';
    toggleLien.textContent   = modeInscription ? 'Se connecter' : 'Créer un compte';
  });

  // ── Clic sur le bouton principal ────────────────────────────────────────
  btnLogin.addEventListener('click', async () => {
    const telephone = document.getElementById('phone').value.trim();
    const mot_passe = document.getElementById('mdp').value;

    if (!telephone || !mot_passe) {
      afficherMessage('Remplissez tous les champs.', 'err');
      return;
    }

    // Mode INSCRIPTION
    if (modeInscription) {
      const mdp2 = document.getElementById('mdp2').value;

      if (mot_passe !== mdp2) {
        afficherMessage('Les mots de passe ne correspondent pas.', 'err');
        return;
      }
      if (mot_passe.length < 6) {
        afficherMessage('Mot de passe trop court (6 caractères minimum).', 'err');
        return;
      }

      try {
        const reponse = await envoyerRequete('/api/auth/register', { telephone, mot_passe });
        if (reponse.ok) {
          afficherMessage('Compte créé ! Redirection en cours…', 'ok');
          setTimeout(() => { location.href = 'accueil.html'; }, 1500);
        } else {
          afficherMessage(reponse.erreur || 'Erreur lors de la création.', 'err');
        }
      } catch (e) {
        afficherMessage('Impossible de contacter le serveur.', 'err');
      }

    // Mode CONNEXION
    } else {
      try {
        const reponse = await envoyerRequete('/api/auth/login', { telephone, mot_passe });
        if (reponse.ok) {
          afficherMessage('Connecté ! Redirection en cours…', 'ok');
          setTimeout(() => { location.href = 'accueil.html'; }, 1200);
        } else {
          afficherMessage(reponse.erreur || 'Numéro ou mot de passe incorrect.', 'err');
        }
      } catch (e) {
        afficherMessage('Impossible de contacter le serveur.', 'err');
      }
    }
  });
}

// Lancer l'initialisation — fonctionne que la page soit déjà chargée ou pas
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialiserFormulaire);
} else {
  initialiserFormulaire();
}
*/


/////////

// login.js — Connexion et inscription
// Adapté au HTML actuel de login.html

// ── Afficher un message à l'utilisateur ──────────────────────────────────
function afficherMessage(message, type) {
  let el = document.getElementById('flash-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'flash-msg';
    el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;font-weight:bold;z-index:999;font-size:1rem;';
    document.body.appendChild(el);
  }
  el.textContent = message;
  if (type === 'ok') {
    el.style.background = '#d4edda';
    el.style.color = '#155724';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  } else {
    el.style.background = '#f8d7da';
    el.style.color = '#721c24';
  }
  el.style.display = 'block';
}

// ── Envoyer une requête POST JSON ─────────────────────────────────────────
async function envoyerRequete(url, donnees) {
  const reponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donnees)
  });
  return reponse.json();
}

// ── Initialiser le formulaire ─────────────────────────────────────────────
function init() {
  const btn         = document.querySelector('.main-button');
  const confirmDiv  = document.getElementById('confirm-div');
  const linkDiv     = document.getElementById('registration-link');

  // Si les éléments ne sont pas encore là, réessayer dans 50ms
  if (!btn || !confirmDiv || !linkDiv) {
    setTimeout(init, 50);
    return;
  }

  let modeInscription = false;

  // Injecter le lien "Créer un compte" dans le div prévu à cet effet
  linkDiv.innerHTML = `
    <p style="margin-top:16px; font-size:1rem;">
      <span id="toggle-text">Pas encore de compte ? </span>
      <a href="#" id="toggle-register" style="color:#FF0000; font-weight:bold; cursor:pointer;">
        Créer un compte
      </a>
    </p>
  `;

  const toggleLien  = document.getElementById('toggle-register');
  const toggleTexte = document.getElementById('toggle-text');

  // Clic sur "Créer un compte" → basculer le mode
  toggleLien.addEventListener('click', (e) => {
    e.preventDefault();
    modeInscription = !modeInscription;

    confirmDiv.style.display = modeInscription ? 'block' : 'none';
    btn.textContent          = modeInscription ? 'CRÉER MON COMPTE' : 'SE CONNECTER';
    toggleTexte.textContent  = modeInscription ? 'Déjà un compte ? ' : 'Pas encore de compte ? ';
    toggleLien.textContent   = modeInscription ? 'Se connecter' : 'Créer un compte';
  });

  // Clic sur le bouton principal
  btn.addEventListener('click', async () => {
    const telephone = document.getElementById('phone').value.trim();
    const mot_passe = document.getElementById('mdp').value;

    if (!telephone || !mot_passe) {
      afficherMessage('Remplissez tous les champs.', 'err');
      return;
    }

    // ── Mode INSCRIPTION ────────────────────────────────────────────────
    if (modeInscription) {
      const mdp2 = document.getElementById('mdp2').value;

      if (mot_passe !== mdp2) {
        afficherMessage('Les mots de passe ne correspondent pas.', 'err');
        return;
      }
      if (mot_passe.length < 6) {
        afficherMessage('Mot de passe trop court (6 caractères minimum).', 'err');
        return;
      }

      try {
        const reponse = await envoyerRequete('/api/auth/register', { telephone, mot_passe });
        if (reponse.ok) {
          afficherMessage('Compte créé ! Redirection…', 'ok');
          setTimeout(() => { location.href = 'accueil.html'; }, 1500);
        } else {
          afficherMessage(reponse.erreur || 'Erreur lors de la création.', 'err');
        }
      } catch {
        afficherMessage('Impossible de contacter le serveur.', 'err');
      }

    // ── Mode CONNEXION ──────────────────────────────────────────────────
    } else {
      try {
        const reponse = await envoyerRequete('/api/auth/login', { telephone, mot_passe });
        if (reponse.ok) {
          afficherMessage('Connecté ! Redirection…', 'ok');
          setTimeout(() => { location.href = 'accueil.html'; }, 1200);
        } else {
          afficherMessage(reponse.erreur || 'Numéro ou mot de passe incorrect.', 'err');
        }
      } catch {
        afficherMessage('Impossible de contacter le serveur.', 'err');
      }
    }
  });
}

// Démarrer dès que possible
init();


