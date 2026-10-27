# CoordinationFB / Records — Documentation du Design System & Directives

> *"Un espace pensé pour chaque vinyle."*
>
> Un design system atomique pour cataloguer ses vinyles, prendre soin de chaque exemplaire et dénicher les prochains.

## 1. Vue d'ensemble & Vision

**CoordinationFB** est conçu pour allier l'esthétique d'une revue éditoriale à la précision d'un catalogue logiciel. Il met à l'honneur les pochettes d'albums tout en garantissant une lisibilité maximale pour les métadonnées techniques, l'état physique du disque et les statistiques de la collection.

### Piliers fondamentaux

1. **Papier, Encre & Chaleur :** Une ambiance chaleureuse grâce à des textures évoquant le papier, des fonds couleur crème, le contraste d'une encre sombre et des touches d'accentuation couleur terre cuite / orange brûlé.

2. **L'œuvre avant tout :** La pochette du vinyle est le cœur visuel. Les éléments d'interface accompagnent et encadrent l'image sans lui faire de concurrence.

3. **Préservation de l'histoire (Évaluation séparée) :** Un disque physique ne se résume pas à un fichier numérique. L'état du vinyle (média) et celui de la pochette (pochette) sont évalués séparément selon le standard **Goldmine**.

4. **Rythme structuré :** Une grille d'alignement rigoureuse basée sur des multiples de 4px / 24px, une hiérarchie typographique claire et une structure en *Atomic Design*.

## 2. Fondations (Design Tokens)

### 2.1 Palette de couleurs

Voici le tableau Markdown correctement formaté avec une syntaxe propre et uniforme :

| Identité Visuelle | Hex / Nuance | Application / Usage |
| --- | --- | --- |
| Arrière-plan / Canevas | `#F6F4EE` | Fond principal des pages, texture papier douce. |
| Conteneur / Carte | `#FFFFFF` | Cartes principales, champs de saisie, menus déroulants et blocs surélevés. |
| Texte principal & Bordures | `#1E1E1E` / Neutre Sombre | Titres principaux, corps de texte, bannières sombres, badges à fort contraste. |
| Texte secondaire & Lignes | `#6E6D68` / `#E5E2DA` | Sous-titres, étiquettes, métadonnées, séparateurs, états désactivés. |
| Accentuation principale | `#C84B22` | Boutons d'action principale (`Ajouter à la wantlist`, `Éditer le vinyle`), onglet actif, priorités hautes. |
| État / Badge de qualité | `#2D5A3E` / Vert doux | Badges d'état Mint / Near Mint, marqueur "Dans la collection", confirmations. |

### 2.2 Typographie & Styles de texte

Le système s'appuie sur trois typographies distinctes pour équilibrer le style éditorial et l'ergonomie applicative :

1. **Serif (Style Éditorial) :**

   * **Police :** *Libre Baskerville* (ou Serif équivalente).

   * **Usage :** Titres de pages (`Ma Collection`, `Wantlist`, `Un rythme pour tout le catalogue`), grands titres de sections, noms d'albums sur les fiches détaillées.

   * **Exemple d'échelle :** Titres de page (40px/48px).

2. **Sans-Serif (Style Interface & Corps de texte) :**

   * **Police :** *Inter* / Sans-Serif système.

   * **Usage :** Liens de navigation, boutons de contrôle, texte courant, champs de formulaire, noms d'artistes.

   * **Exemple d'échelle :** Boutons et contrôles principaux (14px/16px SemiBold/Medium).

3. **Monospace (Style Catalogue & Métadonnées) :**

   * **Police :** *IBM Plex Mono* / Chasse fixe.

   * **Usage :** Numéros de catalogue (`CS 8163`), années de pressage, codes de matrice, étiquettes de section (`01 / ATOMS`), badges d'état (`NM`, `VG+`), métadonnées système.

   * **Exemple d'échelle :** Badges et métadonnées (11px/12px Majuscules).

### 2.3 Grille & Spécifications de mise en page

* **Unité de base :** Grille de `4px`.

* **Marges de page :** Gouttière de `24px`.

* **Hauteur des composants :**

  * Boutons principaux et champs de saisie : `42px` de hauteur.

  * Boutons secondaires et filtres compacts : `34px` de hauteur.

  * Badges d'état / Évaluations : `24px` de hauteur.

## 3. Composants (Atomic Design)

### 3.1 Atomes (Primitives)

Les atomes sont les composants de base indivisibles de l'interface.

* **Boutons & Actions :**

  * *Primaire :* Fond Orange brûlé avec texte blanc (`+ Ajouter un disque`, `+ Ajouter à la wantlist`).

  * *Secondaire :* Fond clair avec bordure sombre (`Éditer le vinyle`, `Exporter la liste`).

  * *Discret / Tertiaire :* Style transparent (`Annuler`, `Voir les détails`).

  * *Statut :* Conteneur vert doux (`✓ Enregistré dans la collection`).

