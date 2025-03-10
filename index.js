async function publishOnVinted(adData) {
  console.log("Début de publishOnVinted avec les données :", adData);

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

  // 3. Choisir la méthode de connexion en fonction de adData.credentials.method
  const loginMethod = adData.credentials.method;
  console.log("Méthode de connexion choisie :", loginMethod);
  if (loginMethod === "email") {
    // Pour se connecter via e-mail, on clique sur le texte "e-mail"
    console.log("Sélection de l'option 'e-mail'...");
    await page.click('span:has-text("e-mail")');
    console.log("Option de connexion par e-mail sélectionnée");

    // Remplir le formulaire de connexion
    console.log("Remplissage du champ email...");
    await page.fill('input[name="email"]', adData.credentials.email);
    console.log("Remplissage du champ mot de passe...");
    await page.fill('input[name="password"]', adData.credentials.password);
    console.log("Envoi du formulaire de connexion...");
    await page.click('button[type="submit"]');
  } else if (loginMethod === "apple") {
    console.log("Sélection de l'option 'Continuer avec Apple'...");
    await page.click('button:has-text("Continuer avec Apple")');
    console.log("Option de connexion avec Apple sélectionnée");
    await page.waitForNavigation();
  } else if (loginMethod === "google") {
    console.log("Sélection de l'option 'Continuer avec Google'...");
    await page.click('a:has-text("Continuer avec Google")');
    console.log("Option de connexion avec Google sélectionnée");
    await page.waitForNavigation();
  } else if (loginMethod === "facebook") {
    console.log("Sélection de l'option 'Continuer avec Facebook'...");
    await page.click('button:has-text("Continuer avec Facebook")');
    console.log("Option de connexion avec Facebook sélectionnée");
    await page.waitForNavigation();
  } else {
    throw new Error("Méthode de connexion non supportée : " + loginMethod);
  }

  // 4. Attendre que la connexion soit validée
  console.log("Attente de la validation de la connexion...");
  await page.waitForNavigation();
  console.log("Connexion effectuée");

  // 5. Cliquer sur "Vends tes articles" pour accéder à la page de création d'annonce
  console.log("Clic sur le bouton 'Vends tes articles'...");
  await page.click('[data-testid="side-bar-sell-btn"]');
  console.log("Bouton 'Vends tes articles' cliqué");

  // 6. Attendre que la page de création d'annonce soit chargée (par exemple, le champ titre)
  console.log("Attente du chargement de la page de création d'annonce...");
  await page.waitForSelector('input[name="title"]');
  console.log("Page de création d'annonce chargée");

  // 7. Remplir les champs du formulaire de l'annonce
  console.log("Remplissage du champ 'Titre'...");
  await page.fill('input[name="title"]', adData.title);
  console.log("Remplissage du champ 'Description'...");
  await page.fill('textarea[name="description"]', adData.description);
  console.log("Remplissage du champ 'Prix'...");
  await page.fill('input[name="price"]', String(adData.price));
  console.log("Champs du formulaire remplis");

  // 8. Sélectionner la catégorie
  console.log(`Sélection de la catégorie avec l'ID #catalog-${adData.categoryId}...`);
  await page.click(`#catalog-${adData.categoryId}`);
  console.log("Catégorie sélectionnée");

  // 9. Uploader les images
  console.log("Clic sur le bouton 'Ajoute des photos' pour ouvrir le file chooser...");
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('button:has-text("Ajoute des photos")')
  ]);
  console.log("File chooser ouvert");

  const localImagePaths = adData.imageUrls.map(url => {
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
