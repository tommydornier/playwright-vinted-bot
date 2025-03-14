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

  // Mapping complet des catégories Vinted
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
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats et sweats à capuche": 577,
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats": 577,
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats > Pulls col V": 1811,
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats > Pulls col roulé": 191,
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats > Sweats longs": 1811,
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats > Pulls d’hiver": 1811,
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats > Sweats manches 3/4": 1811,
    "Femmes > Vêtements > Sweats et sweats à capuche > Sweats > Autres sweats": 1811,
    "Femmes > Vêtements > Sweats et sweats à capuche > Kimonos": 1067,
    "Femmes > Vêtements > Sweats et sweats à capuche > Cardigans": 194,
    "Femmes > Vêtements > Sweats et sweats à capuche > Boléros": 195,
    "Femmes > Vêtements > Sweats et sweats à capuche > Vestes": 1874,
    "Femmes > Vêtements > Sweats et sweats à capuche > Autres pull-overs & sweats-shirt": 197,
    "Femmes > Vêtements > Blazers et tailleurs": 2050,
    "Femmes > Vêtements > Blazers et tailleurs > Blazers": 8,
    "Femmes > Vêtements > Blazers et tailleurs > Ensembles tailleur/pantalon": 8,
    "Femmes > Vêtements > Blazers et tailleurs > Jupes et robes tailleurs": 8,
    "Femmes > Vêtements > Blazers et tailleurs > Tailleurs pièces séparées": 8,
    "Femmes > Vêtements > Blazers et tailleurs > Autres ensembles & tailleurs": 8,
    "Femmes > Vêtements > Robes": 2050,
    "Femmes > Vêtements > Robes > Mini": 574,
    "Femmes > Vêtements > Robes > Midi": 574,
    "Femmes > Vêtements > Robes > Robes longues": 574,
    "Femmes > Vêtements > Robes > Pour occasions": 574,
    "Femmes > Vêtements > Robes > Pour occasions > Fêtes et cocktails": 1774,
    "Femmes > Vêtements > Robes > Pour occasions > Robes de mariée": 1774,
    "Femmes > Vêtements > Robes > Pour occasions > Robes de bal de fin d’année": 1774,
    "Femmes > Vêtements > Robes > Pour occasions > Robes de soirée": 1774,
    "Femmes > Vêtements > Robes > Pour occasions > Robes dos nu": 1774,
    "Femmes > Vêtements > Robes > Robes d’été": 574,
    "Femmes > Vêtements > Robes > Robes d’hiver": 574,
    "Femmes > Vêtements > Robes > Robes chics": 574,
    "Femmes > Vêtements > Robes > Robes casual": 574,
    "Femmes > Vêtements > Robes > Robes sans bretelles": 574,
    "Femmes > Vêtements > Robes > Petites robes noires": 574,
    "Femmes > Vêtements > Robes > Robes en jean": 574,
    "Femmes > Vêtements > Robes > Autres robes": 574,
    "Femmes > Vêtements > Jupes": 2050,
    "Femmes > Vêtements > Jupes > Minijupes": 575,
    "Femmes > Vêtements > Jupes > Jupes longueur genou": 575,
    "Femmes > Vêtements > Jupes > Jupes mi-longues": 575,
    "Femmes > Vêtements > Jupes > Jupes longues": 575,
    "Femmes > Vêtements > Jupes > Jupes asymétriques": 575,
    "Femmes > Vêtements > Jupes > Jupes-shorts": 575,
    "Femmes > Vêtements > Hauts et t-shirts": 2050,
    "Femmes > Vêtements > Hauts et t-shirts > Chemises": 584,
    "Femmes > Vêtements > Hauts et t-shirts > Blouses": 1043,
    "Femmes > Vêtements > Hauts et t-shirts > Vestes": 14,
    "Femmes > Vêtements > Hauts et t-shirts > T-shirts": 221,
    "Femmes > Vêtements > Hauts et t-shirts > Débardeurs": 534,
    "Femmes > Vêtements > Hauts et t-shirts > Tuniques": 227,
    "Femmes > Vêtements > Hauts et t-shirts > Tops courts": 1041,
    "Femmes > Vêtements > Hauts et t-shirts > Blouses manches courtes": 223,
    "Femmes > Vêtements > Hauts et t-shirts > Blouses 3/4": 225,
    "Femmes > Vêtements > Hauts et t-shirts > Blouses manches longues": 224,
    "Femmes > Vêtements > Hauts et t-shirts > Bodies": 1835,
    "Femmes > Vêtements > Hauts et t-shirts > Tops épaules dénudées": 1042,
    "Femmes > Vêtements > Hauts et t-shirts > Cols roulés": 1045,
    "Femmes > Vêtements > Hauts et t-shirts > Tops peplum": 1837,
    "Femmes > Vêtements > Hauts et t-shirts > Tops dos nu": 1044,
    "Femmes > Vêtements > Hauts et t-shirts > Autres hauts": 228,
    // ... (le reste du mapping)
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
    method: user.authProvider,
    email: user.email,
    password: user.password
  };

  console.log("Données transformées pour la publication :", { title, description, price, categoryId, imageUrls, credentials });

  try {
    // Lancer le navigateur en mode non-headless avec slowMo pour visualiser les actions
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);

    console.log("Navigation vers https://www.vinted.fr/ ...");
    await page.goto('https://www.vinted.fr/');
    console.log("Page d'accueil Vinted chargée");

    console.log("Attente du bouton 'S'inscrire | Se connecter'...");
    await page.waitForSelector('[data-testid="side-bar-signin-btn"]', { timeout: 60000 });
    console.log("Bouton trouvé, clic sur 'S'inscrire | Se connecter'...");
    await page.click('[data-testid="side-bar-signin-btn"]');
    console.log("Bouton 'S'inscrire | Se connecter' cliqué");

    console.log("Méthode de connexion demandée :", credentials.method);
    if (credentials.method === "email") {
      console.log("Sélection de l'option 'e-mail'...");
      await page.waitForSelector('span:has-text("e-mail")', { timeout: 60000 });
      await page.click('span:has-text("e-mail")');
      console.log("Option de connexion par e-mail sélectionnée");

      console.log("Remplissage du formulaire de connexion...");
      await page.fill('input[name="email"]', credentials.email);
      await page.fill('input[name="password"]', credentials.password);
      console.log("Envoi du formulaire de connexion...");
      await page.click('button[type="submit"]');
    } else if (credentials.method === "apple") {
      console.log("Sélection de l'option 'Continuer avec Apple'...");
      // Cliquer et attendre l'ouverture d'une nouvelle page pour Apple
      const [applePopup] = await Promise.all([
        browser.waitForEvent('page'),
        page.click('button:has-text("Continuer avec Apple")')
      ]);
      console.log("Fenêtre de connexion Apple détectée");
      await applePopup.waitForLoadState('domcontentloaded');

      console.log("Remplissage du formulaire de connexion Apple...");
      await applePopup.fill('input[type="email"]', credentials.email);
      await applePopup.fill('input[type="password"]', credentials.password);
      console.log("Envoi du formulaire Apple...");
      await applePopup.click('button:has-text("Se connecter")');

      console.log("Attente de la page de confirmation Apple...");
      const [confirmationPage] = await Promise.all([
        browser.waitForEvent('page'),
        applePopup.waitForNavigation({ timeout: 60000 })
      ]);
      await confirmationPage.waitForLoadState('domcontentloaded');
      console.log("Page de confirmation Apple chargée, clic sur 'Continuer'...");
      await confirmationPage.click('button:has-text("Continuer")');
      console.log("Bouton 'Continuer' cliqué sur la page de confirmation Apple");
      await confirmationPage.close();
      console.log("Page de confirmation Apple fermée, retour sur la page principale Vinted...");
      await page.waitForNavigation({ timeout: 60000 });
      console.log("Connexion Apple finalisée");
    } else if (credentials.method === "google") {
      console.log("Sélection de l'option 'Continuer avec Google'...");
      await page.click('a:has-text("Continuer avec Google")');
      console.log("Option de connexion avec Google sélectionnée");
      await page.waitForNavigation();
    } else if (credentials.method === "facebook") {
      console.log("Sélection de l'option 'Continuer avec Facebook'...");
      await page.click('button:has-text("Continuer avec Facebook")');
      console.log("Option de connexion avec Facebook sélectionnée");
      await page.waitForNavigation();
    } else {
      throw new Error("Méthode de connexion non supportée : " + credentials.method);
    }

    console.log("Attente de la validation de la connexion...");
    await page.waitForNavigation();
    console.log("Connexion effectuée");

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
      const fileName = extractFileName(url);
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
    console.log("Processus de publication terminé");
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
  // Répondre immédiatement avec un statut 202 Accepted
  res.status(202).json({ message: "Job de publication reçu et en cours de traitement" });

  // Lancer la publication en arrière-plan
  publishOnVinted(req.body)
    .then(() => {
      console.log("Publication terminée avec succès");
    })
    .catch((error) => {
      console.error("Erreur lors de la publication en arrière-plan :", error);
    });
});

app.listen(port, () => {
  console.log(`Service de publication écoute sur le port ${port}`);
});
