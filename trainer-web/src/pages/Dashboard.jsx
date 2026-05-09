import { useEffect, useState } from 'react';
import StatCard from '../components/cards/StatCard';
import { getTrainerClients } from '../services/trainerService';
import { getDashboardTotals, getUsersAtRisk, getUsersRanking, mergeClientsWithMetrics } from '../services/usersService';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totals, setTotals] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    avgAdherence: 0,
    weeklySessions: null,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [clients, atRisk, ranking] = await Promise.all([getTrainerClients(), getUsersAtRisk(), getUsersRanking()]);
        const enriched = mergeClientsWithMetrics(clients, atRisk, ranking);
        setTotals(getDashboardTotals(enriched));
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'No fue posible cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return <section className="page-loader">Cargando dashboard...</section>;
  }

  if (error) {
    return <section className="error-panel">{error}</section>;
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Dashboard general</h2>
        <p>Visión consolidada de tus alumnos asignados.</p>
      </div>
      <div className="stats-grid">
        <StatCard title="Total usuarios" value={totals.totalUsers} hint="Alumnos asignados" tone="blue" />
        <StatCard title="Usuarios activos" value={totals.activeUsers} hint="Actividad estable" tone="green" />
        <StatCard title="Usuarios inactivos" value={totals.inactiveUsers} hint="Requieren seguimiento" tone="gray" />
        <StatCard title="Adherencia promedio" value={`${totals.avgAdherence}%`} hint="Según ranking global API" tone="sky" />
        <StatCard
          title="Entrenamientos semanales"
          value={totals.weeklySessions ?? 'N/D'}
          hint={totals.weeklySessions == null ? 'Requiere endpoint trainer por usuario' : 'Estimación por adherencia'}
          tone="blue"
        />
      </div>
    </section>
  );
}

export default Dashboard;
