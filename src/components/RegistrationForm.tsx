import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Calendar, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:47291';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
  onLoginClick: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ isOpen, onClose, onSuccess, onLoginClick }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phone: '', dateOfBirth: '',
  });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validate = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    const loadingToast = toast.loading('Creating your account…');

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:         formData.email,
          password:      formData.password,
          first_name:    formData.firstName,
          last_name:     formData.lastName,
          phone:         formData.phone,
          date_of_birth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        }),
      });
      const data = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) throw new Error(data.message || 'Registration failed');

      const userData = data.data;
      const token    = userData.token;
      if (!token || !userData) throw new Error('Invalid response format');

      const actualUser     = userData.user || userData;
      const userForContext = {
        id:        actualUser.id,
        email:     actualUser.email,
        firstName: actualUser.first_name,
        lastName:  actualUser.last_name,
        role:      actualUser.role,
      };

      register(userForContext, token);
      toast.success(`Welcome to MudraCore OS, ${userForContext.firstName || 'User'}!`);
      onSuccess(userData);
      onClose();
      setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', dateOfBirth: '' });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const msg = err.message || 'Registration failed. Please try again.';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1100] p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(6,9,8,0.80)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative glass-modal rounded-3xl w-full max-w-lg mx-auto my-8 overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 btn-ghost p-2 rounded-full z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center pt-10 pb-6 px-8">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center glow-green" style={{ background: 'linear-gradient(135deg, #2E6F40, #68BA7F)' }}>
                <User className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-fluid-xl font-bold text-white mb-1">Create Account</h2>
              <p className="text-slate-400 text-sm">Join MudraCore OS and start your journey</p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="First Name *" icon={<User className="h-4 w-4" />}>
                    <input
                      type="text" name="firstName" value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-field pl-11" placeholder="First name" required autoComplete="given-name"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Last Name *" icon={<User className="h-4 w-4" />}>
                    <input
                      type="text" name="lastName" value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-field pl-11" placeholder="Last name" required autoComplete="family-name"
                    />
                  </FieldWrapper>
                </div>

                {/* Email */}
                <FieldWrapper label="Email Address *" icon={<Mail className="h-4 w-4" />}>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleInputChange}
                    className="input-field pl-11" placeholder="you@example.com" required autoComplete="email"
                  />
                </FieldWrapper>

                {/* Passwords row */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="Password *" icon={<Lock className="h-4 w-4" />}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password}
                      onChange={handleInputChange}
                      className="input-field pl-11 pr-12" placeholder="Min 8 chars" required autoComplete="new-password"
                    />
                    <ToggleEye show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                  </FieldWrapper>
                  <FieldWrapper label="Confirm *" icon={<Lock className="h-4 w-4" />}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input-field pl-11 pr-12" placeholder="Repeat" required autoComplete="new-password"
                    />
                    <ToggleEye show={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
                  </FieldWrapper>
                </div>

                {/* Optional row */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="Phone" icon={<Phone className="h-4 w-4" />}>
                    <input
                      type="tel" name="phone" value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field pl-11" placeholder="+1 555 000 0000" autoComplete="tel"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Date of Birth" icon={<Calendar className="h-4 w-4" />}>
                    <input
                      type="date" name="dateOfBirth" value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="input-field pl-11" autoComplete="bday"
                    />
                  </FieldWrapper>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-1"
                  style={{ background: loading ? undefined : 'linear-gradient(to right, #059669, #0d9488)' }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                      </svg>
                      Creating account…
                    </span>
                  ) : 'Create Account'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="text-slate-500 text-xs">or sign up with</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                {/* Social */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Google', svg: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )},
                    { label: 'Facebook', svg: (
                      <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )},
                    { label: 'Apple', svg: (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    )},
                  ].map(({ label, svg }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={`Sign up with ${label}`}
                      className="flex items-center justify-center p-3 glass-card rounded-xl hover:bg-white/10 transition-colors"
                    >
                      {svg}
                    </button>
                  ))}
                </div>

                {/* Login link */}
                <div className="text-center pt-2 border-t border-white/[0.06]">
                  <span className="text-slate-500 text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onLoginClick}
                      className="text-brand-300 font-semibold hover:text-brand-300 transition-colors"
                    >
                      Sign in
                    </button>
                  </span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ── helpers ────────────────────────────────────────────────── */

interface FieldWrapperProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
  </div>
);

interface ToggleEyeProps {
  show: boolean;
  onToggle: () => void;
}

const ToggleEye: React.FC<ToggleEyeProps> = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    tabIndex={-1}
    aria-label={show ? 'Hide password' : 'Show password'}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
  >
    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

export default RegistrationForm;
