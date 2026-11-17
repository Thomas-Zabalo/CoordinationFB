import { afterEach, describe, expect, it, vi } from 'vitest';
import { creerVinyle, ErreurApi, listerVinyles, supprimerVinyle } from './vinyles.js';

function reponseJson(statut, corps) {
  return Promise.resolve(new Response(JSON.stringify(corps), { status: statut }));
}

describe('client API des vinyles', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("n'envoie que les filtres renseignés", async () => {
    const fetchSimule = vi.fn(() => reponseJson(200, []));
    vi.stubGlobal('fetch', fetchSimule);

    await listerVinyles({ liste: 'envies', q: 'miles davis', genre: '', format: null });

    expect(fetchSimule.mock.calls[0][0]).toBe('http://localhost:3000/vinyles?liste=envies&q=miles+davis');
  });

  it('envoie le vinyle en JSON lors de la création', async () => {
    const fetchSimule = vi.fn(() => reponseJson(201, { id: 1, titre: 'Abbey Road' }));
    vi.stubGlobal('fetch', fetchSimule);

    const vinyle = await creerVinyle({ artiste: 'The Beatles', titre: 'Abbey Road' });

    const [, options] = fetchSimule.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ artiste: 'The Beatles', titre: 'Abbey Road' });
    expect(vinyle.id).toBe(1);
  });

  it("transforme une réponse d'erreur en ErreurApi avec les détails par champ", async () => {
    vi.stubGlobal('fetch', () =>
      reponseJson(400, { erreur: { message: 'Certains champs sont invalides', details: { titre: 'Champ obligatoire' } } }),
    );

    const erreur = await creerVinyle({}).catch((e) => e);

    expect(erreur).toBeInstanceOf(ErreurApi);
    expect(erreur.statut).toBe(400);
    expect(erreur.details).toEqual({ titre: 'Champ obligatoire' });
  });

  it('signale clairement un serveur injoignable', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')));

    await expect(listerVinyles()).rejects.toThrow("Impossible de joindre le serveur");
  });

  it('accepte une réponse vide après une suppression', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve(new Response(null, { status: 204 })));

    await expect(supprimerVinyle(1)).resolves.toBeNull();
  });
});
