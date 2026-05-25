import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RotaProtegida({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default RotaProtegida;
