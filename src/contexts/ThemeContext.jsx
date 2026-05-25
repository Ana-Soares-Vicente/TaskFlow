import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// Aplica o tema salvo imediatamente para evitar flash
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(savedTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;