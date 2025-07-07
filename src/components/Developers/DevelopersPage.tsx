import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BeakerIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const DevelopersPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed spacing from navbar */}
      <div className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 lg:mb-16"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Developer Hub
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
                Build the future of finance with our comprehensive developer platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  to="/developers/api-explorer"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  <BeakerIcon className="h-5 w-5 mr-2" />
                  Explore APIs
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
                <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View Documentation
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Developer Resources */}
        <section className="py-12 sm:py-16 lg:py-10 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 lg:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Developer Resources
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to integrate our MudraCore platform into your applications
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {[
                {
                  title: '🧪 API Explorer',
                  description: 'Interactive playground to explore our comprehensive APIs',
                  icon: BeakerIcon,
                  link: '/developers/api-explorer',
                  color: 'from-purple-500 to-indigo-600'
                },
                {
                  title: '📚 Documentation',
                  description: 'Complete guides and reference materials',
                  icon: DocumentTextIcon,
                  link: '/developers/docs',
                  color: 'from-blue-500 to-cyan-600'
                },
                {
                  title: '💻 Code Examples',
                  description: 'Ready-to-use code snippets and SDKs',
                  icon: CodeBracketIcon,
                  link: '/developers/examples',
                  color: 'from-green-500 to-emerald-600'
                },
                {
                  title: '🚀 Quick Start',
                  description: 'Get up and running in under 5 minutes',
                  icon: RocketLaunchIcon,
                  link: '/developers/quickstart',
                  color: 'from-orange-500 to-red-600'
                }
              ].map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Link
                    to={resource.link}
                    className="block p-6 lg:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${resource.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <resource.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {resource.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of developers building the next generation of financial applications with our platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/developers/api-explorer"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                >
                  Start Exploring
                </Link>
                <button className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DevelopersPage; 