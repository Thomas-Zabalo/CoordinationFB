/**
 * Gestionnaire et catalogue des messages d'erreurs.
 *
 * Ce module centralise les messages et titres d'erreurs associés aux codes HTTP
 * et aux erreurs applicatives.
 *
 * Pour ajouter de nouvelles erreurs ultérieurement :
 * 1. Soit en enrichissant les dictionnaires `MESSAGES_ERREURS_PAR_DEFAUT` et `TITRES_ERREURS_PAR_DEFAUT` ci-dessous.
 * 2. Soit dynamiquement via `enregistrerErreur(code, message, titre)` ou `enregistrerErreurs({ ... })`.
 */

export const MESSAGES_ERREURS_PAR_DEFAUT = {
  // Client & Validation
  400: 'Requête invalide : les informations transmises sont incomplètes ou incorrectes.',
  401: 'Authentification requise : veuillez vous connecter pour accéder à cette ressource.',
  403: 'Accès refusé : vous n’avez pas les droits nécessaires pour effectuer cette action.',
  404: 'Ressource introuvable : l’élément demandé n’existe pas ou a été déplacé.',
  405: 'Méthode non autorisée : cette opération n’est pas permise.',
  408: 'Délai d’attente dépassé : la requête a mis trop de temps à aboutir.',
  409: 'Conflit : une ressource similaire existe déjà ou un conflit est survenu.',
  413: 'Contenu trop volumineux : la taille de la requête dépasse la limite autorisée.',
  415: 'Format non supporté : le format des données envoyées n’est pas accepté.',
  422: 'Données non traitables : certaines informations ne peuvent pas être traitées.',
  429: 'Trop de requêtes : veuillez patienter un instant avant de réessayer.',

  // Serveur
  500: 'Erreur interne du serveur : un incident technique est survenu.',
  502: 'Passerelle incorrecte : le serveur distant ne répond pas.',
  503: 'Service temporairement indisponible : réessayez dans quelques instants.',
  504: 'Délai d’attente de la passerelle dépassé : le serveur n’a pas répondu à temps.',

  // Réseau / Connexion
  0: 'Impossible de joindre le serveur. Vérifiez votre connexion et que l’API est démarrée.',
  NETWORK_ERROR: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.',
};

export const TITRES_ERREURS_PAR_DEFAUT = {
  400: 'Requête invalide',
  401: 'Authentification requise',
  403: 'Accès refusé (403)',
  404: 'Ressource introuvable (404)',
  405: 'Action non autorisée',
  408: 'Délai expiré',
  409: 'Conflit',
  413: 'Fichier trop lourd',
  415: 'Format non supporté',
  422: 'Données non valides',
  429: 'Trop de requêtes',
  500: 'Erreur serveur (500)',
  502: 'Passerelle en erreur',
  503: 'Service indisponible',
  504: 'Délai dépassé',
  0: 'Erreur réseau',
  NETWORK_ERROR: 'Erreur réseau',
};

// Registres dynamiques (initialisés avec les valeurs par défaut)
const registreMessages = { ...MESSAGES_ERREURS_PAR_DEFAUT };
const registreTitres = { ...TITRES_ERREURS_PAR_DEFAUT };

/**
 * Enregistre ou personnalise un message d'erreur.
 *
 * @param {string|number} code - Code de statut HTTP (ex: 403, 404, 418) ou identifiant d'erreur personnalisé (ex: 'STOCK_EPUISE')
 * @param {string} message - Message utilisateur explicatif
 * @param {string} [titre] - Titre optionnel pour le toast
 *
 * @example
 * // Ajouter une nouvelle erreur HTTP 418
 * enregistrerErreur(418, "Je suis une théière !", "Erreur 418");
 *
 * // Ajouter une erreur métier spécifique
 * enregistrerErreur('VINYLE_DEJA_COLLECTION', "Ce vinyle figure déjà dans votre collection.", "Doublon");
 */
export function enregistrerErreur(code, message, titre) {
  registreMessages[code] = message;
  if (titre) {
    registreTitres[code] = titre;
  }
}

