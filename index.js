const express = require('express');
const cors = require('cors'); // Import du module cors
const { chromium } = require('playwright');
const app = express();
const port = process.env.PORT || 3000;

// Active CORS pour toutes les routes
app.use(cors());

// Permet de parser le JSON dans le corps des requêtes
app.use(express.json());

// Route GET de test pour vérifier que l'application fonctionne
app.get('/', (req, res) => {
  res.send('Hello from my Express app!');
});

// Endpoint pour publier l'annonce sur Vinted
app.post('/publish-ad', async (req, res) => {
  try {
    const adData = req.body;
    console.log("Annonce à publier :", adData);

    // Lancer la publication avec Playwright
    await publishOnVinted(adData);

    res.status(200).json({ message: "Annonce publiée avec succès sur Vinted" });
  } catch (error) {
    console.error("Erreur lors de la publication :", error);
    res.status(500).json({ error: "Erreur lors de la publication sur Vinted" });
  }
});

// Fonction qui effectue la publication sur Vinted via Playwright
async function publishOnVinted(adData) {
  // Lancer Chromium en mode headless
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Accéder à la page d'accueil de Vinted
  await page.goto('https://www.vinted.fr/');
  console.log("Page d'accueil Vinted chargée");

  // 2. Cliquer sur "Se connecter" et remplir le formulaire de connexion
  await page.click('text=Se connecter');
  await page.fill('input[name="email"]', adData.credentials.email);
  await page.fill('input[name="password"]', adData.credentials.password);
  await page.click('button[type="submit"]');

  // Attendre que la connexion soit validée (ex. navigation ou affichage d’un élément spécifique)
  await page.waitForNavigation();
  console.log("Connexion effectuée");

  // 3. Aller sur la page de création d'annonce
  await page.goto('https://www.vinted.fr/items/new');
  console.log("Page de création d'annonce chargée");

  // 4. Remplir les champs du formulaire de l'annonce
  await page.fill('input[name="title"]', adData.title);
  await page.fill('textarea[name="description"]', adData.description);
  await page.fill('input[name="price"]', String(adData.price));

  // 5. Sélectionner la catégorie (adapté à ton fichier HTML)
  // Par exemple, si adData.categoryId contient 2525 pour "Duffle-coats"
  await page.click(`#catalog-${adData.categoryId}`);
  console.log("Catégorie sélectionnée");

  // 6. Uploader les images
  // On attend l'ouverture du file chooser après avoir cliqué sur le bouton "Ajoute des photos"
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('button:has-text("Ajoute des photos")')
  ]);

  // On suppose ici que les images sont déjà téléchargées sur le serveur dans /app/images/
  // La fonction extractFileName permet d'extraire le nom du fichier à partir de l'URL Supabase
  const localImagePaths = adData.imageUrls.map(url => `/app/images/${extractFileName(url)}`);
  await fileChooser.setFiles(localImagePaths);
  console.log("Images uploadées");

  // 7. Soumettre le formulaire de publication
  await page.click('button[type="submit"]');
  console.log("Formulaire soumis");

  // 8. Attendre une confirmation de publication (adaptation du sélecteur selon Vinted)
  await page.waitForSelector('text=Ton article est en ligne !', { timeout: 60000 });
  console.log("Annonce publiée sur Vinted !");

  await browser.close();
}

// Fonction utilitaire pour extraire le nom de fichier d'une URL
function extractFileName(url) {
  return url.split('/').pop().split('?')[0];
}

// Message de démarrage et lancement du serveur Express
console.log("=== Mon code Express démarre ===");
app.listen(port, () => {
  console.log(`Service de publication écoute sur le port ${port}`);
});
