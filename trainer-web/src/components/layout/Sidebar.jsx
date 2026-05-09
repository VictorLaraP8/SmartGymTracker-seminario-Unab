import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Usuarios' },
  { to: '/adherence', label: 'Adherencia' },
  { to: '/progress', label: 'Progreso' },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-dot" />
          <div>
            <p>SmartGym</p>
            <small>Trainer SaaS</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="sidebar-link" onClick={onClose}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {isOpen ? <button className="sidebar-backdrop" onClick={onClose} aria-label="Cerrar menú" /> : null}
    </>
  );
}

export default Sidebar;
