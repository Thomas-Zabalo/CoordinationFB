import { createContext, useContext } from 'react';

export const contexteAuthentification = createContext(null);

export function useAuthentification() {
  const contexte = useContext(contexteAuthentification);
  if (!contexte) throw new Error('useAuthentification doit être utilisé dans FournisseurAuthentification');
  return contexte;
}
