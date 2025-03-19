const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { chromium } = require('playwright');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 📂 Dossier pour stocker les sessions utilisateur
const SESSIONS_DIR = path.join(__dirname, 'sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

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
    "Femmes > Vêtements > Jeans": 2050,
    "Femmes > Vêtements > Jeans > Jeans boyfriend": 1839,
    "Femmes > Vêtements > Jeans > Jeans courts": 1840,
    "Femmes > Vêtements > Jeans > Jeans évasés": 1841,
    "Femmes > Vêtements > Jeans > Jeans taille haute": 1842,
    "Femmes > Vêtements > Jeans > Jeans troués": 1843,
    "Femmes > Vêtements > Jeans > Jeans skinny": 1844,
    "Femmes > Vêtements > Jeans > Jeans droits": 1845,
    "Femmes > Vêtements > Jeans > Autres": 1864,
    "Femmes > Vêtements > Pantalons et leggings": 9,
    "Femmes > Vêtements > Pantalons et leggings > Pantalons courts & chinos": 1070,
    "Femmes > Vêtements > Pantalons et leggings > Pantalons à jambes larges": 1071,
    "Femmes > Vêtements > Pantalons et leggings > Pantalons skinny": 185,
    "Femmes > Vêtements > Pantalons et leggings > Pantalons ajustés": 187,
    "Femmes > Vêtements > Pantalons et leggings > Pantalons droits": 1846,
    "Femmes > Vêtements > Pantalons et leggings > Pantalons en cuir": 184,
    "Femmes > Vêtements > Pantalons et leggings > Leggings": 525,
    "Femmes > Vêtements > Pantalons et leggings > Sarouels": 526,
    "Femmes > Vêtements > Pantalons et leggings > Autres pantalons": 189,
    "Femmes > Vêtements > Shorts": 15,
    "Femmes > Vêtements > Shorts > Shorts taille basse": 1838,
    "Femmes > Vêtements > Shorts > Shorts taille haute": 1099,
    "Femmes > Vêtements > Shorts > Shorts longueur genou": 203,
    "Femmes > Vêtements > Shorts > Shorts en jean": 538,
    "Femmes > Vêtements > Shorts > Shorts en dentelle": 1101,
    "Femmes > Vêtements > Shorts > Shorts en cuir": 1100,
    "Femmes > Vêtements > Shorts > Shorts cargo": 1103,
    "Femmes > Vêtements > Shorts > Pantacourts": 204,
    "Femmes > Vêtements > Shorts > Autres shorts": 205,
    "Femmes > Vêtements > Combinaisons et combishorts": 1035,
    "Femmes > Vêtements > Combinaisons et combishorts > Combinaisons": 1131,
    "Femmes > Vêtements > Combinaisons et combishorts > Combi Shorts": 1132,
    "Femmes > Vêtements > Combinaisons et combishorts > Autres combinaisons & combishorts": 1134,
    "Femmes > Vêtements > Maillots de bain": 28,
    "Femmes > Vêtements > Maillots de bain > Une pièce": 218,
    "Femmes > Vêtements > Maillots de bain > Deux pièces": 219,
    "Femmes > Vêtements > Maillots de bain > Paréos sarongs": 1780,
    "Femmes > Vêtements > Maillots de bain > Autres": 220,
    "Femmes > Vêtements > Lingerie et pyjamas": 29,
    "Femmes > Vêtements > Lingerie et pyjamas > Soutiens-gorge": 119,
    "Femmes > Vêtements > Lingerie et pyjamas > Culottes": 120,
    "Femmes > Vêtements > Lingerie et pyjamas > Ensembles": 229,
    "Femmes > Vêtements > Lingerie et pyjamas > Gaines": 1781,
    "Femmes > Vêtements > Lingerie et pyjamas > Pyjamas et tenues de nuit": 123,
    "Femmes > Vêtements > Lingerie et pyjamas > Peignoirs": 1030,
    "Femmes > Vêtements > Lingerie et pyjamas > Collants": 1263,
    "Femmes > Vêtements > Lingerie et pyjamas > Chaussettes": 1262,
    "Femmes > Vêtements > Lingerie et pyjamas > Accessoires de lingerie": 1847,
    "Femmes > Vêtements > Lingerie et pyjamas > Autres": 124,
    "Femmes > Vêtements > Maternité": 1176,
    "Femmes > Vêtements > Maternité > Tops maternité": 1179,
    "Femmes > Vêtements > Maternité > Robes maternité": 1182,
    "Femmes > Vêtements > Maternité > Jupes maternité": 1178,
    "Femmes > Vêtements > Maternité > Pantalons maternité": 1177,
    "Femmes > Vêtements > Maternité > Shorts maternité": 1185,
    "Femmes > Vêtements > Maternité > Combinaisons & combien shorts maternité": 1181,
    "Femmes > Vêtements > Maternité > Pulls à capuche & pulls maternité": 1184,
    "Femmes > Vêtements > Maternité > Manteaux & vestes maternité": 1183,
    "Femmes > Vêtements > Maternité > Maillots & tenues de plage maternité": 1186,
    "Femmes > Vêtements > Maternité > Sous-vêtements maternité": 1614,
    "Femmes > Vêtements > Maternité > Sous-vêtements maternité > Sous-vêtements maternité": 1615,
    "Femmes > Vêtements > Maternité > Sous-vêtements maternité > Tenues de nuit maternité": 1616,
    "Femmes > Vêtements > Maternité > Sous-vêtements maternité > Soutiens-gorge grossesse & allaitement": 1618,
    "Femmes > Vêtements > Maternité > Vêtements de sport": 1176,
    "Femmes > Vêtements > Vêtements de sport": 2050,
    "Femmes > Vêtements > Vêtements de sport > Vêtements d’extérieur": 73,
    "Femmes > Vêtements > Vêtements de sport > Survêtements": 73,
    "Femmes > Vêtements > Vêtements de sport > Pantalons & leggings": 73,
    "Femmes > Vêtements > Vêtements de sport > Shorts": 73,
    "Femmes > Vêtements > Vêtements de sport > Robes": 73,
    "Femmes > Vêtements > Vêtements de sport > Jupes": 73,
    "Femmes > Vêtements > Vêtements de sport > Hauts & t-shirts": 73,
    "Femmes > Vêtements > Vêtements de sport > Sweats & sweats à capuche": 73,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports": 73,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports > Lunettes": 587,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports > Gants": 587,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports > Chapeaux": 587,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports > Protections": 587,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports > Écharpes": 587,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports > Bracelets": 3049,
    "Femmes > Vêtements > Vêtements de sport > Accessoires de sports > Autres accessoires": 1446,
    "Femmes > Vêtements > Vêtements de sport > Brassières": 1439,
    "Femmes > Vêtements > Vêtements de sport > Autres": 580,
    "Femmes > Vêtements > Costumes et tenues particulières": 1782,
    "Femmes > Vêtements > Autres": 18,
    "Femmes > Chaussures": 16,
    "Femmes > Chaussures > Ballerines": 2955,
    "Femmes > Chaussures > Mocassins et chaussures bateau": 2954,
    "Femmes > Chaussures > Bottes": 1049,
    "Femmes > Chaussures > Bottes > Bottines": 2618,
    "Femmes > Chaussures > Bottes > Bottes mi-hautes": 2619,
    "Femmes > Chaussures > Bottes > Bottes hautes": 211,
    "Femmes > Chaussures > Bottes > Cuissardes": 2620,
    "Femmes > Chaussures > Bottes > Bottes de neige": 2621,
    "Femmes > Chaussures > Bottes > Bottes de pluie": 213,
    "Femmes > Chaussures > Bottes > Bottes de travail": 2622,
    "Femmes > Chaussures > Mules et sabots": 2623,
    "Femmes > Chaussures > Espadrilles": 2953,
    "Femmes > Chaussures > Claquettes et tongs": 2952,
    "Femmes > Chaussures > Chaussures à talons": 543,
    "Femmes > Chaussures > Chaussures à lacets": 2951,
    "Femmes > Chaussures > Babies et Mary-Jane": 2950,
    "Femmes > Chaussures > Sandales": 2949,
    "Femmes > Chaussures > Chaussons et pantoufles": 215,
    "Femmes > Chaussures > Chaussures de sport": 2630,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de basket": 2639,
    "Femmes > Chaussures > Chaussures de sport > Chaussures d’escalade": 2640,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de cyclisme": 2641,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de danse": 2642,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de foot": 2643,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de golf": 2644,
    "Femmes > Chaussures > Chaussures de sport > Chaussures et bottes de randonnée": 2645,
    "Femmes > Chaussures > Chaussures de sport > Patins à glace": 2646,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de foot en salle": 2647,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de fitness": 2648,
    "Femmes > Chaussures > Chaussures de sport > Bottes de moto": 2649,
    "Femmes > Chaussures > Chaussures de sport > Patins à roulettes et rollers": 2650,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de course": 2651,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de ski": 2652,
    "Femmes > Chaussures > Chaussures de sport > Bottes de snowboard": 2653,
    "Femmes > Chaussures > Chaussures de sport > Chaussures aquatiques": 2654,
    "Femmes > Chaussures > Chaussures de sport > Chaussures de tennis": 2655,
    "Femmes > Chaussures > Baskets": 2632,
    "Femmes > Sacs": 19,
    "Femmes > Sacs > Sacs à dos": 157,
    "Femmes > Sacs > Sacs de plage": 2940,
    "Femmes > Sacs > Mallettes": 2941,
    "Femmes > Sacs > Sacs seau": 2942,
    "Femmes > Sacs > Sacs bananes": 1848,
    "Femmes > Sacs > Pochettes": 159,
    "Femmes > Sacs > Housses pour vêtements": 2943,
    "Femmes > Sacs > Sacs de sport": 2944,
    "Femmes > Sacs > Sacs à main": 156,
    "Femmes > Sacs > Besaces": 2945,
    "Femmes > Sacs > Fourre-tout et sacs marins": 1849,
    "Femmes > Sacs > Sacs de voyage": 1850,
    "Femmes > Sacs > Trousses à maquillage": 161,
    "Femmes > Sacs > Cartables et sacoches": 1784,
    "Femmes > Sacs > Sacs à bandoulière": 158,
    "Femmes > Sacs > Sacs fourre-tout": 552,
    "Femmes > Sacs > Porte-monnaie": 160,
    "Femmes > Sacs > Wristlets": 2939,
    "Femmes > Accessoires": 1187,
    "Femmes > Accessoires > Bandanas et foulards pour cheveux": 2931,
    "Femmes > Accessoires > Ceintures": 20,
    "Femmes > Accessoires > Gants": 90,
    "Femmes > Accessoires > Accessoires pour cheveux": 1123,
    "Femmes > Accessoires > Mouchoirs de poche": 2932,
    "Femmes > Accessoires > Chapeaux & casquettes": 88,
    "Femmes > Accessoires > Chapeaux & casquettes > Cagoules": 2933,
    "Femmes > Accessoires > Chapeaux & casquettes > Bonnets": 2934,
    "Femmes > Accessoires > Chapeaux & casquettes > Casquettes": 230,
    "Femmes > Accessoires > Chapeaux & casquettes > Cache-oreilles": 2935,
    "Femmes > Accessoires > Chapeaux & casquettes > Fascinators": 2936,
    "Femmes > Accessoires > Chapeaux & casquettes > Chapeaux": 231,
    "Femmes > Accessoires > Chapeaux & casquettes > Bandeaux": 234,
    "Femmes > Accessoires > Bijoux": 21,
    "Femmes > Accessoires > Bijoux > Bracelets de cheville": 1785,
    "Femmes > Accessoires > Bijoux > Bijoux de corps": 2937,
    "Femmes > Accessoires > Bijoux > Bracelets": 165,
    "Femmes > Accessoires > Bijoux > Broches": 167,
    "Femmes > Accessoires > Bijoux > Breloques et pendentifs": 2938,
    "Femmes > Accessoires > Bijoux > Boucles d’oreilles": 163,
    "Femmes > Accessoires > Bijoux > Ensembles de bijoux": 166,
    "Femmes > Accessoires > Bijoux > Colliers": 164,
    "Femmes > Accessoires > Bijoux > Bagues": 553,
    "Femmes > Accessoires > Bijoux > Autres bijoux": 162,
    "Femmes > Accessoires > Portes-clés": 1852,
    "Femmes > Accessoires > Écharpes et châles": 89,
    "Femmes > Accessoires > Lunettes de soleil": 26,
    "Femmes > Accessoires > Parapluies": 1851,
    "Femmes > Accessoires > Montres": 22,
    "Femmes > Accessoires > Autres accessoires": 1140,
    "Femmes > Beauté": 146,
    "Femmes > Beauté > Maquillages": 964,
    "Femmes > Beauté > Parfums": 152,
    "Femmes > Beauté > Soins du visage": 948,
    "Femmes > Beauté > Accessoires de beauté": 1906,
    "Femmes > Beauté > Accessoires de beauté > Accessoires soins capillaires": 1903,
    "Femmes > Beauté > Accessoires de beauté > Accessoires soins du visage": 950,
    "Femmes > Beauté > Accessoires de beauté > Accessoires soins corporels": 958,
    "Femmes > Beauté > Accessoires de beauté > Accessoires soins des ongles": 962,
    "Femmes > Beauté > Accessoires de beauté > Accessoires maquillage": 967,
    "Femmes > Beauté > Soin mains": 1264,
    "Femmes > Beauté > Manucure": 960,
    "Femmes > Beauté > Soins du corps": 956,
    "Femmes > Beauté > Soins cheveux": 1902,
    "Femmes > Beauté > Autres cosmétiques et accessoires": 153,
    "Hommes": 5,
    "Hommes > Vêtements": 2050,
    "Hommes > Vêtements > Jeans": 257,
    "Hommes > Vêtements > Jeans > Jeans troués": 1816,
    "Hommes > Vêtements > Jeans > Jeans skinny": 1817,
    "Hommes > Vêtements > Jeans > Jeans slim": 1818,
    "Hommes > Vêtements > Jeans > Jeans coupe droite": 1819,
    "Hommes > Vêtements > Manteaux et vestes": 1206,
    "Hommes > Vêtements > Manteaux et vestes > Manteaux": 2051,
    "Hommes > Vêtements > Manteaux et vestes > Manteaux > Duffle-coats": 1225,
    "Hommes > Vêtements > Manteaux et vestes > Manteaux > Pardessus et manteaux longs": 2533,
    "Hommes > Vêtements > Manteaux et vestes > Manteaux > Parkas": 1227,
    "Hommes > Vêtements > Manteaux et vestes > Manteaux > Cabans": 1861,
    "Hommes > Vêtements > Manteaux et vestes > Manteaux > Imperméables": 1859,
    "Hommes > Vêtements > Manteaux et vestes > Manteaux > Trenchs": 1230,
    "Hommes > Vêtements > Manteaux et vestes > Vestes sans manches": 2553,
    "Hommes > Vêtements > Manteaux et vestes > Vestes": 2052,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Perfectos et blousons de moto": 2534,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Blousons aviateur": 1223,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes en jean": 1224,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes militaires et utilitaires": 2535,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes polaires": 1858,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes Harrington": 1226,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Doudounes": 2536,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes matelassées": 2537,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes chemises": 2538,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes de ski et snowboard": 2539,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Blousons teddy": 2550,
    "Hommes > Vêtements > Manteaux et vestes > Vestes > Vestes coupe-vent": 2551,
    "Hommes > Vêtements > Manteaux et vestes > Ponchos": 2552,
    "Hommes > Vêtements > Hauts et t-shirts": 76,
    "Hommes > Vêtements > Hauts et t-shirts > Chemises": 536,
    "Hommes > Vêtements > Hauts et t-shirts > Chemises > Chemises à carreaux": 1801,
    "Hommes > Vêtements > Hauts et t-shirts > Chemises > Chemises en jean": 1802,
    "Hommes > Vêtements > Hauts et t-shirts > Chemises > Chemises unies": 1803,
    "Hommes > Vêtements > Hauts et t-shirts > Chemises > Chemises à motifs": 1804,
    "Hommes > Vêtements > Hauts et t-shirts > Chemises > Chemises à rayures": 1805,
    "Hommes > Vêtements > Hauts et t-shirts > Chemises > Autres chemises": 1865,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts": 77,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts > T-shirts unis": 1806,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts > T-shirts imprimés": 1807,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts > T-shirts à rayures": 1808,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts > Polos": 1809,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts > T-shirts à manches longues": 1810,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts > Autres T-shirts": 1868,
    "Hommes > Vêtements > Hauts et t-shirts > T-shirts > T-shirts sans manches": 560,
    "Hommes > Vêtements > Costumes et blazers": 32,
    "Hommes > Vêtements > Costumes et blazers > Blazers": 1786,
    "Hommes > Vêtements > Costumes et blazers > Pantalons de costume": 1787,
    "Hommes > Vêtements > Costumes et blazers > Gilets de costume": 1788,
    "Hommes > Vêtements > Costumes et blazers > Ensembles costume": 1789,
    "Hommes > Vêtements > Costumes et blazers > Costumes de mariage": 1790,
    "Hommes > Vêtements > Costumes et blazers > Autres": 1866,
    "Hommes > Vêtements > Sweats et pulls": 79,
    "Hommes > Vêtements > Sweats et pulls > Sweats": 1811,
    "Hommes > Vêtements > Sweats et pulls > Pulls et pulls à capuche": 267,
    "Hommes > Vêtements > Sweats et pulls > Pull à capuche avec zip": 1812,
    "Hommes > Vêtements > Sweats et pulls > Cardigans": 266,
    "Hommes > Vêtements > Sweats et pulls > Pulls ras de cou": 1813,
    "Hommes > Vêtements > Sweats et pulls > Sweats à col V": 264,
    "Hommes > Vêtements > Sweats et pulls > Pulls à col roulé": 265,
    "Hommes > Vêtements > Sweats et pulls > Sweats longs": 1814,
    "Hommes > Vêtements > Sweats et pulls > Pulls d’hiver": 1815,
    "Hommes > Vêtements > Sweats et pulls > Vestes": 1825,
    "Hommes > Vêtements > Sweats et pulls > Autres": 268,
    "Hommes > Vêtements > Pantalons": 34,
    "Hommes > Vêtements > Pantalons > Chinos": 1820,
    "Hommes > Vêtements > Pantalons > Joggings": 1821,
    "Hommes > Vêtements > Pantalons > Pantalons skinny": 259,
    "Hommes > Vêtements > Pantalons > Pantacourts": 271,
    "Hommes > Vêtements > Pantalons > Pantalons de costume": 261,
    "Hommes > Vêtements > Pantalons > Pantalons à jambes larges": 260,
    "Hommes > Vêtements > Pantalons > Autres pantalons": 263,
    "Hommes > Vêtements > Shorts": 80,
    "Hommes > Vêtements > Shorts > Shorts cargo": 1822,
    "Hommes > Vêtements > Shorts > Shorts chino": 1823,
    "Hommes > Vêtements > Shorts > Shorts en jean": 1824,
    "Hommes > Vêtements > Shorts > Autres shorts": 272,
    "Hommes > Vêtements > Sous-vêtements et chaussettes": 85,
    "Hommes > Vêtements > Sous-vêtements et chaussettes > Sous-vêtements": 1829,
    "Hommes > Vêtements > Sous-vêtements et chaussettes > Chaussettes": 1828,
    "Hommes > Vêtements > Sous-vêtements et chaussettes > Peignoirs": 1830,
    "Hommes > Vêtements > Sous-vêtements et chaussettes > Autres": 1867,
    "Hommes > Vêtements > Pyjamas": 2910,
    "Hommes > Vêtements > Pyjamas > Pyjamas une-pièce": 2911,
    "Hommes > Vêtements > Pyjamas > Bas de pyjama": 2912,
    "Hommes > Vêtements > Pyjamas > Ensembles de pyjamas": 2913,
    "Hommes > Vêtements > Pyjamas > Hauts de pyjama": 2914,
    "Hommes > Vêtements > Maillots de bain": 84,
    "Hommes > Vêtements > Vêtements de sport et accessoires": 30,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Vêtements d’extérieur": 581,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Survêtements": 582,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Pantalons": 583,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Shorts": 586,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Hauts et t-shirts": 584,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Pulls & sweats": 585,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports": 587,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports > Lunettes": 1471,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports > Gants": 1474,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports > Chapeaux et casquettes": 1473,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports > Protections": 1475,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports > Écharpes": 1470,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports > Bracelets": 3050,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Accessoires de sports > Autres accessoires": 1476,
    "Hommes > Vêtements > Vêtements de sport et accessoires > Autres": 588,
    "Hommes > Vêtements > Vêtements spécialisés et costumes": 92,
    "Hommes > Vêtements > Autres": 83,
    "Hommes > Chaussures": 1231,
    "Hommes > Chaussures > Mocassins et chaussures bateau": 2656,
    "Hommes > Chaussures > Bottes": 1233,
    "Hommes > Chaussures > Bottes > Bottines Chelsea et sans lacets": 2661,
    "Hommes > Chaussures > Bottes > Bottines à lacets": 2662,
    "Hommes > Chaussures > Bottes > Bottes de neige": 2663,
    "Hommes > Chaussures > Bottes > Bottes de pluie": 1795,
    "Hommes > Chaussures > Bottes > Bottes de travail": 2664,
    "Hommes > Chaussures > Bottes > Mules et sabots": 2970,
    "Hommes > Chaussures > Bottes > Espadrilles": 2657,
    "Hommes > Chaussures > Bottes > Claquettes et tongs": 2969,
    "Hommes > Chaussures > Bottes > Chaussures habillées": 1238,
    "Hommes > Chaussures > Bottes > Sandales": 2968,
    "Hommes > Chaussures > Bottes > Chaussons et pantoufles": 2659,
    "Hommes > Chaussures > Bottes > Chaussures de sport": 1452,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de basket": 2672,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures d’escalade": 2673,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de cyclisme": 2674,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de danse": 2675,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de foot": 2676,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de golf": 2677,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures et bottes de randonnée": 2678,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Patins à glace": 2679,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de foot en salle": 2680,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de fitness": 1467,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Bottes de moto": 2681,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Patins à roulettes et rollers": 2682,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de course": 1453,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Bottes de ski": 2683,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Bottes de snowboard": 2684,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures aquatiques": 2685,
    "Hommes > Chaussures > Bottes > Chaussures de sport > Chaussures de tennis": 2686,
    "Hommes > Chaussures > Baskets": 1242,
    "Hommes > Accessoires": 82,
    "Hommes > Accessoires > Sacs et sacoches": 94,
    "Hommes > Accessoires > Sacs et sacoches > Sacs à dos": 246,
    "Hommes > Accessoires > Sacs et sacoches > Mallettes": 2963,
    "Hommes > Accessoires > Sacs et sacoches > Sac bananes": 1799,
    "Hommes > Accessoires > Sacs et sacoches > Housses pour vêtements": 2962,
    "Hommes > Accessoires > Sacs et sacoches > Sacs de sport": 2961,
    "Hommes > Accessoires > Sacs et sacoches > Fourre-tout et sacs marins": 1798,
    "Hommes > Accessoires > Sacs et sacoches > Bagages et valises": 1862,
    "Hommes > Accessoires > Sacs et sacoches > Cartables et sacoches": 1797,
    "Hommes > Accessoires > Sacs et sacoches > Sacs à bandoulière": 247,
    "Hommes > Accessoires > Sacs et sacoches > Porte-monnaie": 248,
    "Hommes > Accessoires > Bandanas et foulards pour cheveux": 2960,
    "Hommes > Accessoires > Ceintures": 96,
    "Hommes > Accessoires > Bretelles": 2959,
    "Hommes > Accessoires > Gants": 91,
    "Hommes > Accessoires > Mouchoirs de poche": 2958,
    "Hommes > Accessoires > Chapeaux et casquettes": 86,
    "Hommes > Accessoires > Chapeaux et casquettes > Cagoules": 2965,
    "Hommes > Accessoires > Chapeaux et casquettes > Bonnets": 2964,
    "Hommes > Accessoires > Chapeaux et casquettes > Casquettes": 287,
    "Hommes > Accessoires > Chapeaux et casquettes > Chapeaux": 288,
    "Hommes > Accessoires > Bijoux": 95,
    "Hommes > Accessoires > Bijoux > Bracelets": 243,
    "Hommes > Accessoires > Bijoux > Breloques et pendentifs": 2967,
    "Hommes > Accessoires > Bijoux > Boutons de manchette": 1800,
    "Hommes > Accessoires > Bijoux > Boucles d’oreilles": 2966,
    "Hommes > Accessoires > Bijoux > Colliers": 241,
    "Hommes > Accessoires > Bijoux > Bagues": 242,
    "Hommes > Accessoires > Bijoux > Autres": 244,
    "Hommes > Accessoires > Pochettes de costume": 2957,
    "Hommes > Accessoires > Écharpes et châles": 87,
    "Hommes > Accessoires > Lunettes de soleil": 98,
    "Hommes > Accessoires > Cravates et noeuds papillons": 2956,
    "Hommes > Accessoires > Montres": 97,
    "Hommes > Accessoires > Autres": 99,
    "Hommes > Soins": 139,
    "Hommes > Soins > Soins visage": 143,
    "Hommes > Soins > Accessoires": 2055,
    "Hommes > Soins > Accessoires > Accessoires de rasage": 1826,
    "Hommes > Soins > Accessoires > Accessoires de toilette": 1827,
    "Hommes > Soins > Accessoires > Autres accessoires beauté": 971,
    "Hommes > Soins > Accessoires > Soins cheveux": 140,
    "Hommes > Soins > Accessoires > Soins du corps": 141,
    "Hommes > Soins > Accessoires > Soins mains et ongles": 142,
    "Hommes > Soins > Accessoires > Parfums": 145,
    "Hommes > Soins > Accessoires > Maquillage": 144,
    "Hommes > Soins > Accessoires > Coffrets": 1863,
    "Hommes > Soins > Accessoires > Autres cosmétiques": 968
  };

