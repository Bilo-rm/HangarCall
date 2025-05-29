import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Restaurant {
  id: string;
  name: string;
  location: string;
  suspended: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "restaurant" | "user";
  restaurant?: Restaurant; // Optional restaurant data
}

interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  // Helper functions to easily access restaurant data
  getRestaurantId: () => string | null;
  isRestaurantOwner: () => boolean;
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
        console.log("Getting user from AsyncStorage:", userData);
        
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
    try {
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      console.log("Storing user data:", JSON.stringify(userData)); // Debug log
      
      setAuthToken(token);
      setUser(userData);
      setAuthenticated(true);
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
      setAuthToken(null);
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Helper function to get restaurant ID
  const getRestaurantId = (): string | null => {
    return user?.restaurant?.id || null;
  };

  // Helper function to check if user is a restaurant owner
  const isRestaurantOwner = (): boolean => {
    return user?.role === "restaurant" && !!user?.restaurant;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        authToken, 
        user, 
        isLoading, 
        login, 
        logout,
        getRestaurantId,
        isRestaurantOwner
      }}
    >
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