async function publishOnVinted(adData) {
  // Lancer Chromium en mode headless
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Accéder à la page d'accueil de Vinted
  await page.goto('https://www.vinted.fr/');
  console.log("Page d'accueil Vinted chargée");

  // 2. Cliquer sur le bouton "S'inscrire | Se connecter"
  await page.click('[data-testid="side-bar-signin-btn"]');
  console.log("Bouton 'S'inscrire | Se connecter' cliqué");

  // 3. Choisir la méthode de connexion en fonction de adData.credentials.method
  const loginMethod = adData.credentials.method;
  if (loginMethod === "email") {
    // Pour se connecter via e-mail, on clique sur le texte "e-mail"
    await page.click('span:has-text("e-mail")');
    console.log("Option de connexion par e-mail sélectionnée");

    // Remplir le formulaire de connexion
    await page.fill('input[name="email"]', adData.credentials.email);
    await page.fill('input[name="password"]', adData.credentials.password);
    // Cliquer sur le bouton de soumission (supposé être de type submit)
    await page.click('button[type="submit"]');
  } else if (loginMethod === "apple") {
    // Cliquer sur le bouton "Continuer avec Apple"
    await page.click('button:has-text("Continuer avec Apple")');
    console.log("Option de connexion avec Apple sélectionnée");
    // Ici, le processus de connexion via Apple sera géré par Vinted (souvent avec un redirect)
    // Tu peux ajouter un waitForNavigation() si nécessaire.
    await page.waitForNavigation();
  } else if (loginMethod === "google") {
    // Cliquer sur le lien "Continuer avec Google"
    await page.click('a:has-text("Continuer avec Google")');
    console.log("Option de connexion avec Google sélectionnée");
    await page.waitForNavigation();
  } else if (loginMethod === "facebook") {
    // Cliquer sur le bouton "Continuer avec Facebook"
    await page.click('button:has-text("Continuer avec Facebook")');
    console.log("Option de connexion avec Facebook sélectionnée");
    await page.waitForNavigation();
  } else {
    throw new Error("Méthode de connexion non supportée : " + loginMethod);
  }

  // Attendre que la connexion soit validée (par exemple, en attendant la navigation)
  await page.waitForNavigation();
  console.log("Connexion effectuée");

  // 4. Cliquer sur "Vends tes articles" pour accéder à la page de création d'annonce
  await page.click('[data-testid="side-bar-sell-btn"]');
  console.log("Bouton 'Vends tes articles' cliqué");

  // Attendre que la page de création d'annonce soit chargée (par exemple, en attendant le champ titre)
  await page.waitForSelector('input[name="title"]');
  console.log("Page de création d'annonce chargée");

  // 5. Remplir les champs du formulaire de l'annonce
  await page.fill('input[name="title"]', adData.title);
  await page.fill('textarea[name="description"]', adData.description);
  await page.fill('input[name="price"]', String(adData.price));
  console.log("Champs du formulaire remplis");

  // 6. Sélectionner la catégorie
  // On utilise ici l'ID pour cliquer sur le bon élément, par exemple "#catalog-2525" pour Duffle-coats
  await page.click(`#catalog-${adData.categoryId}`);
  console.log("Catégorie sélectionnée");

  // 7. Uploader les images
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('button:has-text("Ajoute des photos")')
  ]);
  const localImagePaths = adData.imageUrls.map(url => `/app/images/${extractFileName(url)}`);
  await fileChooser.setFiles(localImagePaths);
  console.log("Images uploadées");

  // 8. Soumettre le formulaire de publication
  await page.click('button[type="submit"]');
  console.log("Formulaire soumis");

  // 9. Attendre la confirmation de publication
  await page.waitForSelector('text=Ton article est en ligne !', { timeout: 60000 });
  console.log("Annonce publiée sur Vinted !");

  await browser.close();
}
