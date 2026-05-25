import { createContext, useState } from 'react'

export const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [logado, setLogado] = useState(false)

  return (
    <AuthContext.Provider value={{ logado, setLogado }}>
      {children}
    </AuthContext.Provider>
  )
}