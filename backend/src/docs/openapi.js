import { NOM_COOKIE_SESSION } from '../auth/sessions.js';
import { ANNEE_MIN, ETATS, FORMATS, LISTES, ORDRES, TAILLES, TRIS } from '../vinyles/constantes.js';
import { LONGUEUR_MAX_NOTES, LONGUEUR_MAX_TEXTE } from '../vinyles/validation.js';

function champsVinyleBase() {
  return {
    artiste: {
      type: 'string',
      maxLength: LONGUEUR_MAX_TEXTE,
      example: 'Miles Davis',
      description: 'Nom de l’artiste ou du groupe.',
    },
    titre: {
      type: 'string',
      maxLength: LONGUEUR_MAX_TEXTE,
      example: 'Kind of Blue',
      description: 'Titre de la sortie (album, EP, single).',
    },
    annee: {
      type: 'integer',
      nullable: true,
      minimum: ANNEE_MIN,
      example: 1959,
      description: `Année de sortie ou de pressage (entre ${ANNEE_MIN} et l’année courante + 1).`,
    },
    genre: {
      type: 'string',
      nullable: true,
      maxLength: LONGUEUR_MAX_TEXTE,
      example: 'Jazz',
    },
    label: {
      type: 'string',
      nullable: true,
      maxLength: LONGUEUR_MAX_TEXTE,
      example: 'Columbia',
    },
    numeroCatalogue: {
      type: 'string',
      nullable: true,
      maxLength: LONGUEUR_MAX_TEXTE,
      example: 'CS 8163',
      description: 'Référence attribuée par le label au pressage.',
    },
    format: {
      type: 'string',
      nullable: true,
      enum: [...FORMATS, null],
      example: 'LP',
    },
    taille: {
      type: 'string',
      nullable: true,
      enum: [...TAILLES, null],
      example: '12"',
    },
    pays: {
      type: 'string',
      nullable: true,
      maxLength: LONGUEUR_MAX_TEXTE,
      example: 'États-Unis',
    },
    couleur: {
      type: 'string',
      nullable: true,
      maxLength: LONGUEUR_MAX_TEXTE,
      example: 'Noir',
    },
    etatDisque: {
      type: 'string',
      nullable: true,
      enum: [...ETATS, null],
      example: 'NM',
      description: 'État du média selon l’échelle Goldmine (évalué séparément de la pochette).',
    },
    etatPochette: {
      type: 'string',
      nullable: true,
      enum: [...ETATS, null],
      example: 'VG+',
      description: 'État de la pochette selon l’échelle Goldmine (évalué séparément du disque).',
    },
    liste: {
      type: 'string',
      enum: [...LISTES],
      default: 'collection',
      example: 'collection',
      description: 'Liste cible : collection possédée ou liste d’envies.',
    },
    notes: {
      type: 'string',
      nullable: true,
      maxLength: LONGUEUR_MAX_NOTES,
      example: 'Pressage stéréo original, matrice 1A/1B',
    },
  };
}

