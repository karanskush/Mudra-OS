import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { KYCApi, type KYCSubmission, type KYCStats } from '../lib/kycApi';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  Eye,
  FileText,
  Download,
  MoreVertical,
  Shield,
  AlertTriangle,
  Verified,
  User,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
  Zap,
  Award,
  BadgeCheck,
  RefreshCw,
  Settings,
  Bell,
  Globe,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  Phone,
  Mail,
  CreditCard,
  Building2,
  Fingerprint,
  ScanLine,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock4,
  UserCheck,
  FileX,
  Sparkles
} from 'lucide-react';

// Using interfaces from kycApi.ts

interface DashboardStats {
  totalSubmissions: number;
  verified: number;
  pending: number;
  rejected: number;
  averageProcessingTime: string;
  successRate: number;
  monthlyGrowth: number;
}

// Enhanced animation variants with advanced fintech effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
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
    rotateX: -10,
    rotateY: 5
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  hover: {
    scale: 1.02,
    y: -8,
    rotateX: 2,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      duration: 0.3,
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

const statsVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
};

const floatingVariants = {
  animate: {
    y: [-8, 8, -8],
    rotate: [0, 3, 0, -3, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.03, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const KYCDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<KYCSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Load real data from API
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load submissions and stats in parallel
      const [submissionsData, statsData] = await Promise.all([
        KYCApi.getDashboardSubmissions(),
        KYCApi.getDashboardStats()
      ]);

      setSubmissions(submissionsData);
      setFilteredSubmissions(submissionsData);
      setStats({
        totalSubmissions: statsData.total_submissions,
        verified: statsData.verified,
        pending: statsData.pending,
        rejected: statsData.rejected,
        averageProcessingTime: statsData.average_processing_time,
        successRate: statsData.success_rate,
        monthlyGrowth: statsData.monthly_growth
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Show error message but don't crash
      setSubmissions([]);
      setFilteredSubmissions([]);
      setStats({
        totalSubmissions: 0,
        verified: 0,
        pending: 0,
        rejected: 0,
        averageProcessingTime: 'N/A',
        successRate: 0,
        monthlyGrowth: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced filtering logic
  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, statusFilter, submissions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-brand-300 bg-brand-500/10 border-brand-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'under_review': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'pending': return 'text-brand-300 bg-brand-500/10 border-brand-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'under_review': return <Clock4 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-brand-300', bgColor: 'bg-brand-500/10' };
    if (score < 60) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    return { level: 'High', color: 'text-red-400', bgColor: 'bg-red-500/10' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-brand-500/15 text-brand-300 border-brand-500/25';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      await KYCApi.updateSubmissionStatus(submissionId, newStatus);
      // Reload data after successful update
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update status:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[rgba(46,111,64,0.30)] border-t-[#68BA7F] rounded-full mx-auto"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <h3 className="text-primary font-medium">Loading Dashboard</h3>
            <p className="text-slate-500 text-sm">Preparing your KYC analytics...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-accent/[0.03]" />
        <div className="absolute inset-0 bg-transparent" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
          variants={pulseVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div 
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-xl flex items-center justify-center shadow-lg shadow-[rgba(46,111,64,0.25)]"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <BarChart3 className="h-6 w-6 text-primary" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r text-primary">
                    KYC Management
                  </h1>
                  <p className="text-slate-500">Monitor and manage customer verification processes</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface border border-outline-variant text-primary rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span className="text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </motion.button>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-surface border border-outline-variant rounded-xl px-4 py-2 text-primary text-sm focus:outline-none focus:border-accent/40"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { 
              label: 'Total Submissions', 
              value: stats?.totalSubmissions || 0, 
              icon: Users, 
              color: 'from-[#2E6F40] to-[#68BA7F]',
              change: '+12.3%',
              trend: 'up'
            },
            { 
              label: 'Verified', 
              value: stats?.verified || 0, 
              icon: CheckCircle2, 
              color: 'from-brand-500 to-brand-300',
              change: '+8.7%',
              trend: 'up'
            },
            { 
              label: 'Pending Review', 
              value: stats?.pending || 0, 
              icon: Clock4, 
              color: 'from-yellow-500 to-orange-500',
              change: '-5.2%',
              trend: 'down'
            },
            { 
              label: 'Success Rate', 
              value: `${stats?.successRate || 0}%`, 
              icon: Target, 
              color: 'from-[#253D2C] to-[#2E6F40]',
              change: '+2.1%',
              trend: 'up'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white border border-outline-variant rounded-2xl p-6 relative overflow-hidden group shadow-premium"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${stat.trend === 'up' 
                      ? 'text-secondary bg-accent/10 border border-accent/20' 
                      : 'text-red-600 bg-red-50 border border-red-200'
                    }`}>
                    {stat.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div 
          className="bg-surface border border-outline-variant rounded-2xl p-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-xl pl-12 pr-4 py-3 text-primary placeholder:text-slate-400 focus:outline-none focus:border-accent/40 transition-all duration-300"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface border border-outline-variant rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-accent/40 min-w-[140px]"
              >
                <option value="all" className="bg-white">All Status</option>
                <option value="pending" className="bg-white">Pending</option>
                <option value="under_review" className="bg-white">Under Review</option>
                <option value="verified" className="bg-white">Verified</option>
                <option value="rejected" className="bg-white">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button 
                className="bg-surface hover:bg-white border border-outline-variant rounded-xl px-4 py-3 text-primary transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filter</span>
              </motion.button>
              
              <div className="flex bg-surface border border-outline-variant rounded-xl p-1">
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-primary text-primary shadow-lg' 
                      : 'text-slate-500 hover:text-primary hover:bg-surface'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  List
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-primary shadow-lg' 
                      : 'text-slate-500 hover:text-primary hover:bg-surface'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  Grid
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Submissions Table/Grid */}
        <motion.div 
          className="bg-surface border border-outline-variant rounded-2xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface">
                    <th className="text-left text-slate-600 font-semibold p-6">Customer</th>
                    <th className="text-left text-slate-600 font-semibold p-6">Location</th>
                    <th className="text-left text-slate-600 font-semibold p-6">Status</th>
                    <th className="text-left text-slate-600 font-semibold p-6">Risk Score</th>
                    <th className="text-left text-slate-600 font-semibold p-6">Amount</th>
                    <th className="text-left text-slate-600 font-semibold p-6">Priority</th>
                    <th className="text-left text-slate-700 font-semibold p-6">Submitted</th>
                    <th className="text-left text-slate-700 font-semibold p-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredSubmissions.map((submission, index) => {
                      const risk = getRiskLevel(submission.risk_score);
                      return (
                        <motion.tr
                          key={submission.id}
                          className="border-b border-outline-variant hover:bg-surface transition-colors duration-300 group"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          <td className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-full flex items-center justify-center text-primary font-semibold shadow-lg">
                                {submission.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-primary font-medium group-hover:text-brand-300 transition-colors">
                                  {submission.name}
                                </p>
                                <p className="text-slate-500 text-sm">{submission.email}</p>
                                <p className="text-slate-400 text-xs">{submission.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-700 text-sm">{submission.location}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                              {getStatusIcon(submission.status)}
                              <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${risk.bgColor}`}>
                                <span className={`text-sm font-bold ${risk.color}`}>{submission.risk_score}</span>
                              </div>
                              <div>
                                <span className={`font-medium ${risk.color} text-sm`}>{risk.level}</span>
                                <p className="text-slate-400 text-xs">Risk Score</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="text-primary font-medium">
                              {submission.amount ? formatCurrency(submission.amount) : 'N/A'}
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(submission.priority || 'low')}`}>
                              {submission.priority?.toUpperCase() || 'LOW'}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <div className="text-slate-700 text-sm">
                                <div>{new Date(submission.submitted_at).toLocaleDateString()}</div>
                                <div className="text-slate-400 text-xs">{formatTimeAgo(submission.submitted_at)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center space-x-2">
                              <motion.button 
                                className="p-2 bg-[rgba(46,111,64,0.15)] hover:bg-[rgba(46,111,64,0.25)] text-brand-300 rounded-lg transition-colors duration-300"
                                onClick={() => setSelectedSubmission(submission)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye className="h-4 w-4" />
                              </motion.button>
                              <motion.button 
                                className="p-2 bg-[rgba(37,61,44,0.30)] hover:bg-[rgba(37,61,44,0.45)] text-[#CFFFDC] rounded-lg transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FileText className="h-4 w-4" />
                              </motion.button>
                              <div className="relative">
                                <motion.button 
                                  className="p-2 bg-surface hover:bg-white text-primary rounded-lg transition-colors duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            // Grid view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              <AnimatePresence>
                {filteredSubmissions.map((submission, index) => {
                  const risk = getRiskLevel(submission.risk_score);
                  return (
                    <motion.div
                      key={submission.id}
                      className="bg-surface border border-outline-variant rounded-xl p-6 hover:bg-surface transition-all duration-300 group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      onClick={() => setSelectedSubmission(submission)}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-full flex items-center justify-center text-primary font-semibold shadow-lg">
                          {submission.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <h3 className="text-primary font-medium group-hover:text-brand-300 transition-colors">
                          {submission.name}
                        </h3>
                        <p className="text-slate-500 text-sm">{submission.email}</p>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-400 text-xs">{submission.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${risk.bgColor}`}>
                            <span className={`text-xs font-bold ${risk.color}`}>{submission.risk_score}</span>
                          </div>
                          <span className={`text-xs ${risk.color}`}>{risk.level}</span>
                        </div>
                        <span className="text-slate-700 text-sm font-medium">
                          {submission.amount ? formatCurrency(submission.amount) : 'N/A'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {filteredSubmissions.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-slate-700 text-lg font-medium mb-2">No submissions found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div 
          className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-4">
            <motion.button 
              className="bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] hover:from-[#253D2C] hover:to-[#2E6F40] text-primary px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 shadow-lg shadow-[rgba(46,111,64,0.25)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="h-5 w-5" />
              <span>Export Report</span>
            </motion.button>
            <motion.button 
              className="bg-surface hover:bg-surface/80 border border-outline-variant text-primary px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="h-5 w-5" />
              <span>Bulk Actions</span>
            </motion.button>
          </div>
          
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span>Showing {filteredSubmissions.length} of {submissions.length} submissions</span>
            <div className="flex items-center gap-2">
              <span>Avg. processing time:</span>
              <span className="text-brand-300 font-medium">{stats?.averageProcessingTime}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div 
            className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div 
              className="bg-surface border border-outline-variant rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#2E6F40] to-[#68BA7F] rounded-xl flex items-center justify-center text-primary font-bold text-lg shadow-lg">
                    {selectedSubmission.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{selectedSubmission.name}</h3>
                    <p className="text-slate-500">KYC Submission Details</p>
                  </div>
                </div>
                <motion.button 
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-500 hover:text-primary p-2 hover:bg-surface rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Modal content */}
              <div className="space-y-8">
                {/* Status and priority */}
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium border ${getStatusColor(selectedSubmission.status)}`}>
                    {getStatusIcon(selectedSubmission.status)}
                    <span className="capitalize">{selectedSubmission.status.replace('_', ' ')}</span>
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(selectedSubmission.priority || 'low')}`}>
                    {selectedSubmission.priority?.toUpperCase() || 'LOW'} PRIORITY
                  </span>
                </div>

                {/* Customer details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-primary font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-brand-300" />
                      Customer Information
                    </h4>
                    <div className="space-y-3 bg-surface rounded-xl p-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-primary font-medium">{selectedSubmission.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="text-primary font-medium">{selectedSubmission.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-primary font-medium">{selectedSubmission.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Country:</span>
                        <span className="text-primary font-medium">{selectedSubmission.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-primary font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#CFFFDC]" />
                      Risk Assessment
                    </h4>
                    <div className="space-y-3 bg-surface rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Risk Score:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold text-lg">{selectedSubmission.risk_score}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevel(selectedSubmission.risk_score).color} ${getRiskLevel(selectedSubmission.risk_score).bgColor}`}>
                            {getRiskLevel(selectedSubmission.risk_score).level}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount:</span>
                        <span className="text-primary font-medium">
                          {selectedSubmission.amount ? formatCurrency(selectedSubmission.amount) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Submitted:</span>
                        <span className="text-primary font-medium">
                          {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedSubmission.verified_at && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Verified:</span>
                          <span className="text-primary font-medium">
                            {new Date(selectedSubmission.verified_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents section */}
                <div className="space-y-4">
                  <h4 className="text-primary font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-300" />
                    Documents ({selectedSubmission.documents.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedSubmission.documents.map((doc, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center justify-between bg-surface rounded-xl p-4 hover:bg-surface transition-colors duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-300 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="text-primary font-medium capitalize">{doc.type}</span>
                            <p className="text-slate-500 text-sm">
                              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Notes section */}
                {selectedSubmission.notes && (
                  <div className="space-y-4">
                    <h4 className="text-primary font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-yellow-400" />
                      Notes
                    </h4>
                    <div className="bg-surface rounded-xl p-4">
                      <p className="text-slate-700">{selectedSubmission.notes}</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-outline-variant">
                  <motion.button 
                    onClick={() => {
                      handleStatusUpdate(selectedSubmission.id, 'verified');
                      setSelectedSubmission(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500 text-primary py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Approve</span>
                  </motion.button>
                  <motion.button 
                    onClick={() => {
                      handleStatusUpdate(selectedSubmission.id, 'rejected');
                      setSelectedSubmission(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-primary py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Reject</span>
                  </motion.button>
                  <motion.button 
                    className="px-6 bg-surface hover:bg-surface/80 border border-outline-variant text-primary py-3 rounded-xl transition-all duration-300 "
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Request Info
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KYCDashboard; 