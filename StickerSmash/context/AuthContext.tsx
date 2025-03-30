import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true); 

  useEffect(() => {
    const loadAuthState = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userData = await AsyncStorage.getItem("user");

        if (token && userData) {
          setAuthToken(token);
          setUser(JSON.parse(userData));
          setAuthenticated(true);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (token: string, userData: User) => {
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
    setAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
    setAuthToken(null);
    setUser(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authToken, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
