import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Projetos from './pages/Projetos/Projetos';
import ProjetoDetalhe from './pages/ProjetoDetalhe/ProjetoDetalhe';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="projeto/:id" element={<ProjetoDetalhe />} />
      </Route>
    </Routes>
  );
}

export default App;
