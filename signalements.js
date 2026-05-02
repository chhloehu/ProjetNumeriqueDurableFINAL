// signalements.js — Affichage de la liste des signalements
/*
document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('signalements-container');
  if (!container) return;

  const session = await getSession();

  const LABELS = {
    tortue_blessee : '🐢 Tortue blessée',
    nid_expose     : '🥚 Nid exposé',
    danger         : '⚠️ Danger potentiel'
  };

  try {
    const signalements = await fetch('/api/signalements').then(r => r.json());

    if (!signalements.length) {
      container.innerHTML = '<p style="color:#1A458B;font-size:1.1rem">Aucun signalement actif pour le moment.</p>';
      return;
    }

    // Créer le tableau
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;margin:20px 0;font-size:0.95rem;';

    table.innerHTML = `
      <thead>
        <tr style="background:#1A458B;color:white;">
          <th style="padding:10px;text-align:left">Type</th>
          <th style="padding:10px;text-align:left">Espèce</th>
          <th style="padding:10px;text-align:left">Lieu</th>
          <th style="padding:10px;text-align:left">Date</th>
          <th style="padding:10px;text-align:left">Signalé par</th>
          ${session.connecte ? '<th style="padding:10px"></th>' : ''}
        </tr>
      </thead>
      <tbody id="tbody-sig"></tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);

    const tbody = document.getElementById('tbody-sig');

    signalements.forEach((s, i) => {
      const tr = document.createElement('tr');
      tr.style.background = i % 2 === 0 ? '#fff' : '#f5f0ee';
      tr.style.borderBottom = '1px solid #ddd';

      const lieu = s.lieu_texte ||
        (s.latitude ? `GPS : ${(+s.latitude).toFixed(4)}, ${(+s.longitude).toFixed(4)}` : '—');
      const date = new Date(s.cree_le).toLocaleDateString('fr-FR');
      const type = LABELS[s.type_signal] || s.type_signal;

      tr.innerHTML = `
        <td style="padding:10px;font-weight:bold;color:#FF0000">${type}</td>
        <td style="padding:10px">${s.espece || '—'}</td>
        <td style="padding:10px">${lieu}</td>
        <td style="padding:10px">${date}</td>
        <td style="padding:10px;font-size:0.85rem">${s.auteur || '—'}</td>
        ${session.connecte ? `<td style="padding:10px">
          <button onclick="supprimerSignalement(${s.id}, this)"
            style="background:transparent;border:2px solid #FF0000;color:#FF0000;padding:4px 10px;border-radius:6px;cursor:pointer;font-weight:bold">
            ✕
          </button>
        </td>` : ''}
      `;
      tbody.appendChild(tr);
    });

  } catch(e) {
    container.innerHTML = '<p style="color:red">Erreur de chargement des signalements.</p>';
  }

});

async function supprimerSignalement(id, btn) {
  if (!confirm('Supprimer ce signalement ?')) return;
  const r = await fetch(`/api/signalements/${id}`, { method: 'DELETE' });
  const d = await r.json();
  if (d.ok) {
    btn.closest('tr').remove();
    flash('Signalement supprimé.', 'ok');
  } else {
    flash(d.erreur || 'Non autorisé.', 'err');
  }
}
*/



/////


// signalements.js — Affichage de la liste des signalements
// Adapté au HTML de signalements.html

// Labels lisibles pour les types
const LABELS = {
  tortue_blessee: '🐢 Tortue blessée',
  nid_expose:     '🥚 Nid exposé',
  danger:         '⚠️ Danger potentiel'
};

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

// ── Charger et afficher les signalements ──────────────────────────────────
async function chargerSignalements() {
  const container = document.getElementById('signalements-container');
  if (!container) {
    setTimeout(chargerSignalements, 50);
    return;
  }

  // Savoir si l'utilisateur est connecté (pour afficher le bouton supprimer)
  let estConnecte = false;
  try {
    const session = await fetch('/api/auth/me').then(r => r.json());
    estConnecte = session.connecte;
  } catch {
    estConnecte = false;
  }

  // Charger les signalements depuis l'API
  try {
    const signalements = await fetch('/api/signalements').then(r => r.json());

    // Aucun signalement
    if (!signalements.length) {
      container.innerHTML = '<p style="color:#1A458B;">Aucun signalement actif pour le moment.</p>';
      return;
    }

    // Construire le tableau HTML
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;margin:20px 0;font-size:0.95rem;';
    table.innerHTML = `
      <thead>
        <tr style="background:#1A458B;color:white;">
          <th style="padding:10px;text-align:left;">Type</th>
          <th style="padding:10px;text-align:left;">Lieu</th>
          <th style="padding:10px;text-align:left;">Urgent</th>
          <th style="padding:10px;text-align:left;">Date</th>
          <th style="padding:10px;text-align:left;">Signalé par</th>
          ${estConnecte ? '<th style="padding:10px;"></th>' : ''}
        </tr>
      </thead>
      <tbody id="tbody-signalements"></tbody>
    `;

    container.innerHTML = '';
    container.appendChild(table);

    const tbody = document.getElementById('tbody-signalements');

    // Remplir le tableau ligne par ligne
    signalements.forEach((s, index) => {
      const ligne = document.createElement('tr');
      ligne.style.background   = index % 2 === 0 ? '#fff' : '#f5f0ee';
      ligne.style.borderBottom = '1px solid #ddd';

      const lieu      = s.lieu_texte || (s.latitude ? `GPS: ${(+s.latitude).toFixed(4)}, ${(+s.longitude).toFixed(4)}` : '—');
      const date      = new Date(s.cree_le).toLocaleDateString('fr-FR');
      const typeLabel = LABELS[s.type_signal] || s.type_signal;
      const urgentTxt = s.urgent ? '🔴 Oui' : 'Non';

      ligne.innerHTML = `
        <td style="padding:10px;font-weight:bold;color:#FF0000;">${typeLabel}</td>
        <td style="padding:10px;">${lieu}</td>
        <td style="padding:10px;">${urgentTxt}</td>
        <td style="padding:10px;">${date}</td>
        <td style="padding:10px;font-size:0.85rem;">${s.auteur || '—'}</td>
        ${estConnecte ? `
          <td style="padding:10px;">
            <button
              onclick="supprimerSignalement(${s.id}, this)"
              style="background:transparent;border:2px solid #FF0000;color:#FF0000;padding:4px 10px;border-radius:6px;cursor:pointer;font-weight:bold;"
              title="Supprimer">✕
            </button>
          </td>` : ''}
      `;

      tbody.appendChild(ligne);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="color:red;">Erreur lors du chargement des signalements.</p>';
  }
}

// ── Supprimer un signalement ──────────────────────────────────────────────
async function supprimerSignalement(id, bouton) {
  if (!confirm('Voulez-vous vraiment supprimer ce signalement ?')) return;

  try {
    const reponse = await fetch('/api/signalements/' + id, { method: 'DELETE' });
    const data    = await reponse.json();

    if (data.ok) {
      bouton.closest('tr').remove();
      afficherMessage('Signalement supprimé.', 'ok');
    } else {
      afficherMessage(data.erreur || 'Non autorisé.', 'err');
    }
  } catch {
    afficherMessage('Impossible de contacter le serveur.', 'err');
  }
}

// Démarrer
chargerSignalements();