/**
 * Enregistre plusieurs messages d'erreurs en une seule fois.
 *
 * @param {Record<string|number, string|{ message: string, titre?: string }>} erreurs - Dictionnaire d'erreurs
 *
 * @example
 * enregistrerErreurs({
 *   418: { message: "Je suis une théière", titre: "Code 418" },
 *   'SESSION_EXPIREE': "Votre session a expiré, veuillez vous reconnecter."
 * });
 */
export function enregistrerErreurs(erreurs) {
  if (!erreurs || typeof erreurs !== 'object') return;
  for (const [code, valeur] of Object.entries(erreurs)) {
    if (typeof valeur === 'string') {
      registreMessages[code] = valeur;
    } else if (valeur && typeof valeur === 'object') {
      if (valeur.message) registreMessages[code] = valeur.message;
      if (valeur.titre) registreTitres[code] = valeur.titre;
    }
  }
}

/**
 * Réinitialise le registre avec les messages par défaut (utile notamment pour les tests).
 */
export function reinitialiserRegistreErreurs() {
  for (const cle of Object.keys(registreMessages)) {
    delete registreMessages[cle];
  }
  for (const cle of Object.keys(registreTitres)) {
    delete registreTitres[cle];
  }
  Object.assign(registreMessages, MESSAGES_ERREURS_PAR_DEFAUT);
  Object.assign(registreTitres, TITRES_ERREURS_PAR_DEFAUT);
}

/**
 * Résout une erreur (code HTTP, ErreurApi, instance Error, string) en objet normalisé { titre, message, statut, details }.
 *
 * @param {unknown} erreur - L'erreur à analyser
 * @param {string} [messageSecours] - Message de repli si aucun n'est résolu
 * @returns {{ titre: string, message: string, statut?: number|string, details?: unknown }}
 */
export function resoudreErreur(erreur, messageSecours = 'Une erreur inattendue est survenue.') {
  if (erreur === null || erreur === undefined) {
    return { titre: 'Erreur', message: messageSecours };
  }

  // 1. Code HTTP numérique direct (ex: 403, 404, 500)
  if (typeof erreur === 'number') {
    const message = registreMessages[erreur] ?? `Erreur HTTP ${erreur}`;
    const titre = registreTitres[erreur] ?? `Erreur ${erreur}`;
    return { titre, message, statut: erreur };
  }

  // 2. Chaîne de caractères
  if (typeof erreur === 'string') {
    // Si la chaîne correspond à une clé répertoriée (ex: "403" ou "NETWORK_ERROR")
    if (registreMessages[erreur]) {
      return {
        titre: registreTitres[erreur] ?? 'Erreur',
        message: registreMessages[erreur],
        statut: erreur,
      };
    }
    return { titre: 'Erreur', message: erreur };
  }

  // 3. Objet avec statut HTTP (ErreurApi ou similaire)
  const statut = erreur.statut ?? erreur.status;
  if (statut !== undefined && statut !== null) {
    const titre = registreTitres[statut] ?? (statut ? `Erreur ${statut}` : 'Erreur');
    const messageDefaut = registreMessages[statut];

    // Message éventuel fourni par le backend / l'erreur
    const messageApi = erreur.message && erreur.message !== 'Erreur inattendue' ? erreur.message : null;

    let messageFinal;
    if (messageApi && messageApi !== messageDefaut) {
      messageFinal = messageApi;
    } else {
      messageFinal = messageDefaut || messageApi || messageSecours;
    }

    return {
      titre,
      message: messageFinal,
      statut,
      details: erreur.details,
    };
  }

  // 4. Instance standard d'Error
  if (erreur instanceof Error || typeof erreur.message === 'string') {
    const message = registreMessages[erreur.message] ?? erreur.message;
    return {
      titre: 'Erreur',
      message: message || messageSecours,
      details: erreur.details,
    };
  }

  return { titre: 'Erreur', message: messageSecours };
}

/**
 * Retourne uniquement le message utilisateur d'une erreur.
 *
 * @param {unknown} erreur - L'erreur à formater
 * @param {string} [messageSecours] - Message de repli
 * @returns {string}
 */
export function obtenirMessageErreur(erreur, messageSecours) {
  return resoudreErreur(erreur, messageSecours).message;
}
