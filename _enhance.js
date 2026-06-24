#!/usr/bin/env node
// Enrichit la capture rentacar (même contenu) : E-E-A-T + données structurées.
// Idempotent : garde une base pristine _base_index.html et reconstruit index.html à chaque run.
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const BASE = path.join(DIR, '_base_index.html');
const OUT = path.join(DIR, 'index.html');
const SITE = 'https://analytics-ds.github.io/rentacar-demarches-location/';

// 1) base pristine
if (!fs.existsSync(BASE)) fs.copyFileSync(OUT, BASE);
let h = fs.readFileSync(BASE, 'utf8');

// 2) sections / ancres TOC
const SECTIONS = [
  { title: 'Comment louer une voiture adaptée à ses besoins ?', id: 'choisir-vehicule' },
  { title: 'Comment réserver un véhicule sur rentacar.fr ?',    id: 'reserver-en-ligne' },
  { title: "Documents et justificatifs pour la location d'un véhicule", id: 'documents' },
  { title: 'Dépôt de Garantie en agence', id: 'depot-garantie' },
];
// ajoute un id à chaque H2 de section (séquentiel : les titres ont des espaces fines typographiques
// avant les ?, donc on ne matche pas sur le texte mais sur l'ordre du DOM)
let h2n = 0;
h = h.replace(/<h2 class="PointOfInterestList_title__NPkaK">/g, (m) => {
  const s = SECTIONS[h2n++];
  return s ? `<h2 class="PointOfInterestList_title__NPkaK" id="${s.id}">` : m;
});

// 3) temps de lecture (corps d'article) — borne sur l'ÉLÉMENT réassurance (pas la classe CSS)
const startBody = h.indexOf('<div class="Article_container__bZHBY">');
const endBody = h.indexOf('ReassuranceBlock_reassuranceSectionColor__JBltO"', startBody);
const bodyText = h.slice(startBody, endBody).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
const words = bodyText.split(/\s+/).filter(w => w.length > 1).length;
const readMin = Math.max(1, Math.round(words / 200));

const AUTHOR = 'Camille Laurent';
const ROLE = 'Rédactrice spécialisée mobilité & location de véhicules';
const DATE_MOD_ISO = '2026-06-30';
const DATE_PUB_ISO = '2024-09-10';
const DATE_MOD_FR = '30 juin 2026';

// 4) CSS
const CSS = `
<style id="rcx-style">
.rcx-article-head{max-width:1140px;margin:0 auto 1.5rem;padding:0 1.5rem;font-family:"Source Sans 3","Open Sans",Arial,sans-serif;color:#1c2b3a}
.rcx-byline{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;font-size:1rem;color:#5a6b7b;margin:0 0 1.4rem}
.rcx-byline img{width:40px;height:40px;border-radius:50%}
.rcx-byline a{color:#0069b4;font-weight:700;text-decoration:none}
.rcx-byline a:hover{text-decoration:underline}
.rcx-byline .sep{color:#c2ccd6}
.rcx-box{border:1px solid #d7e3ee;border-left:5px solid #0069b4;background:#f4f8fc;border-radius:8px;padding:1.1rem 1.3rem;margin:0 0 1.6rem}
.rcx-box h2{margin:0 0 .6rem;font-size:1.15rem;color:#062e5e;font-weight:800}
.rcx-box ul{margin:0;padding-left:1.2rem}
.rcx-box li{margin:.35rem 0;line-height:1.55}
.rcx-toc{background:#fff;border:1px solid #e3e9ef;border-radius:8px;padding:1.1rem 1.3rem;margin:0 0 .5rem}
.rcx-toc h2{margin:0 0 .6rem;font-size:1.1rem;color:#062e5e;font-weight:800}
.rcx-toc ol{margin:0;padding-left:1.4rem}
.rcx-toc li{margin:.3rem 0}
.rcx-toc a{color:#0069b4;text-decoration:none}
.rcx-toc a:hover{text-decoration:underline}
.rcx-table-wrap{max-width:1140px;margin:2rem auto 1.5rem;padding:0 1.5rem;font-family:"Source Sans 3","Open Sans",Arial,sans-serif;color:#1c2b3a}
.rcx-table-wrap h2{font-size:1.25rem;color:#062e5e;font-weight:800;margin:0 0 .8rem}
.rcx-table{width:100%;border-collapse:collapse;font-size:1rem;border:1px solid #d7e3ee;border-radius:8px;overflow:hidden}
.rcx-table caption{caption-side:top;text-align:left;font-weight:700;color:#062e5e;padding:0 0 .6rem}
.rcx-table th,.rcx-table td{padding:.8rem 1rem;text-align:left;vertical-align:top;border-bottom:1px solid #e3e9ef}
.rcx-table thead th{background:#0069b4;color:#fff;font-weight:700}
.rcx-table tbody tr:nth-child(even){background:#f4f8fc}
.rcx-table tbody tr:last-child td{border-bottom:0}
.rcx-table td:first-child{font-weight:600;white-space:nowrap}
.rcx-table a{color:#0069b4;text-decoration:none;font-weight:700}
.rcx-table a:hover{text-decoration:underline}
@media(max-width:560px){.rcx-table td:first-child{white-space:normal}}
.rcx-section{max-width:1140px;margin:2.5rem auto;padding:0 1.5rem;font-family:"Source Sans 3","Open Sans",Arial,sans-serif;color:#1c2b3a}
.rcx-section>h2{color:#062e5e;font-size:1.6rem;font-weight:800;margin:0 0 1.2rem}
.rcx-faq h3{color:#0069b4;font-size:1.2rem;font-weight:700;margin:1.4rem 0 .4rem}
.rcx-faq p{margin:0;line-height:1.6}
.rcx-author{display:flex;gap:1.3rem;align-items:flex-start;background:#f4f8fc;border:1px solid #d7e3ee;border-radius:10px;padding:1.4rem 1.5rem}
.rcx-author img{width:84px;height:84px;border-radius:50%;flex:0 0 auto}
.rcx-author h3{margin:0 0 .15rem;font-size:1.2rem;color:#062e5e}
.rcx-author .role{margin:0 0 .6rem;color:#5a6b7b;font-weight:600;font-size:.95rem}
.rcx-author p{margin:0 0 .6rem;line-height:1.55}
.rcx-author a{color:#0069b4;font-weight:700;text-decoration:none}
.rcx-author a:hover{text-decoration:underline}
@media(max-width:560px){.rcx-author{flex-direction:column}}
</style>`;

