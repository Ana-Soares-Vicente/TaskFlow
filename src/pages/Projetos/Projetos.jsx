import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projetosService } from '../../services/storage';
import './Projetos.css';

function Projetos() {
  // Lista de projetos carregada do localStorage
  const [projetos, setProjetos] = useState([]);
  // Controla o input de novo projeto
  const [novoProjeto, setNovoProjeto] = useState('');
  // Controla se o formulário está visível
  const [mostrarForm, setMostrarForm] = useState(false);

  // Carrega projetos ao montar o componente
  useEffect(() => {
    setProjetos(projetosService.listar());
  }, []);

  // Cria um novo projeto
  function handleCriar(e) {
    e.preventDefault();
    if (!novoProjeto.trim()) return;

    const projeto = projetosService.criar(novoProjeto.trim());
    setProjetos([...projetos, projeto]);
    setNovoProjeto('');
    setMostrarForm(false);
  }

  // Remove um projeto
  function handleRemover(id) {
    if (!confirm('Tem certeza que deseja remover este projeto e todas suas tarefas?')) return;
    projetosService.remover(id);
    setProjetos(projetos.filter((p) => p.id !== id));
  }

  return (
    <div className="container-projetos">
      <div className="projetos-header">
        <h1>Projetos</h1>
        <button
          className="btn-novo-projeto"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Projeto'}
        </button>
      </div>

      {/* Formulário para criar projeto */}
      {mostrarForm && (
        <form onSubmit={handleCriar} className="form-novo-projeto">
          <input
            type="text"
            placeholder="Nome do projeto..."
            value={novoProjeto}
            onChange={(e) => setNovoProjeto(e.target.value)}
            autoFocus
            className="input-novo-projeto"
          />
          <button type="submit" className="btn-criar">
            Criar
          </button>
        </form>
      )}

      {/* Lista de projetos */}
      {projetos.length === 0 ? (
        <div className="projetos-vazio">
          <p>Nenhum projeto criado ainda.</p>
          <p>Clique em "+ Novo Projeto" para começar!</p>
        </div>
      ) : (
        <div className="projetos-lista">
          {projetos.map((projeto) => (
            <div key={projeto.id} className="projeto-card">
              <Link to={`/projeto/${projeto.id}`} className="projeto-card-link">
                <h3>{projeto.nome}</h3>
                <span className="projeto-data">
                  Criado em {new Date(projeto.criadoEm).toLocaleDateString('pt-BR')}
                </span>
              </Link>
              <button
                className="btn-remover-projeto"
                onClick={() => handleRemover(projeto.id)}
                title="Remover projeto"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projetos;
