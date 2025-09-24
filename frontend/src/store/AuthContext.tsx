import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";

export interface User {
  name: string;
  email: string;
  role: string;
  publicId: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Gọi /me để lấy thông tin user
  const refreshUser = async () => {
    try {
      const response = await api.get("/users/me", { withCredentials: true });
      // response.data.data chứa UserDTO từ backend
      setUser(response.data.data as User);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser(); // Chỉ gọi 1 lần khi app mount
  }, []);

  // Logout: gọi API backend xóa cookie và reset state
  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!user, user, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook dùng trong component
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
