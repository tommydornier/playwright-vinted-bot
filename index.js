const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Utilitaires pour la session
function getSessionPath(email) {
  return path.join(__dirname, 'sessions', `${Buffer.from(email).toString('base64')}.json`);
}

async function saveSession(context, email) {
  const storageState = await context.storageState();
  const sessionPath = getSessionPath(email);
  fs.mkdirSync(path.dirname(sessionPath), { recursive: true });
  fs.writeFileSync(sessionPath, JSON.stringify(storageState, null, 2));
  console.log(`Session sauvegardée pour ${email}`);
}

function getSessionStorageStatePath(email) {
  const sessionFile = getSessionPath(email);
  return fs.existsSync(sessionFile) ? sessionFile : null;
}

// Endpoint pour la première connexion manuelle
app.get('/login-manual', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send('Email requis');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.vinted.fr/');
  console.log("Veuillez vous connecter manuellement à Vinted...");

  try {
    await page.waitForSelector('[data-testid="side-bar-sell-btn"]', { timeout: 300000 });
    console.log("Connexion réussie !");
    await saveSession(context, email);
    await browser.close();
    res.send('Connexion réussie et session sauvegardée !');
  } catch (err) {
    console.error("Échec de la connexion :", err);
    await browser.close();
    res.status(500).send("Échec de la connexion : délai dépassé ou erreur.");
  }
});

// Fonction principale de publication
async function publishOnVinted(adData) {
  const user = adData.user;
  const listing = adData.listing;
  const credentials = {
    method: user.authProvider,
    email: user.email,
    password: user.password
  };

  const sessionPath = getSessionStorageStatePath(credentials.email);
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  if (!sessionPath) {
    throw new Error("Aucune session existante. Connectez-vous d'abord via /login-manual.");
  }

  const context = await browser.newContext({ storageState: sessionPath });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  await page.goto('https://www.vinted.fr/');
  await page.waitForSelector('[data-testid="side-bar-sell-btn"]');
  await page.click('[data-testid="side-bar-sell-btn"]');
  await page.waitForSelector('input[name="title"]');

  await page.fill('input[name="title"]', listing.title);
  await page.fill('textarea[name="description"]', listing.generatedDescription);
  await page.fill('input[name="price"]', String(listing.price));

  const categoryMapping = {
    "Femmes": 1904,
    "Femmes > Vêtements": 4,
    "Femmes > Vêtements > Manteaux et vestes": 1037,
    "Femmes > Vêtements > Manteaux et vestes > Capes et ponchos": 1773,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux": 1907,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Duffles-coats": 2525
  };

  const categoryId = categoryMapping[listing.category];
  if (!categoryId) throw new Error("Catégorie inconnue : " + listing.category);
  await page.click(`#catalog-${categoryId}`);

  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('button:has-text("Ajoute des photos")')
  ]);

  const localImagePaths = listing.images.map(url => {
    const fileName = url.split('/').pop().split('?')[0];
    return `/app/images/${fileName}`;
  });

  await fileChooser.setFiles(localImagePaths);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=Ton article est en ligne !');
  console.log("Annonce publiée !");
  await browser.close();
}

// Endpoint d’API
app.post('/publish-ad', async (req, res) => {
  res.status(202).json({ message: "Publication en cours..." });
  publishOnVinted(req.body)
    .then(() => console.log("Publication terminée"))
    .catch(err => console.error("Erreur publication :", err));
});

// Lancement serveur
app.listen(port, () => {
  console.log(`Serveur actif sur le port ${port}`);
});
