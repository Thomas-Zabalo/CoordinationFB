import { Link, useNavigate } from 'react-router';
import BadgeEtat from './BadgeEtat.jsx';

export default function TableauVinyles({ vinyles }) {
  const naviguer = useNavigate();

  return (
    <div className="overflow-x-auto rounded-lg border border-ligne bg-carte shadow-2xs">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-ligne bg-papier font-mono text-[11px] uppercase tracking-widest text-encre-douce">
            <th scope="col" className="px-4 py-3 font-medium">
              Artiste
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Titre
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Année
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Format
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              N° de catalogue
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Média
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Pochette
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ligne text-sm">
          {vinyles.map((vinyle) => (
            <tr
              key={vinyle.id}
              onClick={() => naviguer(`/vinyles/${vinyle.id}`)}
              className="cursor-pointer transition-colors hover:bg-papier/75"
            >
              <td className="whitespace-nowrap px-4 py-3.5 text-encre-douce">{vinyle.artiste || '—'}</td>
              <td className="whitespace-nowrap px-4 py-3.5">
                <Link
                  to={`/vinyles/${vinyle.id}`}
                  onClick={(evenement) => evenement.stopPropagation()}
                  className="font-serif font-bold text-encre no-underline transition-colors hover:text-terre hover:underline"
                >
                  {vinyle.titre || 'Sans titre'}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-encre-douce">
                {vinyle.annee ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-encre">
                {[vinyle.format, vinyle.taille].filter(Boolean).join(' ') || '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-encre">
                {vinyle.numeroCatalogue ?? '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3.5">
                <BadgeEtat code={vinyle.etatDisque} />
              </td>
              <td className="whitespace-nowrap px-4 py-3.5">
                <BadgeEtat code={vinyle.etatPochette} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
