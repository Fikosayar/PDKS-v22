import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth/AuthContext';
import LoginPage from './pages/LoginPage';
import App from './App'; // We will use App.tsx as the main dashboard for now to avoid breaking existing features immediately

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
        />
        
        <Route 
          path="/*" 
          element={isAuthenticated ? <App /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
