import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Projetos from './pages/Projetos';
import ProjetoDetalhe from './pages/ProjetoDetalhe';
import Layout from './components/layout/layout/layout';

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

export default App
