import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronRight, Zap, Code, Database, Shield, TrendingUp, Activity, CreditCard, Users, Building, Settings, LogOut, Bell, UserCheck, Plus, ArrowRight, Sparkles, BadgeCheck, Clock, LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

interface SubSubMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  status?: 'stable' | 'active' | 'beta';
}

interface BaseSubMenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
  status?: 'stable' | 'active' | 'beta';
  category?: string;
}

interface SubMenuItemWithDropdown extends BaseSubMenuItem {
  hasSubDropdown: true;
  subItems: SubSubMenuItem[];
}

interface SubMenuItemWithoutDropdown extends BaseSubMenuItem {
  hasSubDropdown?: false;
  subItems?: never;
}

type SubMenuItem = SubMenuItemWithDropdown | SubMenuItemWithoutDropdown;

interface BaseMenuItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  badge?: string;
}

interface MenuItemWithDropdown extends BaseMenuItem {
  hasDropdown: true;
  items: SubMenuItem[];
}

interface MenuItemWithoutDropdown extends BaseMenuItem {
  hasDropdown?: false;
  items?: never;
}

type MenuItem = MenuItemWithDropdown | MenuItemWithoutDropdown;

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  
  // Helper function to get user's first name
  const getUserFirstName = () => {
    if (!user) return 'User';
    
    // Check for actual content (not just empty strings)
    const firstName = user.firstName?.trim();
    const first_name = user.first_name?.trim();
    
    let name = '';
    if (firstName) name = firstName;
    else if (first_name) name = first_name;
    else return 'User';
    
    // Capitalize first character
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  
  const getUserFullName = () => {
    if (!user) return 'User';
    
    const firstName = user.firstName?.trim() || user.first_name?.trim();
    const lastName = user.lastName?.trim() || user.last_name?.trim();
    
    if (firstName || lastName) {
      const capitalizedFirst = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : '';
      const capitalizedLast = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase() : '';
      return `${capitalizedFirst} ${capitalizedLast}`.trim();
    }
    
    // Fall back to first name logic
    return getUserFirstName();
  };
  
  const location = useLocation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = () => {
      setActiveDropdown(null);
      setActiveSubDropdown(null);
      setHoveredItem(null);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems: MenuItem[] = [
    {
      name: 'Platform',
      href: '#',
      hasDropdown: true,
      badge: 'New',
      description: 'Complete fintech infrastructure',
      items: [
        { 
          name: 'Core Ledger', 
          href: '/ledger', 
          icon: Database, 
          description: 'Double-entry accounting system',
          badge: 'Core',
          status: 'stable',
          category: 'Infrastructure'
        },
        { 
          name: 'Payment Rails', 
          href: '/payments', 
          icon: CreditCard, 
          description: 'Smart payment routing & processing',
          badge: 'Popular',
          status: 'stable',
          category: 'Payments'
        },
        { 
          name: 'KYC & Compliance', 
          href: '/kyc', 
          icon: Shield, 
          description: 'Identity verification & compliance',
          badge: 'Enhanced',
          status: 'stable',
          category: 'Compliance',
          hasSubDropdown: true,
          subItems: [
            { 
              name: 'KYC Dashboard', 
              href: '/kyc/dashboard', 
              icon: UserCheck, 
              description: 'Manage verification submissions',
              status: 'active'
            },
            { 
              name: 'New Verification', 
              href: '/kyc', 
              icon: Plus, 
              description: 'Start new identity verification',
              status: 'active'
            },
          ]
        },
        { 
          name: 'Analytics & Insights', 
          href: '/analytics', 
          icon: TrendingUp, 
          description: 'Real-time business intelligence',
          badge: 'Pro',
          status: 'stable',
          category: 'Analytics'
        },
        { 
          name: 'gRPC Streaming Demo', 
          href: '/grpc-demo', 
          icon: Zap, 
          description: 'Real-time bidirectional streaming APIs',
          badge: 'New',
          status: 'beta',
          category: 'Infrastructure'
        },
      ]
    },
    {
      name: 'Developers',
      href: '#',
      hasDropdown: true,
      icon: Code,
      description: 'API docs & developer resources',
      items: [
        {
          name: 'Explore API',
          href: '/developers/api-explorer',
          icon: Code,
          description: 'Interactive API testing & exploration',
          badge: 'Interactive',
          status: 'active',
          category: 'Development'
        },
        {
          name: 'View Documentation',
          href: '/developers/docs',
          icon: Database,
          description: 'Comprehensive API documentation',
          badge: 'Complete',
          status: 'stable',
          category: 'Development'
        },
        {
          name: 'gRPC Demo',
          href: '/grpc-demo',
          icon: Zap,
          description: 'Real-time bidirectional streaming APIs',
          badge: 'New',
          status: 'beta',
          category: 'Infrastructure'
        },
        {
          name: 'Quick Start',
          href: '/developers/quickstart',
          icon: Sparkles,
          description: 'Get started in minutes',
          badge: 'Guide',
          status: 'stable',
          category: 'Getting Started'
        },
        {
          name: 'SDKs & Libraries',
          href: '/developers/sdks',
          icon: Building,
          description: 'Client libraries & SDKs',
          badge: 'Multi-Lang',
          status: 'stable',
          category: 'Development'
        }
      ]
    },
    { name: 'Status', href: '/status', icon: Activity, description: 'System status & uptime' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname === href;
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
  };

  const handleRegisterSuccess = () => {
    setRegisterModalOpen(false);
  };

  const handleLogout = () => {
    const userName = getUserFullName();
    logout();
    toast.success(`Goodbye, ${userName}! See you soon! 👋`);
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
  };

  const handleDropdownClick = (e: React.MouseEvent, dropdownName: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
    setActiveSubDropdown(null); // Reset sub-dropdown when main dropdown changes
  };

  const handleSubDropdownClick = (e: React.MouseEvent, subDropdownName: string) => {
    e.stopPropagation();
    setActiveSubDropdown(activeSubDropdown === subDropdownName ? null : subDropdownName);
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'New': return isDark ? 'bg-brand-500/15 text-brand-200 border-brand-500/25' : 'bg-brand-500 text-brand-400 border-green-200';
      case 'Popular': return isDark ? 'bg-[rgba(59,110,255,0.15)] text-[#7EB8FF] border-[rgba(59,110,255,0.30)]' : 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Pro': return isDark ? 'bg-[rgba(104,186,127,0.15)] text-[#CFFFDC] border-[rgba(207,255,220,0.25)]' : 'bg-brand-500 text-brand-400 border-green-200';
      case 'Enterprise': return isDark ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Dev': return isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Core': return isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Enhanced': return isDark ? 'bg-teal-500/20 text-brand-300 border-teal-500/30' : 'bg-teal-50 text-brand-300 border-teal-200';
      default: return isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': return <BadgeCheck className="h-3 w-3 text-brand-400" />;
      case 'active': return <Clock className="h-3 w-3 text-[#68BA7F]" />;
      case 'beta': return <Sparkles className="h-3 w-3 text-[#CFFFDC]" />;
      default: return null;
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
          isScrolled
            ? isDark
              ? 'backdrop-blur-xl shadow-2xl border-b'
              : 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100'
            : isDark
              ? 'backdrop-blur-md border-b'
              : 'bg-white/90 backdrop-blur-md border-b border-gray-200/30'
        }`}
        style={isDark ? {
          backgroundColor: isScrolled ? 'rgba(4,6,15,0.96)' : 'rgba(4,6,15,0.72)',
          borderColor: isScrolled ? 'rgba(59,110,255,0.12)' : 'rgba(59,110,255,0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 group"
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B6EFF)' }}
                  >
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse shadow-sm" style={{ background: '#3B6EFF' }}></div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-xl font-bold leading-none transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    MudraCore OS
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#7EB8FF' }}>
                    Enterprise Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <button
                      onClick={(e) => handleDropdownClick(e, item.name)}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative`}
                      style={
                        activeDropdown === item.name
                          ? isDark
                            ? { background: 'rgba(59,110,255,0.14)', color: '#7EB8FF' }
                            : { background: '#f0fdf4', color: '#166534' }
                          : isDark
                            ? { color: 'rgba(255,255,255,0.78)' }
                            : { color: '#374151' }
                      }
                    >
                      {item.name}
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${getBadgeColor(item.badge)}`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                      {hoveredItem === item.name && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 rounded-full animate-pulse" style={{ background: '#3B6EFF' }}></div>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative"
                      style={
                        isActive(item.href)
                          ? isDark
                            ? { background: 'rgba(59,110,255,0.14)', color: '#7EB8FF' }
                            : { background: '#f0fdf4', color: '#166534' }
                          : isDark
                            ? { color: 'rgba(255,255,255,0.78)' }
                            : { color: '#374151' }
                      }
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.name}
                      {hoveredItem === item.name && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 rounded-full animate-pulse" style={{ background: '#3B6EFF' }}></div>
                      )}
                    </Link>
                  )}

                  {/* Enhanced Dropdown Menu */}
                  {item.hasDropdown && activeDropdown === item.name && (
                    <div
                      className="z-[999] absolute top-full left-0 mt-3 w-96 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-300"
                      style={isDark ? { background: 'rgba(4,6,15,0.98)', borderColor: 'rgba(59,110,255,0.18)' } : { background: 'rgba(255,255,255,0.97)', borderColor: '#e5e7eb' }}
                    >
                      {/* Header */}
                      <div className={`px-6 py-4 border-b ${
                        isDark ? 'border-slate-700/50' : 'border-gray-100'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.name}
                              {item.badge && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getBadgeColor(item.badge)}`}>
                                  {item.badge}
                                </span>
                              )}
                            </h3>
                            <p className={`text-sm mt-1 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>{item.description}</p>
                          </div>
                          <Sparkles className="h-5 w-5" style={{ color: '#7EB8FF' }} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <div className="grid gap-1">
                          {item.items?.map((subItem) => (
                            <div key={subItem.name} className="relative">
                              {subItem.hasSubDropdown ? (
                                <>
                                  <button
                                    onClick={(e) => handleSubDropdownClick(e, subItem.name)}
                                    className={`flex items-center justify-between w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                      isDark 
                                        ? 'hover:bg-slate-700/50 hover:shadow-lg' 
                                        : 'hover:bg-gray-50 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 transition-all duration-200 group-hover:scale-105 ${
                                        isDark 
                                          ? 'bg-slate-700/50 group-hover:bg-slate-600' 
                                          : 'bg-gradient-to-br from-brand-950 to-brand-900 group-hover:from-brand-900 group-hover:to-brand-800'
                                      }`}>
                                        <subItem.icon className={`h-5 w-5 ${
                                          isDark ? 'text-[#68BA7F]' : 'text-brand-400'
                                        }`} />
                                      </div>
                                      <div className="flex-1 text-left">
                                        <div className={`text-sm font-semibold flex items-center gap-2 ${
                                          isDark ? 'text-white' : 'text-gray-900'
                                        }`}>
                                          {subItem.name}
                                          {subItem.badge && (
                                            <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${getBadgeColor(subItem.badge)}`}>
                                              {subItem.badge}
                                            </span>
                                          )}
                                          {subItem.status && getStatusIcon(subItem.status)}
                                        </div>
                                        <div className={`text-xs mt-0.5 ${
                                          isDark ? 'text-gray-400' : 'text-gray-500'
                                        }`}>{subItem.description}</div>
                                        {subItem.category && (
                                          <div className={`text-xs mt-1 font-medium ${
                                            isDark ? 'text-[#68BA7F]' : 'text-brand-400'
                                          }`}>{subItem.category}</div>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${
                                      activeSubDropdown === subItem.name ? 'rotate-90' : ''
                                    } ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                                  </button>
                                  
                                  {/* Enhanced Sub-dropdown Menu */}
                                  {activeSubDropdown === subItem.name && (
                                    <div className={`ml-6 mt-2 mb-2 rounded-xl border backdrop-blur-sm animate-in fade-in-0 slide-in-from-left-2 duration-200 ${
                                      isDark 
                                        ? 'bg-slate-900/50 border-slate-600/50' 
                                        : 'bg-gray-50/50 border-gray-200/50'
                                    }`}>
                                      <div className="p-2">
                                        {subItem.subItems?.map((subSubItem) => (
                                          <Link
                                            key={subSubItem.name}
                                            to={subSubItem.href}
                                            className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                              isDark 
                                                ? 'hover:bg-slate-700/50' 
                                                : 'hover:bg-white hover:shadow-sm'
                                            }`}
                                            onClick={() => {
                                              setActiveDropdown(null);
                                              setActiveSubDropdown(null);
                                            }}
                                          >
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-all duration-200 group-hover:scale-105 ${
                                              isDark 
                                                ? 'bg-slate-600/50 group-hover:bg-slate-500' 
                                                : 'bg-surface-raised group-hover:bg-surface-hover'
                                            }`}>
                                              <subSubItem.icon className={`h-3.5 w-3.5 ${
                                                isDark ? 'text-[#68BA7F]' : 'text-brand-400'
                                              }`} />
                                            </div>
                                            <div className="flex-1">
                                              <div className={`text-sm font-medium flex items-center gap-2 ${
                                                isDark ? 'text-white' : 'text-gray-900'
                                              }`}>
                                                {subSubItem.name}
                                                {subSubItem.status && getStatusIcon(subSubItem.status)}
                                              </div>
                                              <div className={`text-xs mt-0.5 ${
                                                isDark ? 'text-gray-400' : 'text-gray-500'
                                              }`}>{subSubItem.description}</div>
                                            </div>
                                            <ArrowRight className={`h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                                              isDark ? 'text-gray-400' : 'text-gray-400'
                                            }`} />
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Link
                                  to={subItem.href}
                                  className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isDark 
                                      ? 'hover:bg-slate-700/50 hover:shadow-lg' 
                                      : 'hover:bg-gray-50 hover:shadow-sm'
                                  }`}
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 transition-all duration-200 group-hover:scale-105 ${
                                    isDark 
                                      ? 'bg-slate-700/50 group-hover:bg-slate-600' 
                                      : 'bg-gradient-to-br from-brand-950 to-brand-900 group-hover:from-brand-900 group-hover:to-brand-800'
                                  }`}>
                                    <subItem.icon className={`h-5 w-5 ${
                                      isDark ? 'text-[#68BA7F]' : 'text-brand-400'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className={`text-sm font-semibold flex items-center gap-2 ${
                                      isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {subItem.name}
                                      {subItem.badge && (
                                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${getBadgeColor(subItem.badge)}`}>
                                          {subItem.badge}
                                        </span>
                                      )}
                                      {subItem.status && getStatusIcon(subItem.status)}
                                    </div>
                                    <div className={`text-xs mt-0.5 ${
                                      isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>{subItem.description}</div>
                                    {subItem.category && (
                                      <div className={`text-xs mt-1 font-medium ${
                                        isDark ? 'text-[#68BA7F]' : 'text-brand-400'
                                      }`}>{subItem.category}</div>
                                    )}
                                  </div>
                                  <ArrowRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                                    isDark ? 'text-gray-400' : 'text-gray-400'
                                  }`} />
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        className="px-6 py-3 border-t rounded-b-2xl"
                        style={isDark ? { borderColor: 'rgba(104,186,127,0.1)', background: 'rgba(13,31,19,0.5)' } : { borderColor: '#e5e7eb', background: '#f9fafb' }}
                      >
                        <Link
                          to="/platform"
                          className="flex items-center justify-between w-full text-xs font-medium transition-colors duration-200"
                          style={{ color: '#68BA7F' }}
                        >
                          <span>Explore all features</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* User Section */}
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications */}
                  <button className={`relative p-2 rounded-lg transition-colors duration-200 ${
                    isDark 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-800' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => handleDropdownClick(e, 'user')}
                      className="flex items-center space-x-3 p-2 rounded-xl border transition-all duration-200 hover:shadow-md"
                      style={isDark ? { background: 'rgba(37,61,44,0.6)', borderColor: 'rgba(104,186,127,0.2)' } : { background: 'white', borderColor: '#d1fae5' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2E6F40, #68BA7F)', color: '#CFFFDC' }}>
                        {(getUserFirstName()[0] || 'U').toUpperCase()}
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className={`text-sm font-medium leading-none ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {getUserFullName()}
                        </span>
                        <span className={`text-xs leading-none mt-0.5 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {user.email}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        activeDropdown === 'user' ? 'rotate-180' : ''
                      } ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                    </button>

                    {/* User Dropdown */}
                    {activeDropdown === 'user' && (
                      <div
                        className="absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-xl border py-4 animate-in fade-in-0 zoom-in-95 duration-200"
                        style={isDark ? { background: 'rgba(14,15,18,0.97)', borderColor: 'rgba(255,255,255,0.09)' } : { background: 'white', borderColor: '#e5e7eb' }}
                      >
                        <div className={`px-4 pb-3 border-b ${
                          isDark ? 'border-[rgba(104,186,127,0.1)]' : 'border-gray-100'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold" style={{ background: 'linear-gradient(135deg, #2E6F40, #68BA7F)', color: '#CFFFDC' }}>
                              {(getUserFirstName()[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <div className={`text-sm font-semibold ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {getUserFullName()}
                              </div>
                              <div className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>{user.email}</div>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${
                              isDark 
                                ? 'text-gray-300 hover:bg-slate-700/50' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Users className="h-4 w-4" />
                            Profile Settings
                          </Link>
                          <Link
                            to="/billing"
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${
                              isDark 
                                ? 'text-gray-300 hover:bg-slate-700/50' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <CreditCard className="h-4 w-4" />
                            Billing & Usage
                          </Link>
                          <Link
                            to="/settings"
                            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${
                              isDark 
                                ? 'text-gray-300 hover:bg-slate-700/50' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Settings className="h-4 w-4" />
                            Account Settings
                          </Link>
                          <div className={`border-t mt-2 pt-2 ${
                            isDark ? 'border-slate-700' : 'border-gray-100'
                          }`}>
                            <button
                              onClick={handleLogout}
                              className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 w-full text-left ${
                                isDark 
                                  ? 'text-red-400 hover:bg-red-900/20' 
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={openLoginModal}
                    className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B6EFF)', color: '#C7DEFF', boxShadow: '0 0 16px rgba(59,110,255,0.35)' }}
                  >
                    Login
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-slate-800' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div
              className="lg:hidden border-t backdrop-blur-xl"
              style={isDark ? { backgroundColor: 'rgba(4,6,15,0.98)', borderColor: 'rgba(59,110,255,0.12)' } : { background: 'rgba(255,255,255,0.97)', borderColor: '#e5e7eb' }}
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                          className={`flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                            isDark 
                              ? 'text-gray-300 hover:text-white hover:bg-slate-800' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {item.name}
                          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`} />
                        </button>
                        {activeDropdown === item.name && (
                          <div className="mt-2 ml-4 space-y-2">
                            {item.items?.map((subItem) => (
                              <div key={subItem.name}>
                                {subItem.hasSubDropdown ? (
                                  <>
                                    <button
                                      onClick={() => setActiveSubDropdown(activeSubDropdown === subItem.name ? null : subItem.name)}
                                      className={`flex items-center justify-between w-full gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                        isDark 
                                          ? 'text-gray-400 hover:text-white hover:bg-slate-800' 
                                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <subItem.icon className="h-4 w-4" />
                                        {subItem.name}
                                      </div>
                                      <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${
                                        activeSubDropdown === subItem.name ? 'rotate-90' : ''
                                      }`} />
                                    </button>
                                    {activeSubDropdown === subItem.name && (
                                      <div className="mt-2 ml-6 space-y-1">
                                        {subItem.subItems?.map((subSubItem) => (
                                          <Link
                                            key={subSubItem.name}
                                            to={subSubItem.href}
                                            className={`flex items-center gap-3 px-3 py-2 text-xs rounded-md transition-colors duration-200 ${
                                              isDark 
                                                ? 'text-gray-500 hover:text-white hover:bg-slate-800' 
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                            onClick={() => setIsOpen(false)}
                                          >
                                            <subSubItem.icon className="h-3 w-3" />
                                            {subSubItem.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <Link
                                    to={subItem.href}
                                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                      isDark 
                                        ? 'text-gray-400 hover:text-white hover:bg-slate-800' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setIsOpen(false)}
                                  >
                                    <subItem.icon className="h-4 w-4" />
                                    {subItem.name}
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 ${
                          isDark 
                            ? 'text-gray-300 hover:text-white hover:bg-slate-800' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                {user ? (
                  <div className={`pt-4 border-t ${
                    isDark ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    <div className={`flex items-center space-x-3 px-3 py-2 mb-4 rounded-lg ${
                      isDark ? 'bg-slate-800' : 'bg-gray-50'
                    }`}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold">
                        {(getUserFirstName()[0] || 'U').toUpperCase()}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {getUserFullName()}
                        </div>
                        <div className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg w-full text-left transition-colors duration-200 ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className={`pt-4 border-t space-y-2 ${
                    isDark ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    <button
                      onClick={() => {
                        openLoginModal();
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #2E6F40, #68BA7F)', color: '#CFFFDC' }}
                    >
                      Login
                    </button>
                  </div>
                )}
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
        onLoginClick={openLoginModal}
      />
    </>
  );
};

export default Navbar;