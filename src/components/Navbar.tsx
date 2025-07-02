import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Code, Database, Shield, TrendingUp, Activity, Calculator } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ui/theme-toggle';
import { useTheme } from '../contexts/ThemeContext';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDark } = useTheme();
  const location = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Platform', href: '/', icon: Database },
    { name: 'APIs', href: '/', icon: Code },
    { name: 'Security', href: '/', icon: Shield },
    { name: 'Analytics', href: '/', icon: TrendingUp },
    { name: 'Status', href: '/status', icon: Activity },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname === href;
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setLoginModalOpen(false);
  };

  const handleRegisterSuccess = (userData: any) => {
    setUser(userData);
    setRegisterModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? isDark 
            ? 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-700' 
            : 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : isDark 
            ? 'bg-slate-900/80' 
            : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Zap className={`h-8 w-8 transition-colors duration-300 ${
                  isScrolled 
                    ? isDark ? 'text-blue-400' : 'text-blue-600'
                    : isDark ? 'text-white' : 'text-blue-600'
                }`} />
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  isScrolled 
                    ? isDark ? 'text-white' : 'text-gray-900'
                    : isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Fintech OS
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium transition-colors duration-300 ${
                  isScrolled 
                    ? isDark 
                      ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' 
                      : 'bg-blue-100 text-blue-800'
                    : isDark ? 'bg-white/20 text-white/90 backdrop-blur-sm' : 'bg-blue-100 text-blue-800'
                }`}>
                  Platform
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? isDark 
                        ? 'text-gray-300 hover:text-blue-400' 
                        : 'text-gray-700 hover:text-blue-600'
                      : isDark ? 'text-white/90 hover:text-white' : 'text-gray-900 hover:text-blue-600'
                  } ${isActive(item.href) ? 'text-blue-400' : ''}`}
                >
                  <item.icon className={`h-4 w-4 ${isScrolled ? (isDark ? 'text-gray-300' : 'text-gray-700') : (isDark ? 'text-white/90' : 'text-gray-900')}`} />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <a
                href="#docs"
                className={`text-sm font-medium transition-colors duration-300 ${
                  isScrolled 
                    ? isDark 
                      ? 'text-gray-300 hover:text-blue-400' 
                      : 'text-gray-700 hover:text-blue-600'
                    : isDark ? 'text-white/90 hover:text-white' : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                Documentation
              </a>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    isScrolled 
                      ? isDark ? 'text-gray-300' : 'text-gray-700'
                      : isDark ? 'text-white/90' : 'text-gray-900'
                  }`}>
                    Welcome, {user.first_name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openLoginModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={toggleMenu}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  isScrolled 
                    ? isDark 
                      ? 'text-gray-300 hover:bg-slate-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                    : isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className={`md:hidden border-t shadow-lg rounded-b-xl ${
              isDark 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 text-base font-medium transition-colors duration-300 p-2 rounded-lg w-full text-left ${
                      isDark 
                        ? 'text-gray-300 hover:text-blue-400 hover:bg-slate-800' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    } ${isActive(item.href) ? 'text-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <div className={`pt-4 border-t space-y-4 ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <a
                    href="#docs"
                    className={`block text-base font-medium transition-colors duration-300 p-2 ${
                      isDark 
                        ? 'text-gray-300 hover:text-blue-400' 
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Documentation
                  </a>
                  {user ? (
                    <div className="space-y-2">
                      <div className={`text-sm p-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Welcome, {user.first_name}
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-300"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          openLoginModal();
                          setIsOpen(false);
                        }}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      <LoginForm
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onRegisterClick={openRegisterModal}
      />

      {/* Registration Modal */}
      <RegistrationForm
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </>
  );
};

export default Navbar;