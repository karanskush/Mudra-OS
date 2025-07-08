import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery);
  }, [searchQuery]);

  // Popular countries to show at the top
  const popularCountries = useMemo(() => {
    const popularCodes = ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'CA', 'AU', 'IN', 'BR'];
    return DIDIT_COUNTRIES.filter(country => popularCodes.includes(country.countryCode));
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto focus-within:ring-4 focus-within:ring-blue-400/40 rounded-2xl" style={{ zIndex: 9999 }} tabIndex={0} aria-label="Country Selector">
      {/* Selected Country Display / Search Trigger */}
      <motion.div
        className={`
          w-full bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl p-6 cursor-pointer
          transition-all duration-300 hover:bg-white/20 hover:border-blue-400/50 shadow-xl
          ${isOpen ? 'border-blue-400/80 bg-white/20' : ''}
        `}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        tabIndex={0}
        aria-label={selectedCountry ? `Selected country: ${selectedCountry.country}` : 'Select your country'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedCountry ? (
              <>
                <div className="text-2xl animate-bounce-gentle">{selectedCountry.flag}</div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{selectedCountry.country}</h3>
                  <p className="text-white/60 text-sm">
                    {getAvailableDocuments(selectedCountry.countryCode).length} document types supported
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center animate-bounce-gentle">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Select Your Country</h3>
                  <p className="text-white/60 text-sm">Choose your region for verification</p>
                </div>
              </>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2"
          >
            <ChevronDown className="h-5 w-5 text-white/80" />
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
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-blue-400/40 rounded-2xl overflow-hidden shadow-2xl"
            style={{ zIndex: 10000 }}
            tabIndex={0}
            aria-label="Country dropdown list"
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Countries List */}
            <div className="max-h-80 overflow-y-auto">
              {!searchQuery && (
                <div className="p-4 border-b border-slate-700/50">
                  <h4 className="text-slate-200 text-sm font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-400" />
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
                          p-4 rounded-xl text-left transition-all duration-200 border border-transparent
                          hover:bg-blue-500/10 hover:border-blue-400/50 focus:bg-blue-500/20 focus:border-blue-400/80
                          ${selectedCountry?.countryCode === country.countryCode ? 'bg-blue-500/20 border-blue-400/80' : 'bg-slate-800/30'}
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        tabIndex={0}
                        aria-label={`Select ${country.country}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg animate-bounce-gentle">{country.flag}</span>
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
                  <h4 className="text-slate-200 text-sm font-medium mb-3 px-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
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
                          hover:bg-slate-700/50 hover:border-slate-600/50
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
                                <span className="text-slate-300 text-xs bg-slate-700/50 px-2 py-1 rounded-full">
                                  {country.countryCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-slate-400" />
                                  <span className="text-slate-400 text-xs">
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
                            className="mt-3 pt-3 border-t border-slate-700/50"
                          >
                            <div className="flex flex-wrap gap-2">
                              {getAvailableDocuments(country.countryCode).map((docType) => (
                                <span
                                  key={docType}
                                  className="text-xs bg-slate-700/50 text-slate-200 px-2 py-1 rounded-lg"
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
                    <Globe className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300">No countries found matching "{searchQuery}"</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center justify-between text-xs text-slate-400">
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
          className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          style={{ zIndex: 10001 }}
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