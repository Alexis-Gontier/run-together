# Audit des features et de la disposition des pages

Date : 26 septembre 2026 — branche `dev`, après les phases 1 à 3.
Méthode : lecture de chaque `page.tsx` et de son slot `@rightPanel`, puis navigation réelle
(Playwright) en desktop 1440 px et mobile 390 px, sur une copie de la production (branche Neon
`dev-refonte`, 7 membres, ~300 courses).

## Résumé

L'app a un bon socle (fil, détail de course riche, classements, records) mais **la moitié de sa
surface est vide, factice ou invisible** :

1. **Les cartes sont cassées partout** (fil, profil, détail) : token Mapbox révoqué (401).
2. **Trois routes existent sans rien afficher** en production : `/progress` (le backend calcule
   tout — volume, séries, évolution d'allure — mais la page n'affiche qu'un `DebugJson`),
   `/compare` et `/badges` (`notFound()`).
3. **Le panneau droit n'est utilisé que sur l'accueil** ; ailleurs il est vide ou affiche un
   placeholder (« Leaderboard »). Sur mobile il disparaît entièrement, avec le seul contenu utile
   qu'il portait (Top du mois).
4. **Les paramètres promettent des actions qui n'existent pas** : modifier l'e-mail, exporter
   ses données, supprimer son compte, langue, unité, objectif hebdomadaire.
5. **Aucune interaction sociale** dans une app dont c'est la raison d'être (« Run Together ») :
   pas de réaction, de commentaire, de suivi, de comparaison.

## Carte des routes

| Route | Nav desktop | Nav mobile | Colonne centrale | Panneau droit | État |
| --- | --- | --- | --- | --- | --- |
| `/home` | Accueil | ✅ | Fil de toutes les courses (pagination par curseur) | Top du mois (distance) | OK, cartes cassées |
| `/runs` | Mes courses | ✅ | 4 stat cards + sélecteur d'année + liste par mois | vide | OK |
| `/runs/new` | bouton « Ajouter » | FAB | Formulaire / import GPX-FIT | vide | ✅ nouveau |
| `/runs/[id]` | — | — | Carte, stats, profil, splits, actions propriétaire | vide | OK, carte cassée |
| `/runs/[id]/edit` | — | — | Formulaire | vide | ✅ nouveau |
| `/leaderboard` | Classement | ✅ | Filtres métrique × période + liste | **placeholder « Leaderboard »** | OK |
| `/profile/[u]` | **absent** (avatar bas de sidebar) | ✅ (icône) | En-tête + onglets Courses / Records | vide | pauvre |
| `/progress` | **absent** | **absent** | `DebugJson` (404 en prod) | vide | ❌ |
| `/compare` | **absent** | **absent** | rien (404 en prod) | vide | ❌ |
| `/badges` | **absent** | **absent** | rien (404 en prod) | vide | ❌ (phase 6) |
| `/settings` | Paramètres | ✅ | 6 cartes | vide | beaucoup de factice |
| `/admin`, `/admin/discord` | — | — | Utilisateurs, journal Discord | — | OK |
| `/login`, `/register`, `/onboarding` | — | — | Formulaires, wizard 3 étapes | — | OK |

## Page par page

### Accueil `/home`
- **Features** : fil global chronologique ; carte par course (auteur, heure, nom, badges PR,
  appareil, carte, 4 stats, FC/cadence/kcal) ; Top du mois en panneau droit avec évolution.
- **Problèmes** :
  - le fil charge côté client (spinner plein écran au premier rendu) alors que la page est un
    Server Component — pas de streaming ni de skeleton ;
  - l'auteur est affiché par son `username` (`nadio`) et non son nom (`Titouan Nadio`) ;
  - le Top du mois **donne des médailles à des coureurs à 0,0 km** ;
  - aucun moyen d'interagir avec une course (réaction, commentaire) ;
  - pas de filtre (moi / tout le monde), pas de résumé « ma semaine » alors que c'est la page
    d'arrivée.
- **Mobile** : le Top du mois disparaît (panneau masqué sous `lg`).

### Mes courses `/runs`
- **Features** : 4 stat cards (courses, distance, allure moyenne, dénivelé) avec tendance du
  mois ; sélecteur année / toutes ; accordéon par mois.
- **Problèmes** : la liste est dans un accordéon fermé par défaut — il faut deux clics pour voir
  une course ; pas de recherche ni de filtre par type ; panneau droit vide alors qu'il pourrait
  porter la progression. Doublon partiel avec l'onglet Courses du profil.

### Détail `/runs/[id]`
- **Features** : la page la plus riche — stats, FC/cadence/kcal, profil altitude + allure par km,
  splits colorés (rapide/moyen/lent), records, actions Modifier / Supprimer.
- **Problèmes** :
  - carte cassée (Mapbox) — c'est l'emplacement principal de shadcn-map ;
  - l'en-tête affiche « Mes courses » même sur la course de quelqu'un d'autre ;
  - titre d'onglet « Sortie » sans suffixe ni nom de course ;
  - l'axe d'allure du graphique va de 2'30" à 10'00" : la courbe est écrasée ;
  - panneau droit vide (idéal pour : records de la course, comparaison avec la moyenne perso,
    autres courses du même parcours).

### Classement `/leaderboard`
- **Features** : métriques Distance / Courses / Allure / Records PR × périodes 7 j → Tout ;
  badge « Vous », évolution.
- **Problèmes** : deux styles de filtres différents (boutons vs segmented control) ; médailles à
  0 km ; panneau droit = texte « Leaderboard » oublié ; les membres sans course apparaissent
  (bruit).

### Profil `/profile/[username]`
- **Features** : bannière, avatar (initiales), nom, @username, 2 compteurs (courses, km),
  onglets Courses (liste paginée) / Records.
- **Problèmes** : pas dans la nav desktop (seulement l'avatar en bas de sidebar, peu découvrable) ;
  bannière vide sans personnalisation ; aucune statistique (allure moyenne, plus longue sortie,
  régularité) ; pas de carte des parcours ; pas de badges ; aucun en-tête de page ; le
  `@username` est affiché avec la casse de `displayUsername` (`@Nadio`) mais l'URL en minuscule.

### Progression `/progress`
- Le backend (`getProgressAction`) est complet : `summary`, `weeklyVolume`, `dailyActivity`,
  `paceEvolution`, `weeklyElevation`, `streaks` (courante, meilleure, jours actifs). La page
  n'affiche que le JSON brut et renvoie 404 en production. **C'est la feature la plus rentable à
  finir** : les données existent, il manque l'UI (graphiques recharts déjà installés).

### Comparer `/compare`, Badges `/badges`
- Coquilles vides (404 en prod). Badges = phase 6. Comparer : à décider (voir recommandations).

### Paramètres `/settings`
- **Réel** : profil (lecture seule), thème, publication Discord (nouveau), mot de passe,
  déconnexion.
- **Factice ou désactivé** : modifier l'e-mail, exporter mes données, supprimer mon compte,
  langue (texte fixe), unité (texte fixe), objectif hebdomadaire (« Bientôt disponible »).
- **Manquant** : modifier nom / photo / bannière.
- La zone de danger a perdu « supprimer toutes mes courses » (action débranchée, retirée en
  phase 1).

### Auth, onboarding
- L'illustration de `/login` et `/register` ne s'affichait jamais : le proxy redirigeait
  `/images/*` vers `/login`. **Corrigé** (`fix: let public images bypass the auth proxy`).
- Onboarding : étape 3 « Ta première course » (phase 2) ; étape Strava masquée.

## Constats transversaux

| Sujet | Constat |
| --- | --- |
| Cartes | Mapbox 401 partout. L'image OG est déjà passée en SVG (phase 3). |
| Panneau droit | Utilisé sur 1 page sur 9 ; invisible sur mobile. |
| Navigation | 4 entrées ; Profil, Progression absents du desktop ; la page d'accueil et « Mes courses » se chevauchent. |
| Identité | username vs nom affichés de façon incohérente selon les écrans. |
| États | Pas de skeleton (spinner client sur le fil) ; états vides minimalistes ; aucune page `loading.tsx`. |
| Titres d'onglet | Suffixe « \| Run Together » perdu sur `/runs/*` (layouts qui fixent un `title` sans template). |
| Factice | 6 éléments d'UI désactivés ou « bientôt » dans les paramètres. |
| Social | Aucune interaction entre membres dans l'app ; tout le social passe par Discord. |
| Code mort Strava | `strava-sync-dialog.tsx`, `strava-card.tsx`, `step-strava.tsx` gardés derrière le flag. |

## Recommandations — backlog de la phase 5

### P1 — à faire en premier
1. **shadcn-map** : carte interactive sur `/runs/[id]` ; miniature SVG du tracé dans le fil et le
   profil (réutilise `routeSvgPath`) ; suppression de Mapbox et de `NEXT_PUBLIC_MAPBOX_TOKEN`.
2. **Finir `/progress`** avec le backend existant : volume hebdo (barres), calendrier d'activité
   (heatmap), évolution d'allure, D+ hebdo, séries. L'ajouter à la navigation.
3. **Refondre la navigation** : Accueil · Mes courses · Progression · Classement · Profil ;
   Paramètres dans le menu utilisateur ; « Ajouter une course » en action principale (fait).
4. **Réparer les classements** : exclure les coureurs à 0 de la période, pas de médaille sans
   résultat ; un seul style de filtres.
5. **Retirer le factice** des paramètres : implémenter ce qui est simple (modifier nom, photo,
   e-mail via better-auth ; exporter en JSON/GPX ; supprimer le compte) et supprimer le reste
   (langue, unité) plutôt que de l'afficher désactivé.

### P2
6. **Donner un rôle à chaque panneau droit** (et un équivalent mobile en haut de page) :
   Accueil → ma semaine + Top du mois ; Mes courses → objectif / progression ;
   Détail → records et comparaison perso ; Classement → mes positions ; Profil → badges et stats.
7. **Accueil** : skeletons, afficher le nom, filtre « Tout le monde / Moi », carte « Ma semaine ».
8. **Mes courses** : liste ouverte par défaut (mois courant déplié), filtre par type.
9. **Profil** : statistiques, carte de tous les parcours (heatmap shadcn-map), badges (phase 6),
   édition de la bannière.
10. **Titres d'onglet** cohérents (`title.template` sur les layouts `runs`), nom de la course en
    titre de la page détail ; en-tête contextuel (« Course de Titouan »).

### P3
11. **Réactions** (👏 🔥) sur les courses, relayées dans l'embed Discord — premier pas social
    dans l'app. Commentaires ensuite.
12. **Objectif hebdomadaire** réel (distance ou nombre de courses) — alimente la carte « Ma
    semaine » et un badge.
13. **Comparer** : soit le supprimer, soit en faire « moi vs un membre » (volume, allure,
    records) — à trancher avec l'usage.
14. Axe d'allure du graphique de profil calé sur les données (± 30 s).
15. Supprimer le code Strava masqué si l'app Strava n'est pas réactivée d'ici la fin de la
    refonte.

### Pour la phase 6 (badges)
- Emplacements : profil (vitrine), panneau droit du profil, embed Discord `badge.unlocked`,
  page `/badges` (catalogue complet avec progression).
