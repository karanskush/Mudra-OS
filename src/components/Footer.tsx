import React from 'react';
import { Zap, Twitter, Linkedin, Github, Youtube, Shield, Database, Code, TrendingUp } from 'lucide-react';

const footerLinks = {
  Platform:  ['Core Ledger', 'Payment Rails', 'KYC Engine', 'Compliance Suite', 'API Documentation', 'SDK Downloads'],
  Resources: ['Documentation', 'API Reference', 'Code Examples', 'Architecture Guide', 'Best Practices', 'Community Forum'],
  Company:   ['About', 'Careers', 'Press Kit', 'Partners', 'Contact', 'Security'],
  Legal:     ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR Compliance', 'Security Policy', 'Audit Reports'],
};

const socialLinks = [
  { icon: Github,   href: '#', label: 'GitHub'   },
  { icon: Twitter,  href: '#', label: 'Twitter'  },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube,  href: '#', label: 'YouTube'  },
];

const certifications = [
  { icon: Shield,     label: 'SOC 2 Type II'  },
  { icon: Database,   label: 'PCI DSS Level 1' },
  { icon: Code,       label: 'ISO 27001'       },
  { icon: TrendingUp, label: 'GDPR Compliant'  },
];

const bottomStats = [
  { value: '14',     label: 'Core Domains'  },
  { value: '99.99%', label: 'API Uptime'    },
  { value: '80%',    label: 'Test Coverage' },
  { value: '1-CMD',  label: 'Setup Time'    },
];

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-outline-variant">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 py-16 border-b border-outline-variant">

        {/* Brand col */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Zap style={{ width: '16px', height: '16px', color: '#00FF94' }} />
            </div>
            <span className="text-lg font-black text-primary uppercase tracking-wide">MudraCore OS</span>
          </div>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed" style={{ maxWidth: '220px' }}>
            Ultra-lean fintech infrastructure for modern financial applications.
          </p>

          {/* Certifications */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3">
            Certifications
          </p>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {certifications.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <c.icon className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />
                <span className="text-xs text-slate-500">{c.label}</span>
              </div>
            ))}
          </div>

          {/* Socials */}
          <div className="flex gap-2">
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border border-outline-variant text-slate-400 hover:text-secondary hover:border-accent/40 hover:bg-accent/5"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([cat, links]) => (
          <div key={cat}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-5">
              {cat}
            </p>
            <ul className="space-y-3">
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-slate-500 hover:text-primary transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="py-12 border-b border-outline-variant">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary mb-3">
            Stay in the loop
          </p>
          <h3 className="text-xl font-bold text-primary mb-3">
            Fintech innovations, straight to your inbox
          </h3>
          <p className="text-sm text-slate-500 mb-7">
            Architecture updates, compliance changes, and platform improvements delivered weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-xl px-4 py-3 text-sm text-primary bg-surface border border-outline-variant outline-none transition-all duration-200 focus:border-accent/40 focus:ring-2 focus:ring-accent/10 placeholder:text-slate-400"
            />
            <button className="rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap bg-primary text-white hover:shadow-lg hover:shadow-primary/20 active:scale-95">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom stats + copyright */}
      <div className="py-8">
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mb-8">
          {bottomStats.map(({ value, label }, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-extrabold text-primary leading-none mb-1">{value}</div>
              <div className="text-[11px] uppercase tracking-[0.10em] text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-outline-variant">
          <p className="text-xs text-slate-400">
            © 2025 MudraCore OS. All rights reserved. Built for enterprise fintech.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Security', 'Compliance', 'Status'].map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-xs text-slate-400 hover:text-primary transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  </footer>
);

export default Footer;
