import React, { createContext, useContext, useState } from "react";
import type { RegisterData, User, UserRole } from "../types";
import { authApi } from "../api/auth.api";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("gharproof_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("gharproof_token") || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.setItem("gharproof_token", res.accessToken);
      localStorage.setItem("gharproof_user", JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      // Backend registration response no longer includes accessToken, so automatically log in to acquire session
      const loginRes = await authApi.login({ email: data.email, password: data.password });
      setUser(loginRes.user);
      setToken(loginRes.accessToken);
      localStorage.setItem("gharproof_token", loginRes.accessToken);
      localStorage.setItem("gharproof_user", JSON.stringify(loginRes.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // storage access blocked
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || "landlord",
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
