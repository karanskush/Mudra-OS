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
    // Don't allow closing modals for protected routes - user must authenticate
    // setLoginModalOpen(false);
    // setRegisterModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      {/* Background content to show user they need to authenticate */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">Authentication Required</h1>
          <p className="text-xl">Please login to access this feature</p>
        </div>
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