import React from 'react';
import { Zap, Twitter, Linkedin, Github, Youtube, Shield, Database, Code, TrendingUp } from 'lucide-react';

const footerLinks = {
  Platform: ['Core Ledger', 'Payment Rails', 'KYC Engine', 'Compliance Suite', 'API Documentation', 'SDK Downloads'],
  Resources: ['Documentation', 'API Reference', 'Code Examples', 'Architecture Guide', 'Best Practices', 'Community Forum'],
  Company: ['About', 'Careers', 'Press Kit', 'Partners', 'Contact', 'Security'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR Compliance', 'Security Policy', 'Audit Reports'],
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
  <footer style={{ backgroundColor: '#0B0C0E', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 py-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

        {/* Brand col */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2E6F40, #68BA7F)' }}
            >
              <Zap className="h-4.5 w-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <span className="text-lg font-bold text-white">MudraCore OS</span>
          </div>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)', maxWidth: '220px' }}>
            Ultra-lean fintech infrastructure for modern financial applications.
          </p>

          {/* Certifications */}
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Certifications
          </p>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {certifications.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <c.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#68BA7F' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>{c.label}</span>
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
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(46,111,64,0.15)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(104,186,127,0.3)';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#68BA7F';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)';
                }}
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([cat, links]) => (
          <div key={cat}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              {cat}
            </p>
            <ul className="space-y-3">
              {links.map((link, i) => (
                <li key={i}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'rgba(255,255,255,0.38)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.38)')}
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
      <div className="py-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: '#68BA7F' }}>
            Stay in the loop
          </p>
          <h3 className="text-xl font-bold text-white mb-3">
            Fintech innovations, straight to your inbox
          </h3>
          <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Architecture updates, compliance changes, and platform improvements delivered weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'white',
              }}
              onFocus={e => {
                (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(104,186,127,0.4)';
                (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(46,111,64,0.12)';
              }}
              onBlur={e => {
                (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)';
                (e.currentTarget as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
            <button
              className="rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #2E6F40, #68BA7F)',
                color: '#CFFFDC',
                boxShadow: '0 2px 12px rgba(46,111,64,0.35)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 20px rgba(46,111,64,0.55)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(46,111,64,0.35)'; }}
            >
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
              <div className="text-2xl font-extrabold text-white leading-none mb-1">{value}</div>
              <div className="text-[11px] uppercase tracking-[0.10em]" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
            © 2025 MudraCore OS. All rights reserved. Built for enterprise fintech.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Security', 'Compliance', 'Status'].map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-xs transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.28)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.28)')}
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
