import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { User } from './types';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Load Auth Session & Theme Preferences
  useEffect(() => {
    const savedUser = localStorage.getItem('faceauth_user');
    const savedToken = localStorage.getItem('faceauth_token');
    const savedTheme = localStorage.getItem('faceauth_theme');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('faceauth_user');
        localStorage.removeItem('faceauth_token');
      }
    }

    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Update DOM dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('faceauth_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('faceauth_theme', 'light');
    }
  }, [darkMode]);

  const handleLoginSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('faceauth_user', JSON.stringify(authUser));
    localStorage.setItem('faceauth_token', authToken);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('faceauth_user');
    localStorage.removeItem('faceauth_token');
    setActivePage('home');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('faceauth_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage setActivePage={setActivePage} />
        )}

        {activePage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'dashboard' && user && token && (
          <DashboardPage
            user={user}
            token={token}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
          />
        )}

        {/* Fallback to login if dashboard accessed without session */}
        {activePage === 'dashboard' && (!user || !token) && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            setActivePage={setActivePage}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