export function creerSpecOpenApi() {
  const champsVinyle = champsVinyleBase();

  return {
    openapi: '3.0.3',
    info: {
      title: 'API CoordinationFB',
      version: '1.0.0',
      description:
        'API REST du gestionnaire de collection de vinyles **CoordinationFB** : gestion de la collection, liste d’envies, notation Goldmine séparée disque/pochette et authentification par session.',
    },
    servers: [
      { url: '/', description: 'Serveur courant (racine)' },
      { url: '/api', description: 'Préfixe public /api' },
    ],
    tags: [
      { name: 'Système', description: 'État de santé de l’API' },
      { name: 'Authentification', description: 'Inscription, connexion, session courante et déconnexion' },
      { name: 'Vinyles', description: 'Opérations CRUD, recherche, filtres et transfert vers la collection' },
    ],
    components: {
      securitySchemes: {
        cookieSession: {
          type: 'apiKey',
          in: 'cookie',
          name: NOM_COOKIE_SESSION,
          description: 'Cookie HttpOnly défini lors de l’inscription ou de la connexion.',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Jeton de session transmis dans l’en-tête Authorization: Bearer <jeton>.',
        },
      },
      parameters: {
        IdVinyle: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Identifiant numérique positif du vinyle.',
          schema: { type: 'integer', minimum: 1 },
          example: 1,
        },
      },
      schemas: {
        StatutSante: {
          type: 'object',
          required: ['statut'],
          properties: {
            statut: { type: 'string', example: 'ok' },
          },
        },
        ErreurReponse: {
          type: 'object',
          required: ['erreur'],
          properties: {
            erreur: {
              type: 'object',
              required: ['message'],
              properties: {
                message: { type: 'string', example: 'Certains champs sont invalides' },
                details: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                  example: { artiste: 'Champ obligatoire' },
                },
              },
            },
          },
        },
        Utilisateur: {
          type: 'object',
          required: ['id', 'email', 'nom', 'dateCreation', 'dateModification'],
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'collectionneur@exemple.fr' },
            nom: { type: 'string', example: 'Alex Martin' },
            dateCreation: { type: 'string', format: 'date-time', example: '2026-11-20T10:00:00.000Z' },
            dateModification: { type: 'string', format: 'date-time', example: '2026-11-20T10:00:00.000Z' },
          },
        },
        ReponseUtilisateur: {
          type: 'object',
          required: ['utilisateur'],
          properties: {
            utilisateur: { $ref: '#/components/schemas/Utilisateur' },
          },
        },
        InscriptionRequete: {
          type: 'object',
          required: ['email', 'nom', 'motDePasse'],
          properties: {
            email: { type: 'string', format: 'email', maxLength: 254, example: 'collectionneur@exemple.fr' },
            nom: { type: 'string', minLength: 2, maxLength: 100, example: 'Alex Martin' },
            motDePasse: {
              type: 'string',
              format: 'password',
              minLength: 8,
              maxLength: 128,
              example: 'Vinyle2026',
              description: 'Au moins 8 caractères contenant une lettre et un chiffre.',
            },
          },
        },
        ConnexionRequete: {
          type: 'object',
          required: ['email', 'motDePasse'],
          properties: {
            email: { type: 'string', format: 'email', example: 'collectionneur@exemple.fr' },
            motDePasse: { type: 'string', format: 'password', example: 'Vinyle2026' },
          },
        },
        Vinyle: {
          type: 'object',
          required: ['id', 'artiste', 'titre', 'liste', 'dateAjout', 'dateModification'],
          properties: {
            id: { type: 'integer', example: 1 },
            ...champsVinyle,
            dateAjout: { type: 'string', format: 'date-time', example: '2026-11-20T10:00:00.000Z' },
            dateModification: { type: 'string', format: 'date-time', example: '2026-11-20T10:00:00.000Z' },
          },
        },
        VinyleCreation: {
          type: 'object',
          required: ['artiste', 'titre'],
          properties: champsVinyle,
        },
        VinyleModificationPartielle: {
          type: 'object',
          minProperties: 1,
          description: 'Sous-ensemble des champs modifiables d’un vinyle (au moins un champ requis).',
          properties: champsVinyle,
        },
        VinyleTransfert: {
          type: 'object',
          description: 'Informations facultatives à renseigner lors du passage de la liste d’envies vers la collection.',
          properties: {
            etatDisque: champsVinyle.etatDisque,
            etatPochette: champsVinyle.etatPochette,
            notes: champsVinyle.notes,
          },
        },
      },
      responses: {
        ValidationInvalide: {
          description: 'Données invalides',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErreurReponse' },
            },
          },
        },
        NonAutorise: {
          description: 'Authentification requise ou identifiants invalides',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErreurReponse' },
            },
          },
        },
        Introuvable: {
          description: 'Ressource introuvable',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErreurReponse' },
            },
          },
        },
        Conflit: {
          description: 'Conflit métier (ex. e-mail déjà utilisé ou vinyle déjà dans la collection)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErreurReponse' },
            },
          },
        },
      },
    },
    paths: {
      '/sante': {
        get: {
          tags: ['Système'],
          summary: 'Vérifier l’état de santé de l’API',
          responses: {
            200: {
              description: 'API opérationnelle',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StatutSante' },
                },
              },
            },
          },
        },
      },
      '/auth/inscription': {
        post: {
          tags: ['Authentification'],
          summary: 'Créer un compte utilisateur et ouvrir une session',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InscriptionRequete' },
              },
            },
          },
          responses: {
            201: {
              description: 'Compte créé et cookie de session défini',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReponseUtilisateur' },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
            409: { $ref: '#/components/responses/Conflit' },
          },
        },
      },
      '/auth/connexion': {
        post: {
          tags: ['Authentification'],
          summary: 'Connecter un utilisateur existant',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConnexionRequete' },
              },
            },
          },
          responses: {
            200: {
              description: 'Connexion réussie et cookie de session défini',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReponseUtilisateur' },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
            401: { $ref: '#/components/responses/NonAutorise' },
          },
        },
      },
      '/auth/deconnexion': {
        post: {
          tags: ['Authentification'],
          summary: 'Révoquer la session active et effacer le cookie',
          responses: {
            204: { description: 'Déconnexion effectuée' },
          },
        },
      },
      '/auth/moi': {
        get: {
          tags: ['Authentification'],
          summary: 'Récupérer l’utilisateur authentifié',
          security: [{ cookieSession: [] }, { bearerAuth: [] }],
          responses: {
            200: {
              description: 'Profil de l’utilisateur connecté',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ReponseUtilisateur' },
                },
              },
            },
            401: { $ref: '#/components/responses/NonAutorise' },
          },
        },
      },
      '/vinyles': {
        get: {
          tags: ['Vinyles'],
          summary: 'Lister, rechercher, filtrer et trier les vinyles',
          parameters: [
            {
              name: 'liste',
              in: 'query',
              description: 'Filtrer par liste',
              schema: { type: 'string', enum: [...LISTES] },
            },
            {
              name: 'q',
              in: 'query',
              description: 'Recherche insensible à la casse et aux accents (artiste, titre, label, catalogue, genre)',
              schema: { type: 'string', maxLength: LONGUEUR_MAX_TEXTE },
            },
            {
              name: 'genre',
              in: 'query',
              description: 'Filtrer par genre exact (insensible à la casse et aux accents)',
              schema: { type: 'string', maxLength: LONGUEUR_MAX_TEXTE },
            },
            {
              name: 'format',
              in: 'query',
              description: 'Filtrer par format physique',
              schema: { type: 'string', enum: [...FORMATS] },
            },
            {
              name: 'tri',
              in: 'query',
              description: 'Critère de tri',
              schema: { type: 'string', enum: [...TRIS], default: 'dateAjout' },
            },
            {
              name: 'ordre',
              in: 'query',
              description: 'Sens du tri',
              schema: { type: 'string', enum: [...ORDRES] },
            },
          ],
          responses: {
            200: {
              description: 'Liste des vinyles correspondants',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Vinyle' },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
          },
        },
        post: {
          tags: ['Vinyles'],
          summary: 'Ajouter un nouveau vinyle',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VinyleCreation' },
              },
            },
          },
          responses: {
            201: {
              description: 'Vinyle créé',
              headers: {
                Location: {
                  description: 'URL de la ressource créée',
                  schema: { type: 'string', example: '/vinyles/1' },
                },
              },
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Vinyle' },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
          },
        },
      },
      '/vinyles/genres': {
        get: {
          tags: ['Vinyles'],
          summary: 'Lister les genres distincts triés alphabétiquement',
          parameters: [
            {
              name: 'liste',
              in: 'query',
              description: 'Restreindre aux genres d’une liste précise',
              schema: { type: 'string', enum: [...LISTES] },
            },
          ],
          responses: {
            200: {
              description: 'Liste des genres',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { type: 'string', example: 'Jazz' },
                  },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
          },
        },
      },
      '/vinyles/{id}': {
        parameters: [{ $ref: '#/components/parameters/IdVinyle' }],
        get: {
          tags: ['Vinyles'],
          summary: 'Consulter un vinyle par son identifiant',
          responses: {
            200: {
              description: 'Fiche détaillée du vinyle',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Vinyle' },
                },
              },
            },
            404: { $ref: '#/components/responses/Introuvable' },
          },
        },
        put: {
          tags: ['Vinyles'],
          summary: 'Remplacer intégralement un vinyle',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VinyleCreation' },
              },
            },
          },
          responses: {
            200: {
              description: 'Vinyle mis à jour',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Vinyle' },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
            404: { $ref: '#/components/responses/Introuvable' },
          },
        },
        patch: {
          tags: ['Vinyles'],
          summary: 'Modifier partiellement un vinyle',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VinyleModificationPartielle' },
              },
            },
          },
          responses: {
            200: {
              description: 'Vinyle mis à jour partiellement',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Vinyle' },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
            404: { $ref: '#/components/responses/Introuvable' },
          },
        },
        delete: {
          tags: ['Vinyles'],
          summary: 'Supprimer un vinyle',
          responses: {
            204: { description: 'Vinyle supprimé' },
            404: { $ref: '#/components/responses/Introuvable' },
          },
        },
      },
      '/vinyles/{id}/transferer': {
        parameters: [{ $ref: '#/components/parameters/IdVinyle' }],
        post: {
          tags: ['Vinyles'],
          summary: 'Transférer un vinyle de la liste d’envies vers la collection',
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VinyleTransfert' },
              },
            },
          },
          responses: {
            200: {
              description: 'Vinyle transféré dans la collection',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Vinyle' },
                },
              },
            },
            400: { $ref: '#/components/responses/ValidationInvalide' },
            404: { $ref: '#/components/responses/Introuvable' },
            409: { $ref: '#/components/responses/Conflit' },
          },
        },
      },
    },
  };
}
