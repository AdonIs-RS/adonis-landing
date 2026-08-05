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

async function createHubspotContact(lead) {
  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        firstname: lead.name,
        email: lead.email,
        company: lead.company,
        jobtitle: lead.jobTitle,
        city: lead.location,
        website: lead.linkedinUrl,
        taille_equipe_commerciale: lead.teamSize
      }
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HubSpot error ${res.status}: ${errText}`);
  }
  return res.json();
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
app.post('/api/leads', async (req, res) => {
  const { name, email, company, teamSize, jobTitle, location, linkedinUrl } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nom et email requis.' });
  }
  const lead = {
    name,
    email,
    company: company || '',
    teamSize: teamSize || '',
    jobTitle: jobTitle || '',
    location: location || '',
    linkedinUrl: linkedinUrl || '',
    submittedAt: new Date().toISOString()
  };

  try {
    const store = readJSON(LEADS_PATH);
    store.leads.push(lead);
    writeJSON(LEADS_PATH, store);
  } catch (err) {
    console.error('Erreur sauvegarde locale:', err);
  }

  console.log('HUBSPOT_TOKEN présent ?', !!process.env.HUBSPOT_TOKEN);

  if (process.env.HUBSPOT_TOKEN) {
    console.log('Tentative de création du contact HubSpot pour', lead.email);
    try {
      const result = await createHubspotContact(lead);
      console.log('Contact HubSpot créé avec succès, ID:', result.id);
    } catch (err) {
      console.error('Erreur création contact HubSpot:', err.message);
    }
  } else {
    console.log('HUBSPOT_TOKEN absent, création HubSpot ignorée.');
  }

  res.json({ ok: true });
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
