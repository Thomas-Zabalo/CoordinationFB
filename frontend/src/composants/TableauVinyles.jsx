import { Link, useNavigate } from 'react-router';
import BadgeEtat from './BadgeEtat.jsx';

export default function TableauVinyles({ vinyles }) {
  const naviguer = useNavigate();

  return (
    <div className="tableau-defilant">
      <table>
        <thead>
          <tr>
            <th scope="col">Artiste</th>
            <th scope="col">Titre</th>
            <th scope="col">Année</th>
            <th scope="col">Format</th>
            <th scope="col">N° de catalogue</th>
            <th scope="col">Disque</th>
            <th scope="col">Pochette</th>
          </tr>
        </thead>
        <tbody>
          {vinyles.map((vinyle) => (
            <tr key={vinyle.id} onClick={() => naviguer(`/vinyles/${vinyle.id}`)}>
              <td>{vinyle.artiste}</td>
              <td>
                <Link to={`/vinyles/${vinyle.id}`} onClick={(evenement) => evenement.stopPropagation()}>
                  {vinyle.titre}
                </Link>
              </td>
              <td>{vinyle.annee ?? '—'}</td>
              <td>{[vinyle.format, vinyle.taille].filter(Boolean).join(' ') || '—'}</td>
              <td>{vinyle.numeroCatalogue ?? '—'}</td>
              <td>
                <BadgeEtat code={vinyle.etatDisque} />
              </td>
              <td>
                <BadgeEtat code={vinyle.etatPochette} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
