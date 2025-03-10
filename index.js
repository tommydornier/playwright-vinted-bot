async function publishOnVinted(adData) {
  console.log("Début de publishOnVinted avec les données reçues :", adData);

  // Extraire les données du JSON envoyé par Jarvis
  const user = adData.user;
  const listing = adData.listing;

  // Table de correspondance (mapping) des catégories
  // Exemple : "Duffle-coats" correspond à l'ID 2525 sur Vinted
  const categoryMapping = {
    "Duffle-coats": 2525
    // Ajoute ici d'autres correspondances si nécessaire
  };

  // Extraire et transformer les données
  const title = listing.title;
  const description = listing.generatedDescription; // ou concaténer avec generatedHashtags si besoin
  const price = Number(listing.price);
  const categoryName = listing.category; // Par exemple "Duffle-coats"
  const categoryId = categoryMapping[categoryName];
  if (!categoryId) {
    throw new Error("Catégorie inconnue : " + categoryName);
  }
  const imageUrls = listing.images;
  
  // Récupérer les credentials depuis les variables d'environnement
  const credentials = {
    method: user.authProvider, // Par exemple "google", "apple", "facebook", "email", etc.
    email: process.env.VINTED_EMAIL,
    password: process.env.VINTED_PASSWORD
  };

  console.log("Données transformées pour la publication :", { title, description, price, categoryId, imageUrls, credentials });

  // Lancer Chromium en mode headless
  console.log("Lancement du navigateur...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Accéder à la page d'accueil de Vinted
  console.log("Navigation vers https://www.vinted.fr/ ...");
  await page.goto('https://www.vinted.fr/');
  console.log("Page d'accueil Vinted chargée");

  // 2. Cliquer sur le bouton "S'inscrire | Se connecter"
  console.log("Clic sur le bouton 'S'inscrire | Se connecter'...");
  await page.click('[data-testid="side-bar-signin-btn"]');
  console.log("Bouton 'S'inscrire | Se connecter' cliqué");

  // 3. Choisir la méthode de connexion en fonction de credentials.method
  console.log("Méthode de connexion demandée :", credentials.method);
  if (credentials.method === "email") {
    console.log("Sélection de l'option 'e-mail'...");
    await page.click('span:has-text("e-mail")');
    console.log("Option de connexion par e-mail sélectionnée");

    console.log("Remplissage du formulaire de connexion...");
    await page.fill('input[name="email"]', credentials.email);
    await page.fill('input[name="password"]', credentials.password);
    console.log("Envoi du formulaire de connexion...");
    await page.click('button[type="submit"]');
  } else if (credentials.method === "apple") {
    console.log("Sélection de l'option 'Continuer avec Apple'...");
    await page.click('button:has-text("Continuer avec Apple")');
    console.log("Option de connexion avec Apple sélectionnée");
    await page.waitForNavigation();
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

  // 4. Attendre que la connexion soit validée
  console.log("Attente de la validation de la connexion...");
  await page.waitForNavigation();
  console.log("Connexion effectuée");

  // 5. Cliquer sur "Vends tes articles" pour accéder à la page de création d'annonce
  console.log("Clic sur le bouton 'Vends tes articles'...");
  await page.click('[data-testid="side-bar-sell-btn"]');
  console.log("Bouton 'Vends tes articles' cliqué");

  // 6. Attendre que la page de création d'annonce soit chargée (exemple : champ 'Titre')
  console.log("Attente du chargement de la page de création d'annonce...");
  await page.waitForSelector('input[name="title"]');
  console.log("Page de création d'annonce chargée");

  // 7. Remplir les champs du formulaire de l'annonce
  console.log("Remplissage du champ 'Titre'...");
  await page.fill('input[name="title"]', title);
  console.log("Remplissage du champ 'Description'...");
  await page.fill('textarea[name="description"]', description);
  console.log("Remplissage du champ 'Prix'...");
  await page.fill('input[name="price"]', String(price));
  console.log("Champs du formulaire remplis");

  // 8. Sélectionner la catégorie
  console.log(`Sélection de la catégorie avec l'ID #catalog-${categoryId}...`);
  await page.click(`#catalog-${categoryId}`);
  console.log("Catégorie sélectionnée");

  // 9. Uploader les images
  console.log("Ouverture du file chooser pour uploader les images...");
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
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

  // 10. Soumettre le formulaire de publication
  console.log("Clic sur le bouton de soumission du formulaire...");
  await page.click('button[type="submit"]');
  console.log("Formulaire soumis");

  // 11. Attendre la confirmation de publication
  console.log("Attente de la confirmation de publication (texte 'Ton article est en ligne !')...");
  await page.waitForSelector('text=Ton article est en ligne !', { timeout: 60000 });
  console.log("Annonce publiée sur Vinted !");

  // 12. Fermer le navigateur
  console.log("Fermeture du navigateur...");
  await browser.close();
  console.log("Processus de publication terminé");
}

// Fonction utilitaire pour extraire le nom de fichier d'une URL
function extractFileName(url) {
  const fileName = url.split('/').pop().split('?')[0];
  console.log(`Nom de fichier extrait : ${fileName}`);
  return fileName;
}