// ✅ Fonction pour sauvegarder une session utilisateur
async function saveSession(userId, page) {
    console.log(`🔒 Sauvegarde de la session pour ${userId}...`);

    const cookies = await page.context().cookies();
    fs.writeFileSync(`${SESSIONS_DIR}/${userId}_cookies.json`, JSON.stringify(cookies, null, 2));

    const localStorageData = await page.evaluate(() => 
        Object.entries(localStorage).map(([key, value]) => ({ key, value }))
    );
    fs.writeFileSync(`${SESSIONS_DIR}/${userId}_localStorage.json`, JSON.stringify(localStorageData, null, 2));

    console.log(`✅ Session de ${userId} sauvegardée.`);
}

// ✅ Fonction pour charger une session utilisateur
async function loadSession(userId, page) {
    console.log(`🔄 Chargement de la session pour ${userId}...`);
    
    const cookiesPath = `${SESSIONS_DIR}/${userId}_cookies.json`;
    const localStoragePath = `${SESSIONS_DIR}/${userId}_localStorage.json`;

    if (fs.existsSync(cookiesPath) && fs.existsSync(localStoragePath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
        await page.context().addCookies(cookies);

        const localStorageData = JSON.parse(fs.readFileSync(localStoragePath, 'utf8'));
        await page.evaluate(localStorageData => {
            localStorageData.forEach(({ key, value }) => localStorage.setItem(key, value));
        }, localStorageData);

        console.log(`✅ Session chargée pour ${userId}.`);
        return true;
    } else {
        console.warn(`⚠️ Aucune session enregistrée pour ${userId}. Connexion requise.`);
        return false;
    }
}

// ✅ Fonction pour publier une annonce sur Vinted
async function publishOnVinted(userId, listingData) {
    console.log(`📢 Publication pour ${userId}...`);
    
    const browser = await chromium.launch({ headless: false }); // Met headless: true si tu veux en arrière-plan
    const page = await browser.newPage();

    const sessionLoaded = await loadSession(userId, page);
    if (!sessionLoaded) {
        console.error("⚠️ Impossible de publier, l'utilisateur doit se reconnecter.");
        await browser.close();
        return { success: false, message: "Veuillez vous reconnecter." };
    }

    console.log("Navigation vers Vinted...");
    await page.goto('https://www.vinted.fr/');

    try {
        await page.waitForSelector('[data-testid="side-bar-sell-btn"]', { timeout: 10000 });
        console.log("Utilisateur connecté, prêt à publier.");
    } catch (error) {
        console.error("⚠️ Session expirée.");
        await browser.close();
        return { success: false, message: "Session expirée, reconnectez-vous." };
    }

    console.log("Clic sur 'Vends tes articles'...");
    await page.click('[data-testid="side-bar-sell-btn"]');
    await page.waitForSelector('input[name="title"]', { timeout: 60000 });

    console.log("Remplissage du formulaire...");
    await page.fill('input[name="title"]', listingData.title);
    await page.fill('textarea[name="description"]', listingData.description);
    await page.fill('input[name="price"]', String(listingData.price));

    // 📌 Gestion de la catégorie
    const categoryName = listingData.category;
    const categoryId = categoryMapping[categoryName];

    if (!categoryId) {
        console.error(`❌ Catégorie inconnue : ${categoryName}`);
        await browser.close();
        return { success: false, message: "Catégorie non reconnue." };
    }

    console.log(`📌 Sélection de la catégorie : ${categoryName} (ID: ${categoryId})`);
    await page.click(`[data-testid="catalog-${categoryId}"]`).catch(() => {
        console.error(`⚠️ Impossible de sélectionner la catégorie ${categoryName}`);
    });

    console.log("Publication...");
    await page.click('button[type="submit"]');

    try {
        await page.waitForSelector('text=Ton article est en ligne !', { timeout: 60000 });
        console.log("✅ Annonce publiée !");
        await browser.close();
        return { success: true, message: "Annonce publiée !" };
    } catch (error) {
        console.error("❌ Erreur lors de la publication.");
        await browser.close();
        return { success: false, message: "Erreur lors de la publication." };
    }
}

// ✅ API REST : Publication automatique d'une annonce
app.post('/publish-ad', async (req, res) => {
    const { userId, listing } = req.body;
    const result = await publishOnVinted(userId, listing);
    res.json(result);
});

// ✅ Lancement du serveur
app.listen(port, () => {
    console.log(`🚀 Service Vinted opérationnel sur le port ${port}`);
});
