import { Link } from 'react-router-dom';

function statusLabel(status) {
  if (status === 'inactivo') return 'Inactivo';
  if (status === 'en_riesgo') return 'En riesgo';
  return 'Activo';
}

function UsersTable({ users }) {
  return (
    <div className="table-card">
      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Frecuencia semanal</th>
            <th>Última actividad</th>
            <th>Estado adherencia</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.frequencyWeekly ?? '—'}</td>
              <td>{user.lastWorkoutDate ? new Date(user.lastWorkoutDate).toLocaleDateString('es-CL') : '—'}</td>
              <td>
                <span className={`status-badge ${user.adherenceStatus}`}>{statusLabel(user.adherenceStatus)}</span>
              </td>
              <td>
                <Link className="link-button" to={`/users/${user.id}`}>
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
          {!users.length ? (
            <tr>
              <td colSpan={6} className="empty-state">
                No hay alumnos asignados.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
