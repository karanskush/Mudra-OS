import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Beaker, FileText, Code2, Rocket, ArrowRight, Zap, Shield, Globe, Terminal } from 'lucide-react';

const resources = [
  {
    title: 'API Explorer',
    description: 'Interactive playground to explore and test our comprehensive REST & gRPC APIs',
    icon: Beaker,
    link: '/developers/api-explorer',
    badge: 'Interactive',
  },
  {
    title: 'Documentation',
    description: 'Complete guides, tutorials, and reference materials for every endpoint',
    icon: FileText,
    link: '#',
    badge: 'Reference',
  },
  {
    title: 'Code Examples',
    description: 'Ready-to-use code snippets, SDKs, and integration samples',
    icon: Code2,
    link: '#',
    badge: 'SDK',
  },
  {
    title: 'Quick Start',
    description: 'Get up and running with MudraCore OS in under 5 minutes',
    icon: Rocket,
    link: '#',
    badge: '5 min',
  },
];

const capabilities = [
  {
    icon: Zap,
    title: 'REST + gRPC',
    description: 'Dual protocol support — low-latency gRPC for high-throughput and familiar REST for flexibility.',
  },
  {
    icon: Shield,
    title: 'JWT Auth',
    description: 'Industry-standard JWT tokens with refresh logic, rate limiting, and RBAC out of the box.',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Requests routed to the nearest edge node for sub-20ms response times worldwide.',
  },
  {
    icon: Terminal,
    title: 'Webhooks',
    description: 'Real-time event streams via signed webhooks with replay, filtering, and retry logic.',
  },
];

const DevelopersPage: React.FC = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-accent/10 border border-accent/20 text-secondary">
            <Code2 className="h-3 w-3" />
            Developer Hub
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-5 tracking-tight">
            Build the future{' '}
            <span style={{
              background: 'linear-gradient(95deg, #0A1128 0%, #006d43 50%, #00FF94 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              of finance
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Everything you need to integrate MudraCore OS into your applications — REST APIs, gRPC streams, webhooks, and SDKs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/developers/api-explorer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
            >
              <Beaker className="h-4 w-4" />
              Explore APIs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 border border-outline-variant text-primary font-bold rounded-xl hover:bg-surface active:scale-95 transition-all">
              <FileText className="h-4 w-4" />
              View Documentation
            </button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Resources grid */}
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-black text-accent uppercase tracking-[0.3em] mb-3">Resources</p>
          <h2 className="text-3xl font-black text-primary tracking-tight">Developer Resources</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Everything you need to integrate MudraCore into your applications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resources.map((res, i) => (
            <motion.div
              key={res.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={res.link}
                className="flex items-start gap-5 p-6 bg-white border border-outline-variant rounded-2xl shadow-premium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-surface border border-outline-variant rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                  <res.icon className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-primary group-hover:text-secondary transition-colors">
                      {res.title}
                    </h3>
                    <span className="text-[0.7rem] font-black px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-secondary">
                      {res.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{res.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Capabilities */}
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-black text-accent uppercase tracking-[0.3em] mb-3">Platform</p>
          <h2 className="text-3xl font-black text-primary tracking-tight">Built for scale</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white border border-outline-variant rounded-2xl p-6 shadow-premium"
            >
              <div className="w-10 h-10 bg-surface border border-outline-variant rounded-xl flex items-center justify-center mb-4">
                <cap.icon className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-bold text-primary mb-2">{cap.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{cap.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-primary rounded-[2rem] p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Join developers building the next generation of financial applications with MudraCore OS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/developers/api-explorer"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-primary font-black rounded-xl hover:shadow-glow active:scale-95 transition-all"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 active:scale-95 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default DevelopersPage;