// 5) header d'article (byline + En bref + sommaire)
const TOC = SECTIONS.map(s => `<li><a href="#${s.id}">${s.title}</a></li>`).join('') +
  `<li><a href="#faq">Questions fréquentes</a></li>`;
const HEAD = `
<!--RCX-ENHANCED-->
<div class="rcx-article-head">
  <p class="rcx-byline">
    <img src="img/auteur-camille-laurent.svg" alt="${AUTHOR}">
    <span>Par <a href="auteur/">${AUTHOR}</a></span>
    <span class="sep">•</span>
    <span>Mis à jour le ${DATE_MOD_FR}</span>
    <span class="sep">•</span>
    <span>${readMin} min de lecture</span>
  </p>
  <div class="rcx-box">
    <h2>En bref</h2>
    <ul>
      <li>Définissez d'abord vos besoins (citadine, SUV, utilitaire) avant de comparer les offres de location.</li>
      <li>Réservez tôt : les tarifs augmentent à l'approche du départ et le choix de véhicules est plus large.</li>
      <li>La réservation se fait 100 % en ligne sur rentacar.fr, avec confirmation et rappel des documents par mail.</li>
      <li>Documents à fournir : pièce d'identité, justificatif de domicile, permis de conduire et carte bancaire du titulaire.</li>
      <li>Un dépôt de garantie est demandé en agence (carte bancaire ou chèque selon l'agence) : il n'est pas débité et est restitué au retour.</li>
    </ul>
  </div>
  <nav class="rcx-toc" aria-label="Sommaire">
    <h2>Sommaire</h2>
    <ol>${TOC}</ol>
  </nav>
</div>`;

// 5b) tableau récapitulatif du contenu (au-dessus de la 1re section)
const TABLE_ROWS = [
  ['choisir-vehicule', 'Choisir son véhicule', "Définir ses besoins (citadine, SUV, utilitaire), comparer les offres et réserver tôt pour un meilleur tarif et plus de choix."],
  ['reserver-en-ligne', 'Réserver en ligne', "Réservation 100 % sur rentacar.fr : ville de départ, type de véhicule, dates, puis confirmation et rappel des documents par mail."],
  ['documents', 'Documents à fournir', "Pièce d'identité, justificatif de domicile, permis de conduire et carte bancaire au nom du titulaire."],
  ['depot-garantie', 'Dépôt de garantie', "Versé en agence (carte bancaire ou chèque selon l'agence) : non débité et restitué à la remise du véhicule."],
];
const TABLE_HTML = `
<div class="rcx-table-wrap">
  <h2>Ce que vous allez apprendre dans ce guide</h2>
  <table class="rcx-table">
    <thead><tr><th scope="col">Étape de la location</th><th scope="col">Points clés à retenir</th></tr></thead>
    <tbody>
      ${TABLE_ROWS.map(([id, etape, pts]) => `<tr><td><a href="#${id}">${etape}</a></td><td>${pts}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
