import { useState } from "react";

const initialUser = {
  name: "Usuário",
};

export function useAuth() {
  const [user, setUser] = useState(initialUser);

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    logout,
  };
}
