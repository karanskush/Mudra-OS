import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  CreditCard, 
  Database, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  Users,
  BarChart3,
  Lock,
  Clock
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Enterprise-level security with end-to-end encryption and compliance with financial regulations."
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Advanced analytics and reporting tools to track your financial performance in real-time."
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Seamless payment processing with support for multiple payment methods and currencies."
    },
    {
      icon: Database,
      title: "Core Banking",
      description: "Complete core banking functionality with ledger management and account services."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "International banking capabilities with multi-currency support and global compliance."
    },
    {
      icon: Users,
      title: "User Management",
      description: "Comprehensive user management with role-based access control and KYC integration."
    }
  ];

  const benefits = [
    "Reduce operational costs by up to 60%",
    "Launch new products 10x faster",
    "99.99% uptime guarantee",
    "24/7 customer support",
    "Compliance with global regulations",
    "Scalable infrastructure"
  ];

  const stats = [
    { number: "10M+", label: "Transactions Processed" },
    { number: "500+", label: "Financial Institutions" },
    { number: "99.99%", label: "Uptime" },
    { number: "50+", label: "Countries Supported" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              The Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}Fintech
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build, deploy, and scale financial applications with our ultra-lean fintech operating system. 
              Complete banking infrastructure in a single platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ledger"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Try Live Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build Financial Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and infrastructure needed to create 
              modern financial applications at scale.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our MudraCore Platform?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Built for modern financial institutions, our platform delivers unmatched performance, 
                security, and scalability.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 mr-3" />
                    <div>
                      <div className="font-semibold">Real-Time Analytics</div>
                      <div className="text-blue-100 text-sm">Live dashboard with key metrics</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-8 w-8 mr-3" />
                    <div>
                      <div className="font-semibold">Bank-Grade Security</div>
                      <div className="text-blue-100 text-sm">256-bit encryption & compliance</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 mr-3" />
                    <div>
                      <div className="font-semibold">24/7 Monitoring</div>
                      <div className="text-blue-100 text-sm">Continuous system monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Financial Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of financial institutions already using our platform to build 
            the future of finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ledger"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">MudraCore OS</span>
              </div>
              <p className="text-gray-400">
                The complete fintech operating system for modern financial applications.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Core Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Payment Processing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MudraCore OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 