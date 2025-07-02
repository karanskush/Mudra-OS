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
import { DiditCountry, getAvailableDocuments, formatDocumentName } from '../lib/diditCountries';
import { diditApi, convertFileToBase64, validateImageFile } from '../lib/diditApi';
import EnhancedCountrySelector from './EnhancedCountrySelector';
import { getSessionUserId } from '../lib/utils';
import { useToast, createToast } from './ui/Toast';
import { FintechBackground } from './ui/fintech-background';

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
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<DiditCountry | null>(null);
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
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890'
  });

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
      showToast(createToast.error(
        'Failed to load countries. Please refresh the page and try again.',
        'Loading Error'
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const startKYC = async (country: DiditCountry) => {
    setIsLoading(true);
    setErrors({});
    try {
      const userId = getSessionUserId();
      const kycData = await KYCApi.startKYC({
        user_id: userId,
        country: country.countryCode,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
      });
      setKycStatus(kycData);
      setSelectedCountry(country);
      setCurrentStep(1);
      showToast(createToast.success(
        `KYC verification process has been successfully initiated for ${country.country}`, 
        'KYC Started',
        { duration: 4000 }
      ));
    } catch (error) {
      console.error('Error starting KYC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start KYC process. Please try again.';
      
      // Show appropriate toast based on error type
      if (errorMessage.includes('already has a KYC submission')) {
        showToast(createToast.warning(
          'You already have an active KYC submission. Please check your verification status.',
          'KYC Already Exists',
          { 
            duration: 6000
          }
        ));
      } else {
        showToast(createToast.error(
          errorMessage,
          'KYC Start Failed',
          { duration: 5000 }
        ));
      }
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
      const userId = getSessionUserId();
      const verificationResult = await KYCApi.verifyDocument(documentType, {
        document_number: documentNumber,
        user_id: userId,
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
        showToast(createToast.success(
          `${documentType.toUpperCase()} verified successfully!`,
          'Document Verified',
          { duration: 3000 }
        ));
        return true;
      } else {
        showToast(createToast.error(
          'Document verification failed. Please check your details and try again.',
          'Verification Failed'
        ));
        return false;
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      showToast(createToast.error(
        'Verification failed. Please try again.',
        'Error'
      ));
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

  const handleFileUpload = async (documentType: string, file: File) => {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast(createToast.warning(
        validation.error || 'Invalid file format or size',
        'File Validation Failed'
      ));
      return;
    }

    setDocumentUploads(prev => ({
      ...prev,
      [documentType]: file
    }));

    // Auto-verify with Didit if country is selected
    if (selectedCountry) {
      setIsLoading(true);
      setErrors(prev => ({ ...prev, [documentType]: '' }));
      
      try {
        const userId = getSessionUserId();
        const verificationResult = await KYCApi.verifyDocumentWithDidit(
          userId,
          documentType,
          file,
          selectedCountry.countryCode
        );

        if (verificationResult.status === 'verified') {
          if (kycStatus) {
            const updatedStatus = { ...kycStatus };
            updatedStatus.documents[documentType] = {
              status: 'verified',
              verifiedAt: new Date().toISOString(),
            };
            updatedStatus.progress += Math.floor(100 / getAvailableDocuments(selectedCountry.countryCode).length);
            setKycStatus(updatedStatus);
          }
          showToast(createToast.success(
            `${formatDocumentName(documentType)} verified successfully!`,
            'Document Verified',
            { duration: 3000 }
          ));
        } else {
          showToast(createToast.error(
            'Document verification failed. Please try again.',
            'Verification Failed'
          ));
        }
      } catch (error) {
        console.error('Error verifying document:', error);
        showToast(createToast.error(
          'Verification failed. Please try again.',
          'Error'
        ));
      } finally {
        setIsLoading(false);
      }
    }
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
      <motion.div variants={itemVariants} className="flex flex-col items-center w-full">
        <EnhancedCountrySelector
          onCountrySelect={startKYC}
          isLoading={isLoading}
          selectedCountry={selectedCountry}
        />
      </motion.div>
      {/* Trust indicators */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-8 pt-8 w-full">
        <div className="flex items-center gap-2 text-white/60">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <span className="text-sm">Enterprise-Grade Security</span>
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
        {selectedCountry && getAvailableDocuments(selectedCountry.countryCode).map((docType, index) => (
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
                <h4 className="text-lg font-semibold text-white">
                  {formatDocumentName(docType)}
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

            {/* Error display */}
            {errors[docType] && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errors[docType]}</p>
              </motion.div>
            )}

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/90 to-indigo-900 relative overflow-visible">
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <FintechBackground />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-24">
        {/* Enhanced header with illustration */}
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex-1 text-center md:text-left">
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              style={{
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.3)',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Know Your Customer
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-blue-100/80 mb-8 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Secure, compliant identity verification powered by enterprise-grade technology. 
              Complete your verification in minutes with our streamlined, user-friendly process.
            </motion.p>
          </div>
          
          {/* KYC Security Illustration */}
          <motion.div 
            className="flex-1 flex justify-center md:justify-end"
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Main illustration container */}
              <motion.div
                className="relative w-80 h-80 md:w-96 md:h-96"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
                
                {/* Security Shield with Neon Effect */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Outer shield glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                      filter: 'blur(20px)',
                    }}
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Main shield SVG */}
                  <motion.svg
                    width="300"
                    height="300"
                    viewBox="0 0 300 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                  >
                    <defs>
                      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#9333ea" />
                      </linearGradient>
                      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Shield outline */}
                    <motion.path
                      d="M150 20 L250 60 L250 140 Q250 200 150 280 Q50 200 50 140 L50 60 Z"
                      stroke="url(#shieldGradient)"
                      strokeWidth="3"
                      fill="none"
                      filter="url(#glow)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                    />
                    
                    {/* ID Card */}
                    <motion.rect
                      x="80"
                      y="100"
                      width="140"
                      height="90"
                      rx="12"
                      fill="url(#cardGradient)"
                      fillOpacity="0.8"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      filter="url(#glow)"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5, duration: 0.8, ease: "backOut" }}
                    />
                    
                    {/* User icon */}
                    <motion.circle
                      cx="110"
                      cy="130"
                      r="12"
                      fill="#06b6d4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2, duration: 0.5 }}
                    />
                    <motion.path
                      d="M95 155 Q110 145 125 155"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 2.2, duration: 0.5 }}
                    />
                    
                    {/* Info lines */}
                    {[140, 150, 160, 170].map((y, index) => (
                      <motion.line
                        key={y}
                        x1="140"
                        y1={y}
                        x2={180 + index * 10}
                        y2={y}
                        stroke="#06b6d4"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 2.3 + index * 0.1, duration: 0.3 }}
                      />
                    ))}
                    
                    {/* Fingerprint */}
                    <motion.g
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 2.8, duration: 1, ease: "backOut" }}
                    >
                      {/* Fingerprint arcs */}
                      {[15, 25, 35, 45].map((radius, index) => (
                        <motion.circle
                          key={radius}
                          cx="180"
                          cy="135"
                          r={radius}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 3 + index * 0.2, duration: 0.8 }}
                        />
                      ))}
                    </motion.g>
                    
                    {/* Lock icon */}
                    <motion.g
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 3.5, duration: 0.8, ease: "backOut" }}
                    >
                      <rect x="165" y="145" width="30" height="20" rx="4" fill="#06b6d4" />
                      <path d="M170 145 V140 Q180 130 190 140 V145" stroke="#06b6d4" strokeWidth="3" fill="none" />
                      <circle cx="180" cy="155" r="3" fill="#1e293b" />
                    </motion.g>
                  </motion.svg>
                </div>
              </motion.div>
              
              {/* Floating particles around illustration */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${10 + (i % 2) * 80}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
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
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/20 relative overflow-visible max-w-4xl mx-auto mt-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Card background pattern */}
          <div className="absolute inset-0 opacity-5 rounded-3xl overflow-hidden">
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