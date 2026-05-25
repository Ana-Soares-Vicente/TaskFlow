import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Ao carregar, verifica se já tem um usuário salvo no localStorage
  const [user, setUser] = useState(() => {
    const salvo = localStorage.getItem('taskflow_usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  // Cadastrar novo usuário
  function register(nome, email, senha) {
    const usuarios = JSON.parse(localStorage.getItem('taskflow_usuarios') || '[]');

    const jaExiste = usuarios.find((u) => u.email === email);
    if (jaExiste) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const novoUsuario = { nome, email, senha };
    usuarios.push(novoUsuario);
    localStorage.setItem('taskflow_usuarios', JSON.stringify(usuarios));
  }

  // Fazer login
  function login(email, senha) {
    const usuarios = JSON.parse(localStorage.getItem('taskflow_usuarios') || '[]');

    const encontrado = usuarios.find(
      (u) => u.email === email && u.senha === senha
    );

    if (!encontrado) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const dadosUsuario = { nome: encontrado.nome, email: encontrado.email };
    setUser(dadosUsuario);
    localStorage.setItem('taskflow_usuario', JSON.stringify(dadosUsuario));
  }

  // Fazer logout
  function logout() {
    setUser(null);
    localStorage.removeItem('taskflow_usuario');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
