import { useEffect, useMemo, useState } from 'react';
import { getTrainerClients } from '../services/trainerService';
import { getUsersAtRisk, getUsersRanking, mergeClientsWithMetrics } from '../services/usersService';

function Adherence() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clients, atRisk, ranking] = await Promise.all([getTrainerClients(), getUsersAtRisk(), getUsersRanking()]);
        setUsers(mergeClientsWithMetrics(clients, atRisk, ranking));
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'No fue posible cargar adherencia');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(
    () => ({
      activo: users.filter((user) => user.adherenceStatus === 'activo'),
      en_riesgo: users.filter((user) => user.adherenceStatus === 'en_riesgo'),
      inactivo: users.filter((user) => user.adherenceStatus === 'inactivo'),
    }),
    [users]
  );

  if (loading) return <section className="page-loader">Cargando adherencia...</section>;
  if (error) return <section className="error-panel">{error}</section>;

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Módulo de adherencia</h2>
        <p>Clasificación por riesgo e inactividad.</p>
      </div>
      <div className="detail-grid">
        {[
          ['activo', 'Activos'],
          ['en_riesgo', 'En riesgo'],
          ['inactivo', 'Inactivos'],
        ].map(([key, title]) => (
          <article key={key} className="detail-card">
            <h3>{title}</h3>
            {!grouped[key].length ? <p className="muted">Sin usuarios en esta categoría.</p> : null}
            <ul className="status-list">
              {grouped[key].map((user) => (
                <li key={user.id}>
                  <div>
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                  <span>{user.daysWithoutTraining ?? 0} días</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Adherence;
