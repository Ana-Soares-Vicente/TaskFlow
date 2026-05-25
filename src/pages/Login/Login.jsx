import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  function entrar() {
    login({ name: 'Usuário' });
    navigate('/');
  }

  return (
    <div className="container-login">
      <div className="container-login-content">
        <h2 className="container-login-title">TaskFlow - Login</h2>
        <button onClick={entrar} className="container-login-button">
          Entrar no Sistema
        </button>
      </div>
    </div>
  );
}

export default Login;
