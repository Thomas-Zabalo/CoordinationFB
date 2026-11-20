import { afterEach, describe, expect, it, vi } from 'vitest';
import { connecter, deconnecter, inscrire, obtenirUtilisateur } from './auth.js';

describe('client API d’authentification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('inscrit un utilisateur en envoyant les données et les cookies de session', async () => {
    const utilisateur = { id: 1, nom: 'Alex', email: 'alex@example.com' };
    const fetchSimule = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ utilisateur }), { status: 201 })),
    );
    vi.stubGlobal('fetch', fetchSimule);

    await expect(inscrire({ email: 'alex@example.com', nom: 'Alex', motDePasse: 'secret123' })).resolves.toEqual(
      utilisateur,
    );

    const [url, options] = fetchSimule.mock.calls[0];
    expect(url).toBe('/api/auth/inscription');
    expect(options.method).toBe('POST');
    expect(options.credentials).toBe('include');
    expect(JSON.parse(options.body)).toEqual({ email: 'alex@example.com', nom: 'Alex', motDePasse: 'secret123' });
  });

  it('connecte un utilisateur sur la route dédiée', async () => {
    const utilisateur = { id: 1, nom: 'Alex', email: 'alex@example.com' };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ utilisateur }), { status: 200 }))),
    );

    await expect(connecter({ email: 'alex@example.com', motDePasse: 'secret123' })).resolves.toEqual(utilisateur);
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/connexion',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('récupère la session courante et permet la déconnexion', async () => {
    const utilisateur = { id: 1, nom: 'Alex', email: 'alex@example.com' };
    const fetchSimule = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ utilisateur }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchSimule);

    await expect(obtenirUtilisateur()).resolves.toEqual(utilisateur);
    await expect(deconnecter()).resolves.toBeNull();

    expect(fetchSimule.mock.calls[0][0]).toBe('/api/auth/moi');
    expect(fetchSimule.mock.calls[0][1].credentials).toBe('include');
    expect(fetchSimule.mock.calls[1][0]).toBe('/api/auth/deconnexion');
    expect(fetchSimule.mock.calls[1][1]).toMatchObject({ method: 'POST', credentials: 'include' });
  });
});
