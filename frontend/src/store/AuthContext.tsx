import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";

export interface User {
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  gender?: string;
  publicId: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isChecking: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const roleMap: Record<number, string> = {
    1: "CUSTOMER",
    2: "ADMIN",
    5: "STAFF",
  };

  // Gọi /me để lấy thông tin user
  const refreshUser = async () => {
    setIsChecking(true);
    try {
      const response = await api.get("/users/me", { withCredentials: true });
      const userData = response.data.data;

      const mappedUser: User = {
        name: userData.name,
        email: userData.email,
        publicId: userData.publicId,
        phone: userData.phone || undefined,
        address: userData.address || undefined,
        gender: userData.gender || undefined,
        avatarUrl: userData.avatarUrl || undefined,
        role: roleMap[userData.roleId] || "CUSTOMER",
      };

      console.log("Mapped user:", mappedUser);
      setUser(mappedUser);
      return mappedUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    void refreshUser(); // Chỉ gọi 1 lần khi app mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      value={{ isLoggedIn: !!user, isChecking, user, refreshUser, logout }}>
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
