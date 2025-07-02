import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Shield, 
  FileCheck, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User,
  CreditCard,
  Camera,
  Upload,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Flag,
  Settings,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  Zap,
  Award,
  BadgeCheck,
  Fingerprint,
  ShieldCheck,
  FileText,
  Scan,
  Image,
  X,
  TrendingUp,
  Database,
  Layers,
  Grid,
  MousePointer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cloud,
  FileImage,
  Download,
  Timer,
  Target,
  Users,
  BarChart3
} from 'lucide-react';
import KYCApi, { Country, KYCStatus } from '../lib/kycApi';

// Enhanced animation variants with advanced fintech effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const cardVariants = {
  hidden: { 
    scale: 0.9, 
    opacity: 0, 
    y: 40,
    rotateX: -15
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: {
    scale: 1.03,
    y: -8,
    rotateX: 5,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const progressVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut"
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [0, 5, 0, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const KYCFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [documentUploads, setDocumentUploads] = useState<Record<string, File | null>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [dragOver, setDragOver] = useState<string | null>(null);

  const steps = [
    { 
      title: 'Country Selection', 
      icon: Globe, 
      description: 'Choose your verification region',
      color: 'from-blue-500 via-blue-600 to-cyan-500',
      bgPattern: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      shadowColor: 'shadow-blue-500/20',
      borderColor: 'border-blue-200/50',
      estimatedTime: '30s'
    },
    { 
      title: 'Document Upload', 
      icon: Upload, 
      description: 'Secure document verification',
      color: 'from-purple-500 via-purple-600 to-pink-500',
      bgPattern: 'bg-gradient-to-br from-purple-50 to-pink-50',
      shadowColor: 'shadow-purple-500/20',
      borderColor: 'border-purple-200/50',
      estimatedTime: '2m'
    },
    { 
      title: 'Identity Verification', 
      icon: Shield, 
      description: 'Aadhaar authentication',
      color: 'from-green-500 via-green-600 to-emerald-500',
      bgPattern: 'bg-gradient-to-br from-green-50 to-emerald-50',
      shadowColor: 'shadow-green-500/20',
      borderColor: 'border-green-200/50',
      estimatedTime: '45s'
    },
    { 
      title: 'Tax Verification', 
      icon: CreditCard, 
      description: 'PAN card validation',
      color: 'from-orange-500 via-orange-600 to-red-500',
      bgPattern: 'bg-gradient-to-br from-orange-50 to-red-50',
      shadowColor: 'shadow-orange-500/20',
      borderColor: 'border-orange-200/50',
      estimatedTime: '1m'
    },
    { 
      title: 'Completion', 
      icon: CheckCircle, 
      description: 'Account activation ready',
      color: 'from-emerald-500 via-emerald-600 to-teal-500',
      bgPattern: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      shadowColor: 'shadow-emerald-500/20',
      borderColor: 'border-emerald-200/50',
      estimatedTime: 'Instant'
    }
  ];

  // Fetch available countries
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      const countriesData = await KYCApi.getCountries();
      setCountries(countriesData);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setErrors({ general: 'Failed to load countries. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const startKYC = async (country: Country) => {
    setIsLoading(true);
    setErrors({});
    try {
      const kycData = await KYCApi.startKYC({
        user_id: 'user_123',
        country: country.country,
      });
      setKycStatus(kycData);
      setSelectedCountry(country);
      setCurrentStep(1);
      setSuccessMessage(`KYC process initiated for ${country.description}`);
    } catch (error) {
      console.error('Error starting KYC:', error);
      setErrors({ general: 'Failed to start KYC process. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDocument = async (documentType: string, documentNumber: string) => {
    setIsLoading(true);
    setErrors({});
    
    if (documentType === 'aadhaar' && !KYCApi.validateAadhaarNumber(documentNumber)) {
      setErrors({ [documentType]: 'Please enter a valid 12-digit Aadhaar number' });
      setIsLoading(false);
      return false;
    }
    
    if (documentType === 'pan' && !KYCApi.validatePANNumber(documentNumber)) {
      setErrors({ [documentType]: 'Please enter a valid PAN number (e.g., ABCDE1234F)' });
      setIsLoading(false);
      return false;
    }

    try {
      const verificationResult = await KYCApi.verifyDocument(documentType, {
        document_number: documentNumber,
        user_id: 'user_123',
        country: selectedCountry?.country || 'IN',
      });

      if (verificationResult.valid) {
        if (kycStatus) {
          const updatedStatus = { ...kycStatus };
          updatedStatus.documents[documentType] = {
            status: 'verified',
            verifiedAt: new Date().toISOString(),
          };
          updatedStatus.progress += 25;
          setKycStatus(updatedStatus);
        }
        setSuccessMessage(`${documentType.toUpperCase()} verified successfully!`);
        return true;
      } else {
        setErrors({ [documentType]: 'Document verification failed. Please check your details.' });
        return false;
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setErrors({ [documentType]: 'Verification failed. Please try again.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (documentType: string, file: File) => {
    setDocumentUploads(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleDragOver = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(documentType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(documentType, files[0]);
    }
  };

  const renderCountrySelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6">
          <Globe className="h-5 w-5 text-blue-400" />
          <span className="text-white/90 font-medium">Global Verification Network</span>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Select Your Country
        </h3>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          Choose your country to see verification requirements and start your secure onboarding journey
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid gap-4 max-w-2xl mx-auto">
        {countries.map((country, index) => (
          <motion.div
            key={country.country}
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-500 relative overflow-hidden"
            onClick={() => startKYC(country)}
            style={{ "--index": index } as React.CSSProperties}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Flag className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                    {country.description}
                  </h4>
                  <p className="text-white/60 text-sm mt-1">
                    Required: <span className="text-blue-300">{country.documents.join(', ')}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Instant Verification</span>
                  </div>
                </div>
              </div>
              <motion.div
                className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <ArrowRight className="h-6 w-6" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust indicators */}
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-8 pt-8">
        <div className="flex items-center gap-2 text-white/60">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <span className="text-sm">Bank-grade Security</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span className="text-sm">Instant Processing</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Award className="h-5 w-5 text-purple-400" />
          <span className="text-sm">Globally Compliant</span>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderDocumentUpload = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6">
          <FileText className="h-5 w-5 text-purple-400" />
          <span className="text-white/90 font-medium">Document Verification</span>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Upload Your Documents
        </h3>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          Upload clear, high-quality photos of your documents for instant verification
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 max-w-2xl mx-auto">
        {selectedCountry?.documents.map((docType, index) => (
          <motion.div 
            key={docType} 
            variants={cardVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white capitalize">
                  {docType} Document
                </h4>
              </div>
              {documentUploads[docType] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1"
                >
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Uploaded</span>
                </motion.div>
              )}
            </div>
            
            <div 
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                ${dragOver === docType 
                  ? 'border-purple-400 bg-purple-500/10' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }
              `}
              onDragOver={(e) => handleDragOver(e, docType)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, docType)}
            >
              <input
                type="file"
                id={`upload-${docType}`}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(docType, e.target.files[0])}
              />
              <label htmlFor={`upload-${docType}`} className="cursor-pointer block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="space-y-4"
                >
                  {documentUploads[docType] ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <Image className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-green-400 font-medium">
                        {documentUploads[docType]?.name}
                      </p>
                      <p className="text-white/60 text-sm">File uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-white/80 font-medium">
                        Drop your file here or click to upload
                      </p>
                      <p className="text-white/60 text-sm">
                        PNG, JPG up to 5MB • Ensure document is clearly visible
                      </p>
                    </div>
                  )}
                </motion.div>
              </label>
            </div>

            {/* Document requirements */}
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <h5 className="text-white/90 font-medium text-sm">Requirements:</h5>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• Clear, readable text</li>
                <li>• All corners visible</li>
                <li>• No glare or shadows</li>
                <li>• Original document (not photocopy)</li>
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderAadhaarVerification = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6">
          <Fingerprint className="h-5 w-5 text-green-400" />
          <span className="text-white/90 font-medium">Identity Verification</span>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Aadhaar Verification
        </h3>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          Enter your 12-digit Aadhaar number for secure identity verification
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-lg mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                Aadhaar Number
              </label>
              <div className="relative">
                <input
                  type={showAadhaar ? "text" : "password"}
                  value={aadhaarNumber}
                  onChange={(e) => {
                    const formatted = KYCApi.formatAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12));
                    setAadhaarNumber(formatted);
                    if (errors.aadhaar) setErrors(prev => ({ ...prev, aadhaar: '' }));
                  }}
                  placeholder="XXXX XXXX XXXX"
                  className={`
                    w-full bg-white/5 border rounded-xl px-4 py-4 text-white placeholder-white/40 
                    focus:outline-none focus:ring-2 transition-all duration-300 text-lg tracking-wider
                    ${errors.aadhaar 
                      ? 'border-red-500/50 focus:border-red-400 focus:ring-red-400/20' 
                      : 'border-white/20 focus:border-green-400 focus:ring-green-400/20'
                    }
                  `}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowAadhaar(!showAadhaar)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showAadhaar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </motion.button>
              </div>
              
              {/* Real-time validation indicator */}
              {aadhaarNumber && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2"
                >
                  {aadhaarNumber.replace(/\s/g, '').length === 12 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-sm">Valid format</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm">
                        {12 - aadhaarNumber.replace(/\s/g, '').length} digits remaining
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {errors.aadhaar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errors.aadhaar}</p>
              </motion.div>
            )}

            {aadhaarNumber.replace(/\s/g, '').length === 12 && !errors.aadhaar && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => verifyDocument('aadhaar', aadhaarNumber.replace(/\s/g, ''))}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-green-500/25"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    Verify Aadhaar
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Security notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium text-sm">Security Notice</span>
            </div>
            <p className="text-white/70 text-xs">
              Your Aadhaar information is encrypted and processed securely. We never store your complete Aadhaar number.
            </p>
          </div>
        </div>

        {kycStatus?.documents.aadhaar?.status === 'verified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <BadgeCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-green-400 font-semibold">Aadhaar Verified Successfully</p>
              <p className="text-green-300/80 text-sm">Your identity has been confirmed securely</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderPANVerification = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6">
          <CreditCard className="h-5 w-5 text-orange-400" />
          <span className="text-white/90 font-medium">Tax Verification</span>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          PAN Verification
        </h3>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          Enter your PAN card number for tax compliance verification
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-lg mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-400" />
                PAN Number
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => {
                  setPanNumber(e.target.value.toUpperCase().slice(0, 10));
                  if (errors.pan) setErrors(prev => ({ ...prev, pan: '' }));
                }}
                placeholder="ABCDE1234F"
                className={`
                  w-full bg-white/5 border rounded-xl px-4 py-4 text-white placeholder-white/40 
                  focus:outline-none focus:ring-2 transition-all duration-300 text-lg tracking-wider uppercase
                  ${errors.pan 
                    ? 'border-red-500/50 focus:border-red-400 focus:ring-red-400/20' 
                    : 'border-white/20 focus:border-orange-400 focus:ring-orange-400/20'
                  }
                `}
              />
              
              {panNumber && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2"
                >
                  {panNumber.length === 10 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-sm">Valid format</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm">
                        {10 - panNumber.length} characters remaining
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {errors.pan && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errors.pan}</p>
              </motion.div>
            )}

            {panNumber.length === 10 && !errors.pan && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => verifyDocument('pan', panNumber)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-orange-500/25"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    Verify PAN
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* PAN format guide */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-medium text-sm">PAN Format</span>
            </div>
            <p className="text-white/70 text-xs">
              Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
            </p>
          </div>
        </div>

        {kycStatus?.documents.pan?.status === 'verified' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6 flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <BadgeCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-orange-400 font-semibold">PAN Verified Successfully</p>
              <p className="text-orange-300/80 text-sm">Tax information confirmed and validated</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderReviewComplete = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-6"
        >
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span className="text-white/90 font-medium">Verification Complete</span>
        </motion.div>
        <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Welcome to the Future!
        </h3>
        <p className="text-white/70 text-lg max-w-md mx-auto">
          Your identity verification is complete. Welcome to our fintech ecosystem.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50"
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>
            
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-white">Account Successfully Verified!</h4>
              <p className="text-white/80 max-w-md mx-auto">
                You now have full access to all premium features. Start exploring our comprehensive financial platform.
              </p>
            </div>

            {/* Verification status grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 gap-4 max-w-md mx-auto"
            >
              <motion.div variants={itemVariants} className="bg-white/10 rounded-2xl p-4 space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <p className="text-white text-sm font-medium">Identity</p>
                <p className="text-green-400 text-xs">Verified</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-white/10 rounded-2xl p-4 space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <p className="text-white text-sm font-medium">Tax Info</p>
                <p className="text-orange-400 text-xs">Verified</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-white/10 rounded-2xl p-4 space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <p className="text-white text-sm font-medium">Documents</p>
                <p className="text-purple-400 text-xs">Validated</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-white/10 rounded-2xl p-4 space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto">
                  <BadgeCheck className="h-4 w-4 text-white" />
                </div>
                <p className="text-white text-sm font-medium">Account</p>
                <p className="text-blue-400 text-xs">Active</p>
              </motion.div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25"
              >
                <Zap className="h-5 w-5" />
                Access Dashboard
              </motion.button>
              
              <Link to="/kyc/dashboard" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25"
                >
                  <Settings className="h-5 w-5" />
                  Admin Panel
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success metrics */}
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-8 pt-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">30s</div>
          <div className="text-white/60 text-sm">Avg. Verification Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-teal-400">99.9%</div>
          <div className="text-white/60 text-sm">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">24/7</div>
          <div className="text-white/60 text-sm">Support Available</div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderCountrySelection();
      case 1: return renderDocumentUpload();
      case 2: return renderAadhaarVerification();
      case 3: return renderPANVerification();
      case 4: return renderReviewComplete();
      default: return renderCountrySelection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/90 to-indigo-900 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-purple-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-cyan-600/10" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
        <motion.div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Enhanced header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8 shadow-lg shadow-blue-500/10"
            whileHover={{ scale: 1.05 }}
          >
            <Lock className="h-5 w-5 text-blue-400" />
            <span className="text-white/90 font-medium">Enterprise-Grade Security</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Know Your Customer
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Complete your identity verification with our cutting-edge KYC system. 
            Secure, fast, and compliant with global standards.
          </p>
        </motion.div>

        {/* Enhanced progress indicator */}
        {currentStep > 0 && (
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div 
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center border-2 mb-3 relative overflow-hidden
                      ${index <= currentStep 
                        ? `bg-gradient-to-r ${step.color} border-transparent text-white shadow-lg` 
                        : 'border-white/30 text-white/50 bg-white/5'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    animate={index === currentStep ? { 
                      boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 10px rgba(59, 130, 246, 0)"],
                    } : {}}
                    transition={{ duration: 1.5, repeat: index === currentStep ? Infinity : 0 }}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </motion.div>
                  <div className="text-center max-w-24">
                    <span className="text-xs text-white/70 font-medium block">{step.title}</span>
                    <span className="text-xs text-white/50 block mt-1">{step.description}</span>
                  </div>
                  
                  {/* Progress connector */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-7 left-full w-full h-0.5 bg-white/20 -z-10">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: index < currentStep ? "100%" : "0%" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Overall progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 h-2 rounded-full shadow-lg shadow-blue-500/25"
                variants={progressVariants}
                initial="hidden"
                animate="visible"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {/* Progress text */}
            <div className="flex justify-between items-center mt-3">
              <span className="text-white/60 text-sm">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-white/60 text-sm">
                {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
              </span>
            </div>
          </motion.div>
        )}

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4 mb-6 flex items-center space-x-3 backdrop-blur-xl"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <p className="text-green-400 font-medium flex-1">{successMessage}</p>
              <motion.button 
                onClick={() => setSuccessMessage('')}
                className="text-green-300 hover:text-green-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center space-x-3 backdrop-blur-xl"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <p className="text-red-400 font-medium flex-1">{errors.general}</p>
              <motion.button 
                onClick={() => setErrors(prev => ({ ...prev, general: '' }))}
                className="text-red-300 hover:text-red-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content card */}
        <motion.div 
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/20 relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Card background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep > 0 && currentStep < 4 && (
              <motion.div 
                className="flex justify-between items-center mt-12 pt-8 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={handlePrevious}
                  className="flex items-center space-x-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
                  whileHover={{ scale: 1.02, x: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Previous</span>
                </motion.button>

                <motion.button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 2 && kycStatus?.documents.aadhaar?.status !== 'verified') ||
                    (currentStep === 3 && kycStatus?.documents.pan?.status !== 'verified')
                  }
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KYCFlow; 