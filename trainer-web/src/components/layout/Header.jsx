import { useAuth } from '../../context/AuthContext';

function Header({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <button className="menu-button" onClick={onMenuClick} aria-label="Abrir menú">
        ☰
      </button>
      <div>
        <h1>Panel del entrenador</h1>
        <p>Monitoreo de adherencia y progreso de alumnos</p>
      </div>
      <div className="header-actions">
        <span className="trainer-pill">{user?.name || 'Entrenador'}</span>
        <button onClick={logout} className="logout-button">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Header;
