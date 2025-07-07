import React from 'react';
import { Zap, Twitter, Youtube, Linkedin, Github, Instagram, Code, Database, Shield, TrendingUp } from 'lucide-react';

const footerLinks = {
  Platform: [
    'Core Ledger',
    'Payment Rails',
    'KYC Engine',
    'Compliance Suite',
    'API Documentation',
    'SDK Downloads',
  ],
  Resources: [
    'Documentation',
    'API Reference',
    'Code Examples',
    'Architecture Guide',
    'Best Practices',
    'Community Forum',
  ],
  Company: [
    'About',
    'Careers',
    'Press Kit',
    'Partners',
    'Contact',
    'Security',
  ],
  Legal: [
    'Privacy Policy',
    'Terms of Service',
    'Cookie Policy',
    'GDPR Compliance',
    'Security Policy',
    'Audit Reports',
  ],
};

const socialLinks = [
  { icon: Github, href: '#github', label: 'GitHub' },
  { icon: Twitter, href: '#twitter', label: 'Twitter' },
  { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
  { icon: Youtube, href: '#youtube', label: 'YouTube' },
];

const certifications = [
  { icon: Shield, label: 'SOC 2 Type II' },
  { icon: Database, label: 'PCI DSS Level 1' },
  { icon: Code, label: 'ISO 27001' },
  { icon: TrendingUp, label: 'GDPR Compliant' },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">MudraCore OS</span>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Ultra-lean MudraCore OS for modern financial applications.
              </p>
            </div>
            
            {/* Certifications */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Certifications
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-400 text-sm">
                    <cert.icon className="h-4 w-4 text-green-400" />
                    {cert.label}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 transform"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline underline-offset-4 text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Developer Newsletter */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 mb-12 border border-blue-800/30">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay updated with fintech innovations</h3>
            <p className="text-gray-300 mb-6">
              Get the latest updates on fintech architecture, compliance changes, and platform improvements delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 transform">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">14</div>
            <div className="text-gray-400 text-sm">Core Domains</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">99.99%</div>
            <div className="text-gray-400 text-sm">API Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">80%</div>
            <div className="text-gray-400 text-sm">Test Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">1-CMD</div>
            <div className="text-gray-400 text-sm">Setup Time</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 MudraCore OS. All rights reserved. Built for enterprise fintech.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                Privacy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                Terms
              </a>
              <a href="#security" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                Security
              </a>
              <a href="#compliance" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                Compliance
              </a>
              <a href="#status" className="text-gray-400 hover:text-white text-sm transition-colors duration-300">
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;