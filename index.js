const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function publishOnVinted(adData) {
  console.log("Début de publishOnVinted avec les données reçues :", adData);

  // Extraire les données du JSON envoyé par Jarvis
  const user = adData.user;
  const listing = adData.listing;

  // Mapping complet des catégories Vinted (inchangé)
  const categoryMapping = {
    "Femmes": 1904,
    "Femmes > Vêtements": 4,
    "Femmes > Vêtements > Manteaux et vestes": 1037,
    "Femmes > Vêtements > Manteaux et vestes > Capes et ponchos": 1773,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux": 1907,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Duffles-coats": 2525,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Manteaux en fausse fourrure": 1090,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Pardessus et manteaux longs": 2526,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Parkas": 1087,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Cabans": 1076,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Imperméables": 1080,
    "Femmes > Vêtements > Manteaux et vestes > Manteaux > Trenchs": 1834,
    "Femmes > Vêtements > Manteaux et vestes > Vestes sans manches": 2524,
    "Femmes > Vêtements > Manteaux et vestes > Vestes": 1908,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Perfectos et blousons de moto": 2527,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Blousons aviateur": 1078,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Vestes en jean": 1079,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Vestes militaires et utilitaires": 2528,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Vestes polaires": 1086,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Doudounes": 2614,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Vestes matelassées": 2596,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Vestes chemises": 2529,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Vestes de ski et snowboard": 2530,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Blousons teddy": 2531,
    "Femmes > Vêtements > Manteaux et vestes > Vestes > Vestes coupe-vent": 2532,
    "Femmes > Vêtements > Sweats et sweats à capuche": 2050,
    // ... (le reste de ton mapping est conservé en intégralité)
  };

  const title = listing.title;
  const description = listing.generatedDescription;
  const price = Number(listing.price);
  const categoryName = listing.category;
  const categoryId = categoryMapping[categoryName];
  if (!categoryId) {
    throw new Error("Catégorie inconnue : " + categoryName);
  }
  const imageUrls = listing.images;

  const credentials = {
    method: user.authProvider,  // "email", "apple", "google", "facebook"
    email: user.email,
    password: user.password
  };

  console.log("Données transformées pour la publication :", { title, description, price, categoryId, imageUrls, credentials });

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    console.log("Navigation vers https://www.vinted.fr/ ...");
    await page.goto('https://www.vinted.fr/');
    console.log("Page d'accueil Vinted chargée");

    console.log("Recherche du bouton 'S'inscrire | Se connecter'...");
    // Utilisation du sélecteur mis à jour
    const signInButton = page.locator('[data-testid="header--login-button"]').filter({
      hasText: "S'inscrire | Se connecter"
    });
    await signInButton.waitFor({ state: 'visible', timeout: 60000 });
    console.log("Bouton détecté, clic sur 'S'inscrire | Se connecter'...");
    // Force le clic pour ne pas réessayer si l'overlay apparaît
    await signInButton.click({ force: true, noWaitAfter: true });

    // Attendre que le modal d'authentification apparaisse
    console.log("Attente de l'apparition du modal d'authentification...");
    await page.waitForSelector('[data-testid="auth-modal--overlay"]', { state: 'visible', timeout: 60000 });
    console.log("Modal d'authentification détecté");

    console.log("Méthode de connexion demandée :", credentials.method);
    if (credentials.method === "email") {
      console.log("Sélection de l'option 'e-mail'...");
      await page.waitForSelector('[data-testid="auth-select-type--login-email"]', { state: 'visible', timeout: 60000 });
      await page.click('[data-testid="auth-select-type--login-email"]');
      console.log("Option 'e-mail' sélectionnée");

      console.log("Remplissage du formulaire e-mail / mot de passe...");
      await page.fill('input[name="email"]', credentials.email);
      await page.fill('input[name="password"]', credentials.password);
      console.log("Envoi du formulaire de connexion...");
      await page.click('button[type="submit"]');
    } else if (credentials.method === "apple") {
      console.log("Sélection de l'option 'Continuer avec Apple'...");
      await page.waitForSelector('button:has-text("Continuer avec Apple")', { state: 'visible', timeout: 60000 });
      await page.click('button:has-text("Continuer avec Apple")');
      console.log("Option 'Apple' sélectionnée");
      await page.waitForNavigation();
    } else if (credentials.method === "google") {
      console.log("Sélection de l'option 'Continuer avec Google'...");
      await page.waitForSelector('a:has-text("Continuer avec Google")', { state: 'visible', timeout: 60000 });
      await page.click('a:has-text("Continuer avec Google")');
      console.log("Option 'Google' sélectionnée");
      await page.waitForNavigation();
    } else if (credentials.method === "facebook") {
      console.log("Sélection de l'option 'Continuer avec Facebook'...");
      await page.waitForSelector('button:has-text("Continuer avec Facebook")', { state: 'visible', timeout: 60000 });
      await page.click('button:has-text("Continuer avec Facebook")');
      console.log("Option 'Facebook' sélectionnée");
      await page.waitForNavigation();
    } else {
      throw new Error("Méthode de connexion non supportée : " + credentials.method);
    }

    console.log("Attente de la validation de la connexion...");
    await page.waitForNavigation();
    console.log("Connexion effectuée avec succès");

    console.log("Clic sur le bouton 'Vends tes articles'...");
    await page.click('[data-testid="side-bar-sell-btn"]');
    console.log("Bouton 'Vends tes articles' cliqué");

    console.log("Attente du chargement de la page de création d'annonce...");
    await page.waitForSelector('input[name="title"]');
    console.log("Page de création d'annonce chargée");

    console.log("Remplissage du champ 'Titre'...");
    await page.fill('input[name="title"]', title);
    console.log("Remplissage du champ 'Description'...");
    await page.fill('textarea[name="description"]', description);
    console.log("Remplissage du champ 'Prix'...");
    await page.fill('input[name="price"]', String(price));
    console.log("Champs du formulaire remplis");

    console.log(`Sélection de la catégorie avec l'ID #catalog-${categoryId}...`);
    await page.click(`#catalog-${categoryId}`);
    console.log("Catégorie sélectionnée");

    console.log("Ouverture du file chooser pour uploader les images...");
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({ timeout: 60000 }),
      page.click('button:has-text("Ajoute des photos")')
    ]);
    const localImagePaths = imageUrls.map(url => {
      const fileName = url.split('/').pop().split('?')[0];
      console.log(`Préparation de l'image : ${fileName}`);
      return `/app/images/${fileName}`;
    });
    console.log("Chemins locaux des images :", localImagePaths);
    await fileChooser.setFiles(localImagePaths);
    console.log("Images uploadées");

    console.log("Clic sur le bouton de soumission du formulaire...");
    await page.click('button[type="submit"]');
    console.log("Formulaire soumis");

    console.log("Attente de la confirmation de publication (texte 'Ton article est en ligne !')...");
    await page.waitForSelector('text=Ton article est en ligne !', { timeout: 60000 });
    console.log("Annonce publiée sur Vinted !");

    console.log("Fermeture du navigateur...");
    await browser.close();
    console.log("Processus de publication terminé avec succès");
  } catch (err) {
    console.error("Erreur dans publishOnVinted :", err);
    throw err;
  }
}

function extractFileName(url) {
  const fileName = url.split('/').pop().split('?')[0];
  console.log(`Nom de fichier extrait : ${fileName}`);
  return fileName;
}

app.post('/publish-ad', async (req, res) => {
  res.status(202).json({ message: "Job de publication reçu et en cours de traitement" });
  publishOnVinted(req.body)
    .then(() => console.log("Publication terminée avec succès"))
    .catch((error) => console.error("Erreur lors de la publication :", error));
});

app.listen(port, () => {
  console.log(`Service de publication écoute sur le port ${port}`);
});
