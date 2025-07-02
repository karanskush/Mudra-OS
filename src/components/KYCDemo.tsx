import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, FileText, Shield, Check, ArrowRight, Sparkles, Users, BarChart3 } from 'lucide-react';
import EnhancedCountrySelector from './EnhancedCountrySelector';
import { DiditCountry, getAvailableDocuments, formatDocumentName } from '../lib/diditCountries';
import { getSessionUserId } from '../lib/utils';

const KYCDemo: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<DiditCountry | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleCountrySelect = (country: DiditCountry) => {
    setSelectedCountry(country);
    setVerificationComplete(false);
  };

  const handleStartVerification = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
    }, 3000);
  };

  const stats = [
    { label: 'Countries Supported', value: '220+', icon: Globe },
    { label: 'Document Types', value: '4000+', icon: FileText },
    { label: 'Languages', value: '130+', icon: Users },
    { label: 'Success Rate', value: '99.8%', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="text-white/90 font-medium">Enhanced KYC Demo</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-4">
            Global Identity Verification
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto mb-8">
            Experience next-generation KYC with support for 220+ countries, powered by Didit's 
            AI-driven verification technology and enterprise-grade security.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Demo Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Country Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="h-6 w-6 text-blue-400" />
                Step 1: Select Your Country
              </h2>
              
              <EnhancedCountrySelector
                onCountrySelect={handleCountrySelect}
                selectedCountry={selectedCountry}
                isLoading={false}
              />

              {selectedCountry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10"
                >
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Available Documents for {selectedCountry.country}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {getAvailableDocuments(selectedCountry.countryCode).map((docType) => (
                      <div
                        key={docType}
                        className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-white/80 text-sm">{formatDocumentName(docType)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Verification Process */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-400" />
                Step 2: Document Verification
              </h2>

              {!selectedCountry ? (
                <div className="text-center py-12">
                  <Globe className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">Select a country to begin verification</p>
                </div>
              ) : !verificationComplete ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Ready to Verify</h3>
                    <p className="text-white/70 text-sm mb-6">
                      Upload your {formatDocumentName(getAvailableDocuments(selectedCountry.countryCode)[0])} 
                      to start the verification process
                    </p>
                  </div>

                  <motion.button
                    onClick={handleStartVerification}
                    disabled={isVerifying}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isVerifying ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Verifying with Didit AI...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5" />
                        Start Demo Verification
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Verification Complete!</h3>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-left">
                        <div className="text-white/60">Document Type:</div>
                        <div className="text-white font-medium">Passport</div>
                      </div>
                      <div className="text-left">
                        <div className="text-white/60">Status:</div>
                        <div className="text-green-400 font-medium">Verified ✓</div>
                      </div>
                      <div className="text-left">
                        <div className="text-white/60">Risk Score:</div>
                        <div className="text-white font-medium">Low (95/100)</div>
                      </div>
                      <div className="text-left">
                        <div className="text-white/60">Processing Time:</div>
                        <div className="text-white font-medium">1.2s</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Features List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Key Features
              </h3>
              <div className="space-y-3">
                {[
                  'AI-powered document authentication',
                  'Real-time liveness detection',
                  'Multi-language OCR support',
                  'AML screening integration',
                  'GDPR compliant processing',
                  'Bank-grade security'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-3 text-white/80 text-sm"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    {feature}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to implement?</h2>
            <p className="text-white/70 mb-6">
              Integrate this enhanced KYC system into your application with our comprehensive documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                View Documentation
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 transition-all duration-300">
                Get API Key
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KYCDemo; 