import { useCallback, useEffect, useState } from 'react';
import UsersTable from '../components/tables/UsersTable';
import { assignClientByEmail, getTrainerClients } from '../services/trainerService';
import { getUsersAtRisk, getUsersRanking, mergeClientsWithMetrics } from '../services/usersService';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState('');
  const [assignError, setAssignError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [clients, atRisk, ranking] = await Promise.all([getTrainerClients(), getUsersAtRisk(), getUsersRanking()]);
      setUsers(mergeClientsWithMetrics(clients, atRisk, ranking));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'No fue posible cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAssign = async (event) => {
    event.preventDefault();
    const email = assignEmail.trim().toLowerCase();
    if (!email) return;
    setAssignBusy(true);
    setAssignError('');
    setAssignFeedback('');
    try {
      await assignClientByEmail(email);
      setAssignEmail('');
      setAssignFeedback('Alumno asignado correctamente. Ya puede usar COACH en la app.');
      await loadUsers();
    } catch (assignErr) {
      setAssignError(assignErr.response?.data?.message || assignErr.message || 'No se pudo asignar');
    } finally {
      setAssignBusy(false);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <h2>Usuarios</h2>
        <p>Seguimiento individual de alumnos asignados.</p>
      </div>

      <article className="detail-card users-assign-card">
        <h3>Asignar alumno</h3>
        <p className="muted">
          Introduce el correo de una cuenta con rol <strong>usuario</strong> (la misma con la que inicia sesión en la app). El alumno verá el COACH en la app en cuanto exista la asignación.
        </p>
        <form className="users-assign-form" onSubmit={handleAssign}>
          <label htmlFor="assign-email">Correo del alumno</label>
          <input
            id="assign-email"
            type="email"
            autoComplete="email"
            placeholder="alumno@ejemplo.com"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            disabled={assignBusy}
          />
          <button type="submit" className="assign-submit" disabled={assignBusy || !assignEmail.trim()}>
            {assignBusy ? 'Asignando…' : 'Asignar a mi cuenta'}
          </button>
        </form>
        {assignError ? <p className="form-error">{assignError}</p> : null}
        {assignFeedback ? <p className="assign-success">{assignFeedback}</p> : null}
      </article>

      {loading ? <div className="page-loader">Cargando usuarios...</div> : null}
      {error ? <div className="error-panel">{error}</div> : null}
      {!loading && !error ? <UsersTable users={users} /> : null}
    </section>
  );
}

export default Users;
