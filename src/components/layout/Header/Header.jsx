import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import './Header.css';

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="container-header">
      <Link to="/" className="logo">
        TaskFlow
      </Link>

      <nav className="container-nav">
        <Link to="/projetos" className="nav-link">
          Projetos
        </Link>
      </nav>

      <div className="container-header-actions">
        <button className="btn-theme" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>

        {user ? (
          <>
            <span className="user-name">Olá, {user.name}</span>
            <button className="btn-logout" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
