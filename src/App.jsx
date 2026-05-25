import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Projetos from './pages/Projetos/Projetos';
import ProjetoDetalhe from './pages/ProjetoDetalhe/ProjetoDetalhe';
import RotaProtegida from './components/RotaProtegida';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="projetos"
          element={
            <RotaProtegida>
              <Projetos />
            </RotaProtegida>
          }
        />
        <Route
          path="projeto/:id"
          element={
            <RotaProtegida>
              <ProjetoDetalhe />
            </RotaProtegida>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
