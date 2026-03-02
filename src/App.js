import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import {Spinner} from "@heroui/spinner";
import { useAuth } from './hooks/useAuth';
import QRGenerator from './components/QRGenerator';
import QRScanner from './components/QRScanner';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';

function App() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <HeroUIProvider>
      <Router>
        <div className="min-h-screen bg-[var(--bg-page)]">
          <Navbar onLoginClick={() => setAuthModalOpen(true)} />
          <div className="container mx-auto py-8 px-4 max-w-6xl">
            <Routes>
              <Route path="/" element={<QRGenerator user={user} />} />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard /> : <Navigate to="/" />} 
              />
              <Route path="/scan/:qrId" element={<QRScanner />} />
            </Routes>
          </div>
          <AuthModal 
            isOpen={authModalOpen} 
            onClose={() => setAuthModalOpen(false)} 
          />
        </div>
      </Router>
    </HeroUIProvider>
  );
}

export default App;