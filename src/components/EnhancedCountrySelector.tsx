import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, ChevronDown, Check, X, MapPin, FileText, Shield } from 'lucide-react';
import { DIDIT_COUNTRIES, DiditCountry, searchCountries, getAvailableDocuments, formatDocumentName } from '../lib/diditCountries';

interface EnhancedCountrySelectorProps {
  onCountrySelect: (country: DiditCountry) => void;
  isLoading?: boolean;
  selectedCountry?: DiditCountry | null;
}

const EnhancedCountrySelector: React.FC<EnhancedCountrySelectorProps> = ({
  onCountrySelect,
  isLoading = false,
  selectedCountry = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery);
  }, [searchQuery]);

  // Popular countries to show at the top
  const popularCountries = useMemo(() => {
    const popularCodes = ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'CA', 'AU', 'IN', 'BR'];
    return DIDIT_COUNTRIES.filter(country => popularCodes.includes(country.countryCode));
  }, []);

  const handleCountrySelect = (country: DiditCountry) => {
    onCountrySelect(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Selected Country Display / Search Trigger */}
      <motion.div
        className={`
          w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-4 cursor-pointer
          transition-all duration-300 hover:bg-white/10 hover:border-white/30
          ${isOpen ? 'border-blue-400/50 bg-white/10' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedCountry ? (
              <>
                <div className="text-2xl">{selectedCountry.flag}</div>
                <div>
                  <h3 className="text-white font-semibold">{selectedCountry.country}</h3>
                  <p className="text-white/60 text-sm">
                    {getAvailableDocuments(selectedCountry.countryCode).length} document types supported
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Select Your Country</h3>
                  <p className="text-white/60 text-sm">Choose your region for verification</p>
                </div>
              </>
            )}
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-white/60" />
          </motion.div>
        </div>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden z-50 shadow-2xl"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Countries List */}
            <div className="max-h-80 overflow-y-auto">
              {!searchQuery && (
                <div className="p-4 border-b border-white/10">
                  <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Popular Countries
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {popularCountries.map((country) => (
                      <motion.button
                        key={`popular-${country.countryCode}`}
                        variants={itemVariants}
                        onClick={() => handleCountrySelect(country)}
                        onMouseEnter={() => setHoveredCountry(country.countryCode)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        className={`
                          p-3 rounded-xl text-left transition-all duration-200 border border-transparent
                          hover:bg-white/10 hover:border-white/20
                          ${selectedCountry?.countryCode === country.countryCode ? 'bg-blue-500/20 border-blue-400/50' : 'bg-white/5'}
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-white text-sm font-medium truncate">{country.country}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Countries */}
              <div className="p-2">
                {!searchQuery && (
                  <h4 className="text-white/80 text-sm font-medium mb-3 px-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    All Countries ({DIDIT_COUNTRIES.length})
                  </h4>
                )}
                
                {filteredCountries.length > 0 ? (
                  <div className="space-y-1">
                    {filteredCountries.map((country) => (
                      <motion.button
                        key={country.countryCode}
                        variants={itemVariants}
                        onClick={() => handleCountrySelect(country)}
                        onMouseEnter={() => setHoveredCountry(country.countryCode)}
                        onMouseLeave={() => setHoveredCountry(null)}
                        className={`
                          w-full p-3 rounded-xl text-left transition-all duration-200 border border-transparent
                          hover:bg-white/10 hover:border-white/20
                          ${selectedCountry?.countryCode === country.countryCode ? 'bg-blue-500/20 border-blue-400/50' : ''}
                        `}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl">{country.flag}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium truncate">{country.country}</span>
                                <span className="text-white/40 text-xs bg-white/10 px-2 py-1 rounded-full">
                                  {country.countryCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-white/60" />
                                  <span className="text-white/60 text-xs">
                                    {getAvailableDocuments(country.countryCode).length} docs
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Shield className="h-3 w-3 text-green-400" />
                                  <span className="text-green-400 text-xs">Verified</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedCountry?.countryCode === country.countryCode && (
                            <Check className="h-5 w-5 text-blue-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* Document Types Preview */}
                        {hoveredCountry === country.countryCode && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 pt-3 border-t border-white/10"
                          >
                            <div className="flex flex-wrap gap-2">
                              {getAvailableDocuments(country.countryCode).map((docType) => (
                                <span
                                  key={docType}
                                  className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-lg"
                                >
                                  {formatDocumentName(docType)}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    variants={itemVariants}
                    className="text-center py-8"
                  >
                    <Globe className="h-12 w-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/60">No countries found matching "{searchQuery}"</p>
                    <p className="text-white/40 text-sm mt-1">Try adjusting your search terms</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Powered by Didit Global Verification Network</span>
                <span>220+ Countries Supported</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center z-60"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
          />
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedCountrySelector; 