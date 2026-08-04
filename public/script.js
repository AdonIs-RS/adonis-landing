async function loadContent() {
  const res = await fetch('/api/content');
  const c = await res.json();

  document.title = c.meta.siteTitle;

  // Nav
  document.getElementById('nav-logo').textContent = c.nav.logo;
  document.getElementById('nav-cta').textContent = c.nav.ctaLabel;

  // Hero
  document.getElementById('hero-eyebrow').textContent = c.hero.eyebrow;
  document.getElementById('hero-headline').textContent = c.hero.headline;
  document.getElementById('hero-sub').textContent = c.hero.subheadline;
  document.getElementById('hero-cta').textContent = c.hero.ctaLabel;
  document.getElementById('hero-cta-sub').textContent = c.hero.ctaSubtext;
  document.getElementById('hero-stat-label').textContent = c.hero.statLabel;
  document.getElementById('hero-stat-value').textContent = c.hero.statValue;
  document.getElementById('hero-stat-caption').textContent = c.hero.statCaption;

  // Script demo
  document.getElementById('demo-eyebrow').textContent = c.scriptDemo.eyebrow;
  document.getElementById('demo-title').textContent = c.scriptDemo.title;
  document.getElementById('demo-generic-label').textContent = c.scriptDemo.generic.label;
  document.getElementById('demo-adonis-label').textContent = c.scriptDemo.adonis.label;
  fillList('demo-generic-lines', c.scriptDemo.generic.lines);
  fillList('demo-adonis-lines', c.scriptDemo.adonis.lines);

  // Problem
  document.getElementById('problem-eyebrow').textContent = c.problem.eyebrow;
  document.getElementById('problem-title').textContent = c.problem.title;
  const problemGrid = document.getElementById('problem-grid');
  problemGrid.innerHTML = c.problem.points.map(p => `
    <div class="problem-item">
      <span class="p-stat">${escapeHtml(p.stat)}</span>
      <span class="p-label">${escapeHtml(p.label)}</span>
      <p class="p-text">${escapeHtml(p.text)}</p>
    </div>
  `).join('');

  // Solution
  document.getElementById('solution-eyebrow').textContent = c.solution.eyebrow;
  document.getElementById('solution-title').textContent = c.solution.title;
  const solutionGrid = document.getElementById('solution-grid');
  solutionGrid.innerHTML = c.solution.steps.map(s => `
    <div class="solution-item">
      <span class="s-number">${escapeHtml(s.number)}</span>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.text)}</p>
    </div>
  `).join('');

  // Trust
  document.getElementById('trust-eyebrow').textContent = c.trust.eyebrow;
  document.getElementById('trust-title').textContent = c.trust.title;
  const trustGrid = document.getElementById('trust-grid');
  trustGrid.innerHTML = c.trust.objections.map(o => `
    <div class="trust-item">
      <p class="t-q">${escapeHtml(o.question)}</p>
      <p class="t-a">${escapeHtml(o.answer)}</p>
    </div>
  `).join('');

  // Final CTA
  document.getElementById('final-title').textContent = c.finalCta.title;
  document.getElementById('final-sub').textContent = c.finalCta.subtitle;
  const finalBtn = document.getElementById('final-cta-btn');
  finalBtn.textContent = c.finalCta.ctaLabel;
  finalBtn.href = c.meta.calendlyUrl;
  document.getElementById('form-title').textContent = c.finalCta.formTitle;
  document.getElementById('form-sub').textContent = c.finalCta.formSubtitle;

  // Hero + nav CTA link to Calendly directly too
  document.getElementById('hero-cta').href = c.meta.calendlyUrl;
  document.getElementById('hero-cta').target = '_blank';
  document.getElementById('nav-cta').href = c.meta.calendlyUrl;
  document.getElementById('nav-cta').target = '_blank';

  // Footer
  document.getElementById('footer-text').textContent = c.footer.text;
}

function fillList(id, items) {
  const el = document.getElementById(id);
  el.innerHTML = items.map(line => `<li>${escapeHtml(line)}</li>`).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const message = document.getElementById('form-message');
  message.textContent = 'Envoi en cours...';
  message.style.color = 'inherit';
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('failed');
    message.textContent = 'Merci ! Nous revenons vers vous sous 24h.';
    message.style.color = '#2f7a3d';
    form.reset();
  } catch (err) {
    message.textContent = "Erreur d'envoi, réessayez.";
    message.style.color = '#b3261e';
  }
});

loadContent();