* **Champs de saisie & États :**

  * *Barre de recherche :* Fond blanc, icône loupe, hauteur 42px, bordure neutre douce.

  * *État Actif / Focus :* Contour mis en avant (ex: halo Orange brûlé).

  * *État Erreur / Aide :* Bordure rouge atténuée et message d'aide sous le champ (`* Le numéro de catalogue est requis`).

* **Badges de notation Goldmine :**

  * Pilules compactes pour noter séparément le disque et la pochette.

  * Échelle de notes : `M` (Mint), `NM` (Near Mint), `VG+` (Very Good Plus), `VG`, `G+`, `G`, `F`, `P`.

  * Rendu visuel : Vert doux à fort contraste pour `NM`/`M`, tons neutres pour `VG+`/`VG`.

* **Étiquettes de priorité & de statut :**

  * `Priorité haute` (Orange clair), `Dans la collection` (Vert clair), `33 tours / 12"` (Gris neutre).

### 3.2 Molécules (Assemblages simples)

Les molécules combinent plusieurs atomes pour créer un composant fonctionnel réutilisable.

1. **Carte Vinyle (Vue Collection) :**

   * *Composition :* Pochette + Artiste/Titre + Année & Numéro de catalogue + Badges d'état (Disque/Pochette) + Menu d'options (`...`).

   * *Comportement :* Cliquez sur la carte pour ouvrir la fiche détaillée.

2. **Duo d'évaluation de condition :**

   * *Composition :* Deux badges de notation côte à côte : Note `MÉDIA` + Note `POCHETTE`.

   * *Règle :* Ne jamais fusionner la note du disque et de la pochette en une seule moyenne.

3. **Élément de la Wantlist :**

   * *Composition :* Miniature + Infos du pressage + Note du collectionneur + Badge de priorité (`Priorité haute`) + Budget max (`Jusqu'à 180 €`) + Note minimale exigée (`MIN. VG+ / VG+`).

4. **Groupe de Recherche & Filtres :**

   * *Composition :* Barre de recherche + Sélecteur de genre + Filtre d'état + Filtre de format + Tri + Commutateur Grille/Liste.

### 3.3 Organismes (Régions d'interface)

Les organismes regroupent des molécules pour former des sections complètes d'écran.

* **Barre de Navigation Globale :**

  * Gauche : Logo (`Records - A HOME FOR YOUR RECORDS`).

  * Centre : Onglets de navigation (`Ma Collection`, `Wantlist [12]`, `Statistiques`). L'onglet actif possède un trait indicateur Orange brûlé de 2px.

  * Droite : Raccourcis d'aide (`?`) et profil utilisateur (`AR`).

* **Bannière d'en-tête & Filtres de la Collection :**

  * Synthèse des chiffres clés de la collection (Nombre de disques, valeur estimée, artistes) couplée à la barre d'outils et de tri.

* **Grille de la Collection :**

  * Grille responsive sur 4 colonnes affichant les Cartes Vinyle avec espacement régulier et pagination.

## 4. Modèles de Pages (Templates)

### 4.1 "Ma Collection" (Vue générale)

* **En-tête :** Résumé des métriques de la collection (*Disques sur l'étagère*, *Artistes uniques*, *Valeur estimée*).

* **Barre de recherche & Filtres :** Filtrage instantané par nom, genre, état ou format.

* **Zone de contenu :** Grille responsive sur 4 colonnes présentant l'ensemble des vinyles.

### 4.2 "Détails du vinyle" (Fiche d'un pressage)

* **En-tête supérieur :** Fil d'Ariane (`Ma Collection / Kind of Blue`), badges de statut, actions rapides (`Éditer le vinyle`, `Plus`).

* **Section Héro :** Pochette haute définition (avec option `Agrandir`) affichée à côté des détails précis du pressage (Label, N° de catalogue, Format, Pays, Date de sortie, Matrice / Runout).

* **Section État & Conservation :** Cartes côte à côte détaillant la **Condition du média** et la **Condition de la pochette** avec commentaires du collectionneur.

* **Tracklist & Historique d'achat :** Liste des pistes avec durées + historique d'acquisition (*Date d'ajout*, *Prix payé*, *Lieu d'achat*, *Emplacement sur l'étagère*, *Notes personnelles*).

### 4.3 "Wantlist" (Liste de souhaits & Critères)

* **En-tête :** Vue d'ensemble des vinyles recherchés avec indicateurs de priorité.

* **Disposition :** Affichage séparé avec la liste des disques recherchés à gauche et un résumé du budget cible et des critères d'exigence à droite (*Budget total engagé*, *Exigences minimales d'état*).

## 5. Design Sytème

<img width="1440" height="1290" alt="Atoms" src="https://github.com/user-attachments/assets/f1b24468-1ede-47bc-807d-e2266542df7f" />
<img width="1440" height="1024" alt="Molecules" src="https://github.com/user-attachments/assets/4cc1e0a1-b77f-469f-bf10-c8de443e31dc" />
<img width="1440" height="1666" alt="Organisme" src="https://github.com/user-attachments/assets/b580e8ed-0690-480e-a562-35f44b0eaee2" />
