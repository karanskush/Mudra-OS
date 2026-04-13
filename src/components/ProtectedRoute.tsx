import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Show notification when user tries to access protected content
  useEffect(() => {
    if (!user && !loginModalOpen && !registerModalOpen) {
      toast('Please login to access this feature', {
        icon: '🔐',
        duration: 3000,
      });
      setLoginModalOpen(true);
    }
  }, [user, loginModalOpen, registerModalOpen]);

  // If user is authenticated, render the protected content
  if (user) {
    return <>{children}</>;
  }

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
  };

  const handleRegisterSuccess = () => {
    setRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };

  const openLoginModal = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  const handleClose = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Dimmed placeholder so the page isn't blank */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 select-none pointer-events-none">
        <div className="text-6xl opacity-10">🔐</div>
        <p className="text-slate-600 text-lg opacity-20">Authentication required</p>
      </div>

      <LoginForm
        isOpen={loginModalOpen}
        onClose={handleClose}
        onSuccess={handleLoginSuccess}
        onRegisterClick={openRegisterModal}
      />

      <RegistrationForm
        isOpen={registerModalOpen}
        onClose={handleClose}
        onSuccess={handleRegisterSuccess}
        onLoginClick={openLoginModal}
      />
    </div>
  );
};

export default ProtectedRoute; 