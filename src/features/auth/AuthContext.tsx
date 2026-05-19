import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { useProfile } from '../../api/hooks';

interface AuthContextType {
  user: { uid: string } | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  role: string | null;
  login: (userData: { uid: string }, customToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<{ uid: string } | null>(() => {
    const savedUser = localStorage.getItem('pdks_user');
    const token = localStorage.getItem('pdks_token');
    return (savedUser && token) ? JSON.parse(savedUser) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Hook for getting profile data if we are authenticated
  const { data: qProfile, refetch } = useProfile();

  useEffect(() => {
    const savedUser = localStorage.getItem('pdks_user');
    const token = localStorage.getItem('pdks_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (qProfile) {
      setProfile(qProfile);
    }
  }, [qProfile]);

  const login = (userData: { uid: string }, token: string) => {
    localStorage.setItem('pdks_user', JSON.stringify(userData));
    localStorage.setItem('pdks_token', token);
    setUser(userData);
    refetch(); // Fetch fresh profile after login
  };

  const logout = () => {
    localStorage.removeItem('pdks_user');
    localStorage.removeItem('pdks_token');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        role: profile?.role || null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
