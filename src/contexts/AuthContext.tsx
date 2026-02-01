import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await api.get('/me'); 
      setUser(res.data);
    } catch (error) {
      console.error('Failed to refresh user');
      logout();
    } finally {
      setLoading(false);
    }
  }


  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string
  ) => {
    setLoading(true);
    try {
      await api.post("/signup", {
        name: fullName,
        email,
        password,
        phone: phoneNumber,
      });

      return { error: null };
    } catch (error: any) {
      console.error("Signup failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/signin", { email, password });

      const { token, user } = res.data;

      // Store token
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);

      return user;
    } catch (error: any) {
      console.error("Signin failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };


   const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
