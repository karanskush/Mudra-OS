import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ChevronDown, Zap, Code, Database, Shield, TrendingUp,
  Activity, CreditCard, Users, Settings, LogOut, Bell, UserCheck,
  Plus, ArrowRight, Sparkles, BadgeCheck, Clock, LucideIcon,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface SubSubMenuItem {
  name: string; href: string; icon: LucideIcon; description: string;
  status?: 'stable' | 'active' | 'beta';
}
interface BaseSubMenuItem {
  name: string; href: string; icon: LucideIcon; description: string;
  badge?: string; status?: 'stable' | 'active' | 'beta'; category?: string;
}
interface SubMenuItemWithDropdown extends BaseSubMenuItem {
  hasSubDropdown: true; subItems: SubSubMenuItem[];
}
interface SubMenuItemWithoutDropdown extends BaseSubMenuItem {
  hasSubDropdown?: false; subItems?: never;
}
type SubMenuItem = SubMenuItemWithDropdown | SubMenuItemWithoutDropdown;

interface BaseMenuItem {
  name: string; href: string; icon?: LucideIcon;
  description?: string; badge?: string;
}
interface MenuItemWithDropdown extends BaseMenuItem {
  hasDropdown: true; items: SubMenuItem[];
}
interface MenuItemWithoutDropdown extends BaseMenuItem {
  hasDropdown?: false; items?: never;
}
type MenuItem = MenuItemWithDropdown | MenuItemWithoutDropdown;

/* ─── Badge / status helpers ────────────────────────────────────────────── */

const BADGE_MAP: Record<string, string> = {
  New:         'bg-accent/10 text-secondary border-accent/20',
  Popular:     'bg-blue-50 text-blue-600 border-blue-200',
  Pro:         'bg-amber-50 text-amber-700 border-amber-200',
  Enterprise:  'bg-orange-50 text-orange-700 border-orange-200',
  Dev:         'bg-indigo-50 text-indigo-700 border-indigo-200',
  Core:        'bg-slate-100 text-slate-600 border-slate-200',
  Enhanced:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Interactive: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Complete:    'bg-slate-100 text-slate-600 border-slate-200',
  Guide:       'bg-orange-50 text-orange-600 border-orange-200',
  'Multi-Lang':'bg-pink-50 text-pink-600 border-pink-200',
};

const badgeCls = (b: string) =>
  `text-[0.65rem] font-black px-1.5 py-0.5 rounded-md border flex-shrink-0 ${BADGE_MAP[b] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`;

const StatusIcon = ({ status }: { status?: string }) => {
  if (status === 'stable')  return <BadgeCheck className="h-3 w-3 text-secondary" />;
  if (status === 'active')  return <Clock className="h-3 w-3 text-secondary" />;
  if (status === 'beta')    return <Sparkles className="h-3 w-3 text-accent" />;
  return null;
};

/* ─── Nav data ──────────────────────────────────────────────────────────── */

