import { useEffect, useMemo, useState } from 'react';
import ProgressChart from '../components/charts/ProgressChart';
import { getTrainerClients } from '../services/trainerService';
import { getUserWeeklyHistory, getUsersAtRisk, getUsersRanking, mergeClientsWithMetrics } from '../services/usersService';

function Progress() {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clients, atRisk, ranking] = await Promise.all([getTrainerClients(), getUsersAtRisk(), getUsersRanking()]);
        const enriched = mergeClientsWithMetrics(clients, atRisk, ranking);
        setUsers(enriched);
        if (enriched.length) {
          setSelectedId(String(enriched[0].id));
        }
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'No fue posible cargar progreso');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedUser = useMemo(() => users.find((user) => String(user.id) === selectedId), [users, selectedId]);
  const history = selectedUser ? getUserWeeklyHistory(selectedUser.id) : [];
  const componentsChart = selectedUser?.components
    ? [
        { week: 'Adherencia', volume: selectedUser.components.adherence },
        { week: 'Actividad', volume: selectedUser.components.activity },
        { week: 'Consistencia', volume: selectedUser.components.consistency },
      ]
    : [];

  if (loading) return <section className="page-loader">Cargando progreso...</section>;
  if (error) return <section className="error-panel">{error}</section>;

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Módulo de progreso</h2>
        <p>Evolución semanal y métricas de desempeño.</p>
      </div>
      <div className="filter-row">
        <label htmlFor="user-select">Alumno</label>
        <select id="user-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div className="detail-grid">
        <article className="detail-card">
          <h3>Evolución semanal (volumen)</h3>
          <ProgressChart data={history} metricKey="volume" />
        </article>
        <article className="detail-card">
          <h3>Métricas globales</h3>
          <ProgressChart data={componentsChart} metricKey="volume" />
          {!history.length ? <p className="muted">Las metricas se calcularan una vez que el alumno inicie su programa.</p> : null}
        </article>
      </div>
    </section>
  );
}

export default Progress;
