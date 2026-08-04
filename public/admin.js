let currentContent = null;

async function init() {
  const res = await fetch('/api/content');
  currentContent = await res.json();
  renderForm();
}

function renderForm() {
  const container = document.getElementById('form-container');
  const c = currentContent;
  container.innerHTML = `
    <h2>Réglages généraux</h2>
    <label>Lien Calendly (CTA "Réserver ma démo")</label>
    <input data-path="meta.calendlyUrl" value="${escAttr(c.meta.calendlyUrl)}" />

    <h2>Bandeau (hero)</h2>
    <label>Eyebrow</label>
    <input data-path="hero.eyebrow" value="${escAttr(c.hero.eyebrow)}" />
    <label>Titre principal</label>
    <textarea data-path="hero.headline">${escText(c.hero.headline)}</textarea>
    <label>Sous-titre</label>
    <textarea data-path="hero.subheadline">${escText(c.hero.subheadline)}</textarea>
    <label>Texte du bouton</label>
    <input data-path="hero.ctaLabel" value="${escAttr(c.hero.ctaLabel)}" />
    <label>Sous-texte du bouton</label>
    <input data-path="hero.ctaSubtext" value="${escAttr(c.hero.ctaSubtext)}" />
    <label>Statistique — valeur</label>
    <input data-path="hero.statValue" value="${escAttr(c.hero.statValue)}" />
    <label>Statistique — légende</label>
    <input data-path="hero.statCaption" value="${escAttr(c.hero.statCaption)}" />

    <h2>Comparatif de scripts</h2>
    <label>Titre de section</label>
    <input data-path="scriptDemo.title" value="${escAttr(c.scriptDemo.title)}" />
    <label>Script générique (une ligne par phrase)</label>
    <textarea data-path="scriptDemo.generic.lines" data-type="lines">${c.scriptDemo.generic.lines.join('\n')}</textarea>
    <label>Script Adonis (une ligne par phrase)</label>
    <textarea data-path="scriptDemo.adonis.lines" data-type="lines">${c.scriptDemo.adonis.lines.join('\n')}</textarea>

    <h2>Le constat (problème)</h2>
    <label>Titre de section</label>
    <input data-path="problem.title" value="${escAttr(c.problem.title)}" />
    ${c.problem.points.map((p, i) => `
      <div class="repeat-item">
        <label>Chiffre</label>
        <input data-path="problem.points.${i}.stat" value="${escAttr(p.stat)}" />
        <label>Label</label>
        <input data-path="problem.points.${i}.label" value="${escAttr(p.label)}" />
        <label>Texte</label>
        <textarea data-path="problem.points.${i}.text">${escText(p.text)}</textarea>
      </div>
    `).join('')}

    <h2>La solution</h2>
    <label>Titre de section</label>
    <input data-path="solution.title" value="${escAttr(c.solution.title)}" />
    ${c.solution.steps.map((s, i) => `
      <div class="repeat-item">
        <label>Titre de l'étape</label>
        <input data-path="solution.steps.${i}.title" value="${escAttr(s.title)}" />
        <label>Texte</label>
        <textarea data-path="solution.steps.${i}.text">${escText(s.text)}</textarea>
      </div>
    `).join('')}

    <h2>Objections / réassurance</h2>
    <label>Titre de section</label>
    <input data-path="trust.title" value="${escAttr(c.trust.title)}" />
    ${c.trust.objections.map((o, i) => `
      <div class="repeat-item">
        <label>Objection</label>
        <textarea data-path="trust.objections.${i}.question">${escText(o.question)}</textarea>
        <label>Réponse</label>
        <textarea data-path="trust.objections.${i}.answer">${escText(o.answer)}</textarea>
      </div>
    `).join('')}

    <h2>Bloc final (CTA + formulaire)</h2>
    <label>Titre</label>
    <input data-path="finalCta.title" value="${escAttr(c.finalCta.title)}" />
    <label>Sous-titre</label>
    <textarea data-path="finalCta.subtitle">${escText(c.finalCta.subtitle)}</textarea>
    <label>Titre du formulaire</label>
    <input data-path="finalCta.formTitle" value="${escAttr(c.finalCta.formTitle)}" />

    <h2>Pied de page</h2>
    <input data-path="footer.text" value="${escAttr(c.footer.text)}" />
  `;
}

function getByPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function setByPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function escText(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

document.getElementById('save-btn').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('[data-path]');
  inputs.forEach(input => {
    const path = input.dataset.path;
    if (input.dataset.type === 'lines') {
      setByPath(currentContent, path, input.value.split('\n').filter(Boolean));
    } else {
      setByPath(currentContent, path, input.value);
    }
  });

  const password = document.getElementById('password').value;
  const status = document.getElementById('status');
  status.textContent = 'Enregistrement...';
  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, content: currentContent })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur');
    }
    status.textContent = 'Enregistré. Rafraîchis la landing page pour voir les changements.';
    status.style.color = '#2f7a3d';
  } catch (err) {
    status.textContent = err.message;
    status.style.color = '#b3261e';
  }
});

document.getElementById('load-leads-btn').addEventListener('click', async () => {
  const password = document.getElementById('password').value;
  const container = document.getElementById('leads-container');
  container.textContent = 'Chargement...';
  try {
    const res = await fetch(`/api/leads?password=${encodeURIComponent(password)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur');
    }
    const data = await res.json();
    if (data.leads.length === 0) {
      container.textContent = 'Aucun lead pour le moment.';
      return;
    }
    container.innerHTML = `
      <table>
        <tr><th>Nom</th><th>Email</th><th>Entreprise</th><th>Taille équipe</th><th>Date</th></tr>
        ${data.leads.map(l => `
          <tr>
            <td>${escText(l.name)}</td>
            <td>${escText(l.email)}</td>
            <td>${escText(l.company)}</td>
            <td>${escText(l.teamSize)}</td>
            <td>${new Date(l.submittedAt).toLocaleString('fr-FR')}</td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (err) {
    container.textContent = err.message;
  }
});

init();