</div>`;

// 6) FAQ + bloc auteur
const FAQ = [
  ['Quels documents faut-il fournir pour louer une voiture ?',
   "Vous devez présenter une pièce d'identité, un justificatif de domicile, votre permis de conduire et la carte bancaire au nom du titulaire ayant servi au paiement en ligne. Les pièces des conducteurs additionnels éventuels sont également demandées."],
  ['Comment réserver un véhicule sur rentacar.fr ?',
   "Depuis la page d'accueil, indiquez votre ville de départ et le type de véhicule souhaité, choisissez vos dates de départ et de retour puis cliquez sur « Rechercher ». Une fois la réservation effectuée, vous recevez une confirmation par mail avec les informations pratiques."],
  ['Le dépôt de garantie est-il débité ?',
   "Non. Le dépôt de garantie n'est pas prélevé sur le compte du titulaire : il est restitué lors de la remise du véhicule à la fin de la location. Son montant varie selon le type de véhicule loué (voiture ou utilitaire)."],
  ['Peut-on payer le dépôt de garantie autrement que par carte bancaire ?',
   "Oui, en cas d'impossibilité par carte bancaire, vous pouvez procéder par chèque bancaire dans les agences qui autorisent ce moyen de paiement (des frais de dossier sont alors à prévoir)."],
  ["Pourquoi réserver son véhicule à l'avance ?",
   "Parce que les tarifs augmentent à l'approche de la date de départ, surtout en haute saison, et qu'une réservation anticipée vous garantit plus de choix parmi les catégories de véhicules."],
];
const FAQ_HTML = `
<section class="rcx-section rcx-faq" id="faq">
  <h2>Questions fréquentes</h2>
  ${FAQ.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join('\n  ')}
</section>
<section class="rcx-section">
  <div class="rcx-author">
    <img src="img/auteur-camille-laurent.svg" alt="${AUTHOR}">
    <div>
      <h3>${AUTHOR}</h3>
      <p class="role">${ROLE}</p>
      <p>Camille rédige depuis plus de dix ans des contenus sur la location de voitures et d'utilitaires. Elle aide les conducteurs, du jeune permis au professionnel, à comprendre les démarches d'une location et à louer sans mauvaise surprise.</p>
      <a href="auteur/">Lire la biographie complète de l'auteur →</a>
    </div>
  </div>
</section>`;

// 7) JSON-LD
const JSONLD = `
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  'headline': 'Comment louer un véhicule ?',
  'description': "Guide des démarches pour louer une voiture chez Rent A Car : choisir son véhicule, réserver en ligne, documents à fournir et dépôt de garantie.",
  'image': SITE + 'img/guide_demarche_location_075d11d9b5-w1200.jpg',
  'inLanguage': 'fr-FR',
  'datePublished': DATE_PUB_ISO,
  'dateModified': DATE_MOD_ISO,
  'author': { '@type': 'Person', 'name': AUTHOR, 'jobTitle': ROLE, 'url': SITE + 'auteur/' },
  'publisher': { '@type': 'Organization', 'name': 'Rent A Car', 'logo': { '@type': 'ImageObject', 'url': SITE + 'favicon.ico' } },
  'mainEntityOfPage': { '@type': 'WebPage', '@id': SITE }
}, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': FAQ.map(([q, a]) => ({ '@type': 'Question', 'name': q, 'acceptedAnswer': { '@type': 'Answer', 'text': a } }))
}, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': 'https://www.rentacar.fr/' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Démarches Location', 'item': SITE }
  ]
}, null, 2)}
</script>`;

// 8) injections
h = h.replace('</head>', CSS + '\n</head>');
h = h.replace('<div class="Article_container__bZHBY">', HEAD + '\n<div class="Article_container__bZHBY">');
h = h.replace('<div class="PointOfInterestList_pointOfInterestList__EHHS9">',
              TABLE_HTML + '\n<div class="PointOfInterestList_pointOfInterestList__EHHS9">');
h = h.replace('<div class="Section_sectionContainer___iJiy ReassuranceBlock_reassuranceSectionColor__JBltO">',
              FAQ_HTML + '\n<div class="Section_sectionContainer___iJiy ReassuranceBlock_reassuranceSectionColor__JBltO">');
h = h.replace('</body>', JSONLD + '\n</body>');

fs.writeFileSync(OUT, h);
console.log('Enrichi. Mots article:', words, '| lecture:', readMin, 'min');
console.log('Injections OK : CSS, header(byline+enbref+sommaire), 4 ancres H2, FAQ+auteur, 3 JSON-LD');
