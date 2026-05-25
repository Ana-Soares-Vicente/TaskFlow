import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import '.././index.css'

function Login() {
  const navigate = useNavigate()
  const { setLogado } = useContext(AuthContext)

  function entrar() {
    setLogado(true)
    navigate('/login')
  }

  return (
    <div className='container-login'>
      <div className="container-login-content">
        <h2 className='container-login-title'>Kanban - Login</h2>
        <button onClick={entrar} className='container-login-button'>
          Entrar no Sistema
        </button>
      </div>
    </div>
  )
}

export default Login