const NAV_ITEMS: MenuItem[] = [
  {
    name: 'Platform', href: '#', hasDropdown: true, badge: 'New',
    description: 'Complete fintech infrastructure',
    items: [
      { name: 'Core Ledger',         href: '/ledger',    icon: Database,   description: 'Double-entry accounting system',           badge: 'Core',     status: 'stable', category: 'Infrastructure' },
      { name: 'Payment Rails',       href: '/payments',  icon: CreditCard, description: 'Smart payment routing & processing',       badge: 'Popular',  status: 'stable', category: 'Payments' },
      { name: 'KYC & Compliance',    href: '/kyc',       icon: Shield,     description: 'Identity verification & compliance',       badge: 'Enhanced', status: 'stable', category: 'Compliance',
        hasSubDropdown: true, subItems: [
          { name: 'KYC Dashboard',    href: '/kyc/dashboard', icon: UserCheck, description: 'Manage verification submissions', status: 'active' },
          { name: 'New Verification', href: '/kyc',           icon: Plus,      description: 'Start new identity verification',   status: 'active' },
        ],
      },
      { name: 'Analytics & Insights',href: '/status',    icon: TrendingUp, description: 'Real-time business intelligence',          badge: 'Pro',      status: 'stable', category: 'Analytics' },
      { name: 'gRPC Streaming Demo', href: '/grpc-demo', icon: Zap,        description: 'Real-time bidirectional streaming APIs',   badge: 'New',      status: 'beta',   category: 'Infrastructure' },
    ],
  },
  {
    name: 'Developers', href: '#', hasDropdown: true, icon: Code,
    description: 'API docs & developer resources',
    items: [
      { name: 'Explore API',      href: '/developers/api-explorer', icon: Code,     description: 'Interactive API testing & exploration', badge: 'Interactive', status: 'active',  category: 'Development' },
      { name: 'Documentation',    href: '/developers',              icon: Database, description: 'Comprehensive API documentation',        badge: 'Complete',    status: 'stable',  category: 'Development' },
      { name: 'gRPC Demo',        href: '/grpc-demo',               icon: Zap,      description: 'Real-time bidirectional streaming',      badge: 'New',         status: 'beta',    category: 'Infrastructure' },
      { name: 'Quick Start',      href: '/developers/quickstart',   icon: Sparkles, description: 'Get started in minutes',                 badge: 'Guide',       status: 'stable',  category: 'Getting Started' },
    ],
  },
  { name: 'Status', href: '/status', icon: Activity, description: 'System status & uptime' },
  { name: 'My Work', href: '/about', icon: Sparkles, description: 'About me & capabilities' },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

const Navbar: React.FC = () => {
  const [isOpen,            setIsOpen]            = useState(false);
  const [isScrolled,        setIsScrolled]        = useState(false);
  const [activeDropdown,    setActiveDropdown]    = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [loginOpen,         setLoginOpen]         = useState(false);
  const [registerOpen,      setRegisterOpen]      = useState(false);

  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const navRef    = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setActiveSubDropdown(null);
      }
    };
    window.addEventListener('scroll', onScroll);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const toggleDropdown = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setActiveDropdown(prev => prev === name ? null : name);
    setActiveSubDropdown(null);
  };

  const toggleSubDropdown = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setActiveSubDropdown(prev => prev === name ? null : name);
  };

  const getFirstName = () => {
    const n = user?.firstName?.trim() || user?.first_name?.trim();
    return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : 'User';
  };

  const getFullName = () => {
    const first = user?.firstName?.trim() || user?.first_name?.trim() || '';
    const last  = user?.lastName?.trim()  || user?.last_name?.trim()  || '';
    if (first || last) return `${first} ${last}`.trim();
    return getFirstName();
  };

  const handleLogout = () => {
    const name = getFullName();
    logout();
    toast.success(`Goodbye, ${name}!`);
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-outline-variant/50 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ─────────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <span className="w-7 h-7 bg-accent rounded-sm flex-shrink-0" />
              <div>
                <span className="text-[1rem] font-black tracking-tighter text-primary uppercase">
                  MudraCore OS
                </span>
              </div>
            </Link>

            {/* ── Desktop nav ──────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <div key={item.name} className="relative">
                  {item.hasDropdown ? (
                    <button
                      onClick={e => toggleDropdown(e, item.name)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.875rem] font-semibold transition-colors ${
                        activeDropdown === item.name
                          ? 'bg-surface text-primary'
                          : 'text-primary/70 hover:text-primary hover:bg-surface'
                      }`}
                    >
                      {item.name}
                      {item.badge && (
                        <span className={badgeCls(item.badge)}>{item.badge}</span>
                      )}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.875rem] font-semibold transition-colors ${
                        isActive(item.href)
                          ? 'bg-surface text-primary'
                          : 'text-primary/70 hover:text-primary hover:bg-surface'
                      }`}
                    >
                      {item.icon && <item.icon className="h-3.5 w-3.5" />}
                      {item.name}
                    </Link>
                  )}

                  {/* ── Dropdown ───────────────────────────────────────── */}
                  {item.hasDropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-outline-variant rounded-2xl shadow-lg overflow-hidden z-50">
                      {/* Header */}
                      <div className="px-5 py-3.5 border-b border-outline-variant/50 bg-surface">
                        <p className="text-sm font-black text-primary">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      </div>

                      {/* Items */}
                      <div className="p-2">
                        {item.items?.map(sub => (
                          <div key={sub.name} className="relative">
                            {sub.hasSubDropdown ? (
                              <>
                                <button
                                  onClick={e => toggleSubDropdown(e, sub.name)}
                                  className="flex items-start justify-between w-full gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
                                >
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors mt-0.5 border border-outline-variant/50">
                                      <sub.icon className="h-4 w-4 text-secondary" />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="text-[0.875rem] font-bold text-primary">{sub.name}</span>
                                        {sub.badge && <span className={badgeCls(sub.badge)}>{sub.badge}</span>}
                                        <StatusIcon status={sub.status} />
                                      </div>
                                      <p className="text-xs text-slate-500">{sub.description}</p>
                                    </div>
                                  </div>
                                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${activeSubDropdown === sub.name ? 'rotate-180' : ''}`} />
                                </button>

                                {activeSubDropdown === sub.name && (
                                  <div className="ml-4 mr-2 mb-1 border border-outline-variant rounded-xl overflow-hidden bg-surface">
                                    {sub.subItems.map(ss => (
                                      <Link
                                        key={ss.name}
                                        to={ss.href}
                                        onClick={() => { setActiveDropdown(null); setActiveSubDropdown(null); }}
                                        className="flex items-start gap-3 px-4 py-2.5 hover:bg-white transition-colors group"
                                      >
                                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-outline-variant/50">
                                          <ss.icon className="h-3.5 w-3.5 text-secondary" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-primary">{ss.name}</span>
                                            <StatusIcon status={ss.status} />
                                          </div>
                                          <p className="text-xs text-slate-500">{ss.description}</p>
                                        </div>
                                        <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all mt-0.5" />
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Link
                                to={sub.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors group"
                              >
                                <div className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors mt-0.5 border border-outline-variant/50">
                                  <sub.icon className="h-4 w-4 text-secondary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <span className="text-[0.875rem] font-bold text-primary">{sub.name}</span>
                                    {sub.badge && <span className={badgeCls(sub.badge)}>{sub.badge}</span>}
                                    <StatusIcon status={sub.status} />
                                  </div>
                                  <p className="text-xs text-slate-500 leading-snug">{sub.description}</p>
                                  {sub.category && (
                                    <p className="text-[0.65rem] font-black text-secondary mt-0.5">{sub.category}</p>
                                  )}
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all mt-0.5" />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3 border-t border-outline-variant/50 bg-surface">
                        <Link
                          to="/developers"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center justify-between text-xs font-bold text-secondary hover:text-primary transition-colors"
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

            {/* ── Right actions ─────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  {/* Notifications */}
                  <button className="relative p-2 rounded-lg text-primary/50 hover:text-primary hover:bg-surface transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </button>

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={e => toggleDropdown(e, 'user')}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-outline-variant hover:bg-surface transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs font-black text-white">
                        {(getFirstName()[0] || 'U').toUpperCase()}
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-semibold text-primary leading-none">{getFullName()}</span>
                        <span className="text-xs text-slate-500 leading-none mt-0.5">{user.email}</span>
                      </div>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'user' ? 'rotate-180' : ''}`} />
                    </button>

                    {activeDropdown === 'user' && (
                      <div className="absolute top-full right-0 mt-2 w-60 bg-white border border-outline-variant rounded-2xl shadow-lg overflow-hidden z-50">
                        {/* Profile header */}
                        <div className="px-4 py-3.5 border-b border-outline-variant/50 bg-surface">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-sm font-black text-white">
                              {(getFirstName()[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-primary">{getFullName()}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-1.5">
                          {[
                            { label: 'Profile Settings',  icon: Users,     href: '/profile'  },
                            { label: 'Billing & Usage',   icon: CreditCard, href: '/billing' },
                            { label: 'Account Settings',  icon: Settings,  href: '/settings' },
                          ].map(({ label, icon: Icon, href }) => (
                            <Link
                              key={label}
                              to={href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary/70 hover:text-primary hover:bg-surface transition-colors"
                            >
                              <Icon className="h-4 w-4 text-secondary" />
                              {label}
                            </Link>
                          ))}
                          <div className="border-t border-outline-variant/50 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="text-[0.875rem] font-semibold text-primary/70 hover:text-primary transition-colors"
                  >
                    Login
                  </button>
                  <Link
                    to="/ledger"
                    className="bg-primary text-white px-5 py-2.5 rounded-lg text-[0.875rem] font-semibold active:scale-95 transition-all hover:shadow-lg hover:shadow-primary/20"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-primary/60 hover:text-primary hover:bg-surface transition-colors"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile menu button (outside hidden div) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-primary/60 hover:text-primary hover:bg-surface transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ────────────────────────────────────────────────── */}
        {isOpen && (
          <div className="lg:hidden border-t border-outline-variant/50 bg-white">
            <div className="px-6 py-4 space-y-1">
              {NAV_ITEMS.map(item => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-primary/70 hover:text-primary hover:bg-surface rounded-lg transition-colors"
                      >
                        {item.name}
                        <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                      </button>
                      {activeDropdown === item.name && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-outline-variant pl-3">
                          {item.items?.map(sub => (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              onClick={() => { setIsOpen(false); setActiveDropdown(null); }}
                              className="flex items-center gap-2 py-2 text-sm text-primary/70 hover:text-primary transition-colors"
                            >
                              <sub.icon className="h-3.5 w-3.5 text-secondary" />
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                        isActive(item.href) ? 'bg-surface text-primary' : 'text-primary/70 hover:text-primary hover:bg-surface'
                      }`}
                    >
                      {item.icon && <item.icon className="h-3.5 w-3.5" />}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile auth */}
              <div className="pt-4 border-t border-outline-variant/50 flex flex-col gap-2">
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out ({getFirstName()})
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setLoginOpen(true); setIsOpen(false); }}
                      className="px-4 py-2.5 text-sm font-semibold text-primary/70 hover:text-primary hover:bg-surface rounded-lg transition-colors text-left"
                    >
                      Login
                    </button>
                    <Link
                      to="/ledger"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Auth modals ──────────────────────────────────────────────────── */}
      <LoginForm
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => { setLoginOpen(false); navigate('/ledger'); }}
        onRegisterClick={() => { setLoginOpen(false); setRegisterOpen(true); }}
      />
      <RegistrationForm
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={() => { setRegisterOpen(false); navigate('/ledger'); }}
        onLoginClick={() => { setRegisterOpen(false); setLoginOpen(true); }}
      />
    </>
  );
};

export default Navbar;
