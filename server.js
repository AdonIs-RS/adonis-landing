const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adonis2026';

const CONTENT_PATH = path.join(__dirname, 'data', 'content.json');
const LEADS_PATH = path.join(__dirname, 'data', 'leads.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Contenu de la landing (lecture publique) ---
app.get('/api/content', (req, res) => {
  try {
    res.json(readJSON(CONTENT_PATH));
  } catch (err) {
    res.status(500).json({ error: 'Impossible de lire le contenu.' });
  }
});

// --- Mise à jour du contenu (protégée par mot de passe admin) ---
app.put('/api/content', (req, res) => {
  const { password, content } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }
  if (!content) {
    return res.status(400).json({ error: 'Contenu manquant.' });
  }
  try {
    writeJSON(CONTENT_PATH, content);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Impossible d'enregistrer le contenu." });
  }
});

// --- Collecte de leads (formulaire de contact) ---
app.post('/api/leads', (req, res) => {
  const { name, email, company, teamSize } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nom et email requis.' });
  }
  try {
    const store = readJSON(LEADS_PATH);
    store.leads.push({
      name,
      email,
      company: company || '',
      teamSize: teamSize || '',
      submittedAt: new Date().toISOString()
    });
    writeJSON(LEADS_PATH, store);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Impossible d'enregistrer le lead." });
  }
});

// --- Consultation des leads (protégée par mot de passe admin) ---
app.get('/api/leads', (req, res) => {
  const password = req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }
  try {
    res.json(readJSON(LEADS_PATH));
  } catch (err) {
    res.status(500).json({ error: 'Impossible de lire les leads.' });
  }
});

app.listen(PORT, () => {
  console.log(`Adonis landing en ligne sur le port ${PORT}`);
});
