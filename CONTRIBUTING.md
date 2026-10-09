# Contribuer à CoordinationFB

Merci de vouloir contribuer à **CoordinationFB**, un gestionnaire de collection de vinyles. Ce guide explique comment l'équipe s'organise, comment front et back se coordonnent, comment communiquer et comment soumettre du code.

## Sommaire

- [Code de conduite](#code-de-conduite)
- [Communiquer et relire le code](#communiquer-et-relire-le-code)
- [Méthode de travail](#méthode-de-travail)
- [Coordination front / back](#coordination-front--back)
- [Signaler un bug](#signaler-un-bug)
- [Proposer une fonctionnalité](#proposer-une-fonctionnalité)
- [Mettre en place l'environnement](#mettre-en-place-lenvironnement)
- [Workflow Git](#workflow-git)
- [Convention de commits](#convention-de-commits)
- [Pull requests](#pull-requests)
- [Règles de code](#règles-de-code)
- [Vocabulaire métier](#vocabulaire-métier)
- [Sécurité](#sécurité)
- [Pourquoi ces règles ?](#pourquoi-ces-règles-)

## Code de conduite

Restez respectueux et bienveillant dans les issues, les revues et les discussions. Critiquez le code, pas les personnes. Tout comportement harcelant ou discriminant entraînera l'exclusion du projet.

## Communiquer et relire le code

Un projet à plusieurs échoue plus souvent à cause de la communication qu'à cause du code. Ces règles s'appliquent partout : issues, pull requests, messages et réunions.

### Quatre règles pour chaque échange

| Règle                               | En pratique                                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Soigner ses mots**                | Relisez votre commentaire avant de l'envoyer. Soyez précis, factuel et poli. Pas d'ironie : à l'écrit, elle est presque toujours mal comprise. |
| **Ne pas le prendre personnellement** | Une remarque en revue porte sur le code, pas sur vous. Celui qui relit aide le projet, il ne vous juge pas.                         |
| **Ne rien supposer**                | Si un besoin, un comportement ou un commentaire n'est pas clair, posez la question. Une issue doit être compréhensible sans contexte oral. |
| **Faire de son mieux**              | Personne n'attend une PR parfaite. Faites de votre mieux, demandez de l'aide quand vous bloquez, et passez à la suite.               |

### Le ton à adopter

Parlez d'égal à égal : ni donneur de leçons, ni soumis. Appuyez-vous sur des faits et formulez vos remarques sous forme de **questions**, c'est le ton qui passe le mieux auprès de tout le monde.

| ❌ À éviter                      | ✅ À privilégier                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| « C'est faux. »                 | « Ce calcul ne prend pas en compte les rééditions, non ? Par exemple pour le pressage de 1987. » |
| « Change le nom de la variable. » | « Que penses-tu d'un nom plus explicite pour cette variable ? Ce serait plus lisible. »            |
| « Encore cassé… »               | « Les tests échouent depuis ce commit, voici le message d'erreur : … »                           |

Préfixez vos commentaires de revue pour indiquer leur importance :

- `bloquant :` doit être corrigé avant la fusion ;
- `suggestion :` amélioration facultative ;
- `question :` demande d'explication, sans changement attendu ;
- `bravo :` quelque chose de bien fait, ça compte aussi.

### Trois pièges à éviter

| Piège                     | Exemple                                                         | À faire à la place                                                                       |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Chercher un coupable**  | « Qui a cassé la prod ? »                                       | Décrire le problème, le corriger ensemble, puis en tirer une leçon en rétrospective.     |
| **Faire à la place**      | Réécrire soi-même la PR d'un collègue au lieu de la relire.     | Expliquer en commentaire, proposer un pair programming. Chacun reste maître de sa tâche. |
| **Subir en silence**      | Rester bloqué trois jours sur une tâche sans rien dire.         | Signaler le blocage tôt : au daily, ou en commentaire sur l'issue avec le label `bloqué`. |

### Bienvenue aux débutants

- Il n'y a pas de question bête : une question posée tôt évite une journée perdue.
- Une CI qui échoue ou une PR très commentée, c'est normal : c'est comme ça qu'on progresse.
- N'attendez pas que tout soit parfait pour montrer votre travail : ouvrez une **PR en brouillon** (*draft*) dès que vous voulez un premier avis.

## Méthode de travail

L'équipe suit une méthode agile inspirée de **Scrum**.

### Rôles

| Rôle                         | Responsabilités                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Product Owner**            | Représente les besoins des collectionneurs, rédige et priorise les user stories, valide ce qui est livré.      |
| **Scrum Master**             | Veille au bon déroulement des sprints, anime les rituels et aide à lever les blocages.                         |
| **Équipe de développement**  | Front et back : estime, réalise, teste et relit les tâches du sprint.                                          |

### Sprints et rituels

Le travail est découpé en **sprints de 2 semaines**, gérés comme des **cycles** dans Linear.

| Rituel              | Quand                 | Objectif                                                                                                 |
| ------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| **Sprint planning** | Début de sprint       | Choisir les user stories du sprint, les découper en tâches et les répartir entre front et back.          |
| **Daily**           | Chaque jour, 15 min max | Chacun dit ce qu'il a fait, ce qu'il va faire et ce qui le bloque.                                       |
| **Sprint review**   | Fin de sprint         | Montrer ce qui fonctionne au Product Owner et recueillir ses retours.                                    |
| **Rétrospective**   | Fin de sprint         | Ce qui a bien marché, ce qui doit changer, et une ou deux actions concrètes pour le sprint suivant.      |

### Suivi des tâches

Toutes les tâches vivent dans **Linear**, sous forme d'issues. Chaque issue a un identifiant (par exemple `CFB-12`) et passe par ces statuts :

`Backlog` → `Todo` → `In Progress` → `In Review` → `Done`

- Une issue = une tâche assez petite pour tenir dans un cycle.
- Assignez-vous une issue **avant** de commencer et tenez son statut à jour.
- Si une tâche dépend d'une autre (par exemple le front qui attend des données du back), liez-les avec la relation **« Blocked by »** de Linear.
- Pas de travail « caché » : si ce n'est pas dans Linear, ça n'existe pas.

L'intégration GitHub de Linear relie automatiquement les branches et les PR aux issues grâce à leur identifiant, et fait avancer le statut de l'issue quand la PR est ouverte puis fusionnée.

### Definition of Done

Une tâche n'est **terminée** que si :

- [ ] le code est fusionné dans `main` ;
- [ ] les tests passent et couvrent le nouveau comportement ;
- [ ] la PR a été relue et approuvée ;
- [ ] l'accord front / back et la documentation sont à jour si besoin ;
- [ ] le Product Owner a validé le résultat (en sprint review ou sur l'issue).

## Coordination front / back

Le front et le back avancent en parallèle. Pour ne pas se bloquer, **on se met d'accord sur les données échangées avant de coder**.

### Avant de commencer une fonctionnalité

1. Si la fonctionnalité touche aux deux côtés, le front et le back définissent ensemble les données qui passent de l'un à l'autre : ce que le front demande, ce que le back renvoie, sous quelle forme, et ce qui se passe en cas d'erreur.
2. Cet accord est noté dans l'issue Linear, avec le label `front-back`, et doit être **validé par au moins une personne du front et une du back**.
3. Une fois l'accord validé :
   - le **back** fournit les données exactement sous la forme convenue ;
   - le **front** avance avec des **données de test** qui ont cette même forme, sans attendre le back.
4. Quand le back est prêt, le front remplace les données de test par les vraies.

### Changer ce qui a été convenu

- Si un changement modifie les données échangées (une information renommée, supprimée ou présentée autrement), **prévenez l'autre équipe avant la fusion**, en la mentionnant dans la PR.
- Mettez à jour l'accord dans l'issue Linear en même temps.
- En cas de désaccord entre front et back, on en parle de vive voix (daily ou réunion courte) plutôt que de multiplier les commentaires.

### Labels Linear

| Label        | Usage                                                  |
| ------------ | ------------------------------------------------------ |
| `front`      | Concerne l'interface.                                  |
| `back`       | Concerne le serveur, la base de données ou la logique. |
| `front-back` | Modifie les données échangées entre front et back.     |
| `bug`        | Comportement incorrect.                                |
| `feature`    | Nouvelle fonctionnalité ou amélioration.               |
| `bloqué`     | La tâche attend quelque chose ou quelqu'un.            |

## Signaler un bug

1. Vérifiez dans Linear que le bug n'a pas déjà été signalé.
2. Créez une issue avec le label `bug` et le label `front` ou `back` si vous savez d'où il vient. Indiquez :
   - ce que vous avez fait (étapes pour reproduire) ;
   - ce que vous attendiez ;
   - ce qui s'est réellement passé (message d'erreur, capture d'écran) ;
   - votre environnement (OS, navigateur, version de l'application).

Restez factuel : décrivez le problème, pas la personne qui l'a introduit.

Exemple de titre : `Le tri par année de sortie ignore les rééditions`.

Vous ne faites pas partie de l'équipe et n'avez pas accès à Linear ? Ouvrez une [issue GitHub](https://github.com/Thomas-Zabalo/CoordinationFB/issues) : l'équipe la reportera dans Linear.

## Proposer une fonctionnalité

Créez une issue Linear avec le label `feature` **avant** de commencer à coder, pour en discuter avec l'équipe. Rédigez-la sous forme de **user story** :

> **En tant que** collectionneur,
> **je veux** voir la valeur estimée de ma collection,
> **afin de** savoir combien elle vaut pour mon assurance.

Ajoutez :

- les **critères d'acceptation** : ce qui doit marcher pour que la story soit validée ;
- la solution envisagée et les alternatives éventuelles ;
- les impacts front et back, et si les données échangées entre les deux doivent évoluer.

Le Product Owner priorise la story dans le backlog. Une fois qu'elle entre dans un cycle, assignez-vous l'issue pour éviter que deux personnes travaillent sur la même chose.

## Mettre en place l'environnement

1. **Forkez** le dépôt (contributeurs externes) ou **clonez-le** directement (membres de l'équipe) :

   ```bash
   git clone https://github.com/Thomas-Zabalo/CoordinationFB.git
   cd CoordinationFB
   ```

2. Installez les dépendances et lancez le projet en suivant les instructions du [README](README.md).
3. Si le projet utilise des variables d'environnement, copiez le fichier d'exemple (`.env.example`) vers `.env` et complétez-le. **Ne commitez jamais le fichier `.env`.**

## Workflow Git

La branche `main` doit toujours rester stable. On ne pousse jamais directement dessus.

1. Mettez votre `main` à jour :

   ```bash
   git checkout main
   git pull origin main
   ```

2. Créez une branche depuis `main` en suivant ce format : `<type>/<identifiant-linear>-<description-courte>`

   | Type        | Usage                                   | Exemple                           |
   | ----------- | --------------------------------------- | --------------------------------- |
   | `feature/`  | Nouvelle fonctionnalité                 | `feature/CFB-12-liste-envies`     |
   | `fix/`      | Correction de bug                       | `fix/CFB-27-tri-annee-reedition`  |
   | `docs/`     | Documentation                           | `docs/CFB-5-contributing`         |
   | `refactor/` | Refonte sans changement de comportement | `refactor/CFB-18-service-vinyles` |
   | `chore/`    | Maintenance (dépendances, config, CI)   | `chore/CFB-30-maj-dependances`    |

   L'identifiant Linear dans le nom de branche permet de relier automatiquement la branche à l'issue.

3. Faites des commits petits et cohérents.
4. Avant d'ouvrir la PR, rebasez votre branche sur `main` pour résoudre les conflits de votre côté :

   ```bash
   git fetch origin
   git rebase origin/main
   ```

## Convention de commits

Stratégie de gestion des branches Git
1. Branches permanentes
main : Branche de déploiement en production. Elle doit toujours contenir un code stable et prêt à être déployé.
qualif : Branche de qualification (ou pré-production). Elle sert à déployer l'environnement de test afin de valider les tickets avant leur passage en production.
2. Branches de développement (éphémères)

Ces branches sont créées à partir de main et suivent la nomenclature des tickets Linear.

Types de branches
feature/<ID-Linear>-nom-court : Pour le développement d'une nouvelle fonctionnalité.
Exemple : feature/LIN-101-ajout-bouton-login
fix/<ID-Linear>-nom-court : Pour la correction de bugs.
Exemple : fix/LIN-102-erreur-404-profil
conf/<ID-Linear>-nom-court : Pour les modifications de configuration ou d'infrastructure.
Exemple : conf/LIN-103-update-variables-env
3. Cycle de vie d'un ticket
Étape 1 — Création

Créer une branche de travail (feature/, fix/ ou conf/) toujours à partir de main.

Étape 2 — Développement

Effectuer les commits nécessaires sur la branche de travail dédiée au ticket.

Étape 3 — Qualification

Ouvrir une Pull Request (PR) ou fusionner la branche de travail vers qualif afin que la fonctionnalité soit testée sur l'environnement de staging.

Étape 4 — Mise en production

Une fois la QA validée sur qualif, ouvrir une PR de la branche de travail directement vers main.

Après la fusion dans main, la branche de développement peut être supprimée.

4. Récapitulatif du workflow
Créer une branche depuis main.
Développer et committer les modifications sur cette branche.
Déployer et tester les modifications sur qualif.
Valider la QA.
Ouvrir une PR vers main.
Fusionner la PR après validation.
Supprimer la branche de développement.

gitGraph
    commit id: "v1.0.0" tag: "Prod"
    
    branch qualif
    checkout qualif
    commit id: "sync qualif"
    
    %% Développement d'une Feature
    checkout main
    branch feature/LIN-101
    checkout feature/LIN-101
    commit id: "dev feature A"
    commit id: "dev feature B"
    
    %% Déploiement en Qualif pour test
    checkout qualif
    merge feature/LIN-101 id: "PR vers qualif (Tests)"
    
    %% Validation et Déploiement en Prod
    checkout main
    merge feature/LIN-101 id: "PR vers main (Prod)" tag: "v1.1.0"
    
    %% Développement d'un Hotfix ou Fix
    branch fix/LIN-102
    checkout fix/LIN-102
    commit id: "correction bug"
    
    %% Test du fix en qualif
    checkout qualif
    merge fix/LIN-102 id: "PR vers qualif (Tests fix)"
    
    %% Déploiement du fix en Prod
    checkout main
    merge fix/LIN-102 id: "PR vers main (Prod)" tag: "v1.1.1"

## Pull requests

1. Poussez votre branche et ouvrez une PR vers `main`. Si le travail n'est pas fini mais que vous voulez un avis, ouvrez-la en **brouillon** (*draft*).
2. Donnez-lui un titre clair (même format que les commits) et une description qui explique :
   - **quoi** : ce que la PR change ;
   - **pourquoi** : le lien avec l'issue Linear (`Fixes CFB-12`) ;
   - **comment tester** : les étapes pour vérifier le comportement ;
   - **impact sur l'autre équipe** : aucun, ou ce qui change pour elle ;
   - des captures d'écran si l'interface change.
3. Vérifiez avant de demander une revue :
   - [ ] le projet se lance sans erreur ;
   - [ ] les tests passent et les nouveaux comportements sont testés ;
   - [ ] le linter ne remonte aucune erreur ;
   - [ ] aucune donnée sensible (mot de passe, clé secrète, `.env`) n'est commitée ;
   - [ ] l'accord front / back et la documentation sont à jour si nécessaire.
4. Au moins **une approbation** d'un autre membre est requise avant la fusion. Une PR qui modifie les données échangées entre front et back demande **une approbation du front et une du back**.
5. Relisez les PR des autres dans les **24 h** (jours ouvrés) : une PR qui attend bloque toute l'équipe.
6. Répondez aux commentaires de revue par de nouveaux commits, puis fusionnez en **squash and merge** pour garder un historique lisible.
7. Supprimez la branche une fois fusionnée et vérifiez que l'issue Linear est bien passée en `Done`.

## Règles de code

- Respectez le style déjà présent dans le projet et la configuration du linter / formateur.
- Noms explicites : une variable ou une fonction doit dire ce qu'elle contient ou ce qu'elle fait, sans abréviation obscure.
- Utilisez les **mêmes noms** côté front et côté back pour désigner les mêmes informations.
- Une fonction = une responsabilité.
- Pas de code mort, de `console.log` / `print` de debug ou de code commenté dans une PR.
- Toute nouvelle fonctionnalité ou correction de bug doit être accompagnée de tests.
- Les commentaires expliquent le _pourquoi_, pas le _quoi_.

## Vocabulaire métier

Pour que tout le monde parle la même langue dans le code et les issues :

| Terme                      | Définition                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sortie**                 | Une œuvre publiée : album, EP, single.                                                                                                     |
| **Pressage** / **édition** | Une version physique précise d'une sortie (pays, année, label, couleur du vinyle…). Une même sortie peut avoir plusieurs pressages.      |
| **Numéro de catalogue**    | Référence attribuée par le label à un pressage (ex. `PCS 7027`).                                                                           |
| **Format**                 | LP (33 tours), EP, single (45 tours), 78 tours, avec sa taille (12", 10", 7").                                                             |
| **Collection**             | Les exemplaires possédés par un utilisateur.                                                                                               |
| **Liste d'envies**         | Les vinyles recherchés par un utilisateur.                                                                                                 |
| **État** (_grading_)       | État du disque et de la pochette, selon l'échelle standard du marché du disque : `M` (Mint), `NM` (Near Mint), `VG+`, `VG`, `G+`, `G`, `F` (Fair), `P` (Poor). |

Le disque et la pochette ont chacun leur propre état : ne les fusionnez pas en une seule information.

## Sécurité

- Les mots de passe, clés secrètes et tokens se placent uniquement dans des variables d'environnement, jamais dans le code.
- Si vous découvrez une faille de sécurité, **n'ouvrez pas d'issue publique** : contactez directement les mainteneurs du dépôt.

## Pourquoi ces règles ?

Ces règles s'appuient sur des méthodes reconnues d'organisation et de communication :

- **Scrum** : sprints, rôles, rituels et Definition of Done.
- **Les quatre accords toltèques** (Don Miguel Ruiz) : les quatre règles pour chaque échange.
- **L'analyse transactionnelle** (Eric Berne) : parler d'égal à égal, d'adulte à adulte.
- **Le triangle dramatique** (Stephen Karpman) : les trois pièges du persécuteur, du sauveur et de la victime.
- **La Process Communication** (Taibi Kahler) : le ton factuel et interrogatif, compris par tous.
- **La PNL** et **_Taming Your Gremlin_** (Rick Carson) : dépasser les croyances limitantes et oser montrer un travail inachevé.

---

Merci pour votre contribution !
