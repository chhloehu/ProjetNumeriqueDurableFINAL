// signalement.js — Formulaire de signalement
/*
document.addEventListener('DOMContentLoaded', async () => {

  // ── Vérifier que l'utilisateur est connecté ───────────────────────────
  const session = await getSession();
  if (!session.connecte) {
    flash('Vous devez être connecté pour signaler une tortue.', 'err');
    setTimeout(() => { location.href = 'login.html'; }, 2000);
    return;
  }

  // ── Améliorer le formulaire existant ─────────────────────────────────
  const main = document.querySelector('main.container');

  // Remplacer le champ "Objet" par un select espèce + type
  const objDiv = document.getElementById('Obj').parentElement;
  objDiv.innerHTML = `
    <label style="font-size:2em;">Type de signalement</label><br>
    <select id="Obj" style="font-size:1.5em;padding:8px;margin:10px 0;border-radius:8px;border:2px solid #1A458B;">
      <option value="">— Choisir —</option>
      <option value="tortue_blessee">🐢 Tortue blessée</option>
      <option value="nid_expose">🥚 Nid exposé / œufs en danger</option>
      <option value="danger">⚠️ Danger potentiel</option>
    </select>
    <br>
    <label style="font-size:2em;">Espèce (si connue)</label><br>
    <select id="espece" style="font-size:1.2em;padding:8px;margin:10px 0;border-radius:8px;border:2px solid #1A458B;">
      <option value="">Inconnue</option>
      <option value="Caretta caretta">Caretta caretta (Caouanne)</option>
      <option value="Chelonia mydas">Chelonia mydas (Verte)</option>
      <option value="Dermochelys coriacea">Dermochelys coriacea (Luth)</option>
      <option value="Autre">Autre</option>
    </select>
  `;

  // Ajouter bouton GPS sous le champ Lieu
  const locDiv = document.getElementById('Location').parentElement;
  const btnGPS = document.createElement('button');
  btnGPS.type = 'button';
  btnGPS.textContent = '📍 Utiliser ma position GPS';
  btnGPS.style.cssText = 'font-size:1rem;margin:8px 0;padding:8px 16px;background:#1A458B;color:white;border:none;border-radius:8px;cursor:pointer;';
  locDiv.appendChild(btnGPS);

  btnGPS.addEventListener('click', () => {
    if (!navigator.geolocation) { flash('GPS non disponible.', 'err'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        document.getElementById('Location').value =
          `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        flash('Position GPS récupérée !', 'ok');
      },
      () => flash('Impossible de récupérer la position.', 'err')
    );
  });

  // ── Brancher le bouton "Confirmer et envoyer" ────────────────────────
  const btnEnvoyer = document.querySelector('.hero .btn-accueil');
  if (!btnEnvoyer) return;

  btnEnvoyer.addEventListener('click', async (e) => {
    e.preventDefault();

    const lieu      = document.getElementById('Location').value.trim();
    const type      = document.getElementById('Obj').value;
    const espece    = document.getElementById('espece').value;
    const urgent    = document.getElementById('Urgency').checked;

    if (!type)  { flash('Choisissez un type de signalement.', 'err'); return; }
    if (!lieu)  { flash('Indiquez un lieu.', 'err'); return; }

    // Détecter si le lieu est des coordonnées GPS
    let lieu_texte = lieu, latitude = null, longitude = null;
    const gpsMatch = lieu.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (gpsMatch) {
      latitude  = parseFloat(gpsMatch[1]);
      longitude = parseFloat(gpsMatch[2]);
      lieu_texte = null;
    }

    const objet_final = urgent ? type + ' (URGENT)' : type;

    const data = await postJSON('/api/signalements', {
      type_signal: type,
      espece     : espece || null,
      lieu_texte : lieu_texte,
      latitude,
      longitude
    });

    if (data.ok) {
      flash('Signalement envoyé avec succès ! Merci.', 'ok');
      document.getElementById('Location').value = '';
      document.getElementById('Obj').value      = '';
      document.getElementById('espece').value   = '';
      document.getElementById('Urgency').checked = false;
    } else {
      flash(data.erreur || 'Erreur lors de l\'envoi.', 'err');
    }
  });

});*/


////

// signalement.js — Formulaire de signalement
// Adapté exactement au HTML de signal_formulaire.html

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
  const formulaire = document.getElementById('form-signalement');
  if (!formulaire) {
    setTimeout(init, 50);
    return;
  }

  // ── Vérifier que l'utilisateur est connecté ─────────────────────────────
  fetch('/api/auth/me')
    .then(r => r.json())
    .then(session => {
      if (!session.connecte) {
        afficherMessage('Vous devez être connecté pour signaler une tortue.', 'err');
        setTimeout(() => { location.href = 'login.html'; }, 2000);
      }
    });

  // ── Ajouter un bouton GPS sous le champ Lieu ────────────────────────────
  const champLieu = document.getElementById('Location');
  if (champLieu) {
    const btnGPS = document.createElement('button');
    btnGPS.type = 'button';
    btnGPS.textContent = '📍 Utiliser ma position GPS';
    btnGPS.style.cssText = 'margin:8px 0;padding:8px 16px;background:#1A458B;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;';
    champLieu.parentElement.appendChild(btnGPS);

    btnGPS.addEventListener('click', () => {
      if (!navigator.geolocation) {
        afficherMessage('GPS non disponible sur cet appareil.', 'err');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          champLieu.value = pos.coords.latitude.toFixed(5) + ', ' + pos.coords.longitude.toFixed(5);
          afficherMessage('Position GPS récupérée !', 'ok');
        },
        () => afficherMessage('Impossible de récupérer la position GPS.', 'err')
      );
    });
  }

  // ── Intercepter la soumission du formulaire ─────────────────────────────
  formulaire.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page

    const lieu      = document.getElementById('Location').value.trim();
    const objet     = document.getElementById('Obj').value.trim();
    const urgent    = document.getElementById('Urgency').checked;

    // Validations côté client
    if (!lieu) {
      afficherMessage('Indiquez un lieu.', 'err');
      return;
    }
    if (!objet) {
      afficherMessage('Décrivez l\'objet du signalement.', 'err');
      return;
    }

    // Détecter si le lieu est des coordonnées GPS (ex: "43.12345, 5.67890")
    let lieu_texte = lieu;
    let latitude   = null;
    let longitude  = null;

    const coords = lieu.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coords) {
      latitude   = parseFloat(coords[1]);
      longitude  = parseFloat(coords[2]);
      lieu_texte = null;
    }

    // Déterminer le type selon le contenu de l'objet
    // (le champ est un texte libre — on essaie de le mapper à un type connu)
    let type_signal = 'danger'; // valeur par défaut
    const objetMin = objet.toLowerCase();
    if (objetMin.includes('bless') || objetMin.includes('tortue')) {
      type_signal = 'tortue_blessee';
    } else if (objetMin.includes('nid') || objetMin.includes('oeuf') || objetMin.includes('œuf')) {
      type_signal = 'nid_expose';
    }

    // Envoyer au serveur
    try {
      const reponse = await envoyerRequete('/api/signalements', {
        type_signal,
        espece:     null,
        lieu_texte,
        latitude,
        longitude,
        urgent
      });

      if (reponse.ok) {
        afficherMessage('Signalement envoyé avec succès ! Merci.', 'ok');
        formulaire.reset(); // Vider tous les champs du formulaire
      } else {
        afficherMessage(reponse.erreur || 'Erreur lors de l\'envoi.', 'err');
      }
    } catch {
      afficherMessage('Impossible de contacter le serveur.', 'err');
    }
  });
}

// Démarrer
init();



