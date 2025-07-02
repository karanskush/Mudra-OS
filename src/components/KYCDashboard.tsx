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
      case 'verified': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'under_review': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'pending': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
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
    if (score < 30) return { level: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    if (score < 60) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    return { level: 'High', color: 'text-red-400', bgColor: 'bg-red-500/10' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <h3 className="text-white font-medium">Loading Dashboard</h3>
            <p className="text-white/60 text-sm">Preparing your KYC analytics...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-purple-600/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-cyan-600/10" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          variants={pulseVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl"
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
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <BarChart3 className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    KYC Management
                  </h1>
                  <p className="text-white/60">Monitor and manage customer verification processes</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm"
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
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-400 backdrop-blur-sm"
              >
                <option value="24h" className="bg-slate-800">Last 24 hours</option>
                <option value="7d" className="bg-slate-800">Last 7 days</option>
                <option value="30d" className="bg-slate-800">Last 30 days</option>
                <option value="90d" className="bg-slate-800">Last 90 days</option>
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
              color: 'from-blue-500 to-cyan-500',
              change: '+12.3%',
              trend: 'up'
            },
            { 
              label: 'Verified', 
              value: stats?.verified || 0, 
              icon: CheckCircle2, 
              color: 'from-emerald-500 to-green-500',
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
              color: 'from-purple-500 to-pink-500',
              change: '+2.1%',
              trend: 'up'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${stat.trend === 'up' 
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                      : 'text-red-400 bg-red-500/10 border border-red-500/20'
                    }`}>
                    {stat.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search customers, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 min-w-[140px]"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="pending" className="bg-slate-800">Pending</option>
                <option value="under_review" className="bg-slate-800">Under Review</option>
                <option value="verified" className="bg-slate-800">Verified</option>
                <option value="rejected" className="bg-slate-800">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button 
                className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-white transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filter</span>
              </motion.button>
              
              <div className="flex bg-white/5 border border-white/20 rounded-xl p-1">
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  List
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
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
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left text-white/80 font-semibold p-6">Customer</th>
                    <th className="text-left text-white/80 font-semibold p-6">Location</th>
                    <th className="text-left text-white/80 font-semibold p-6">Status</th>
                    <th className="text-left text-white/80 font-semibold p-6">Risk Score</th>
                    <th className="text-left text-white/80 font-semibold p-6">Amount</th>
                    <th className="text-left text-white/80 font-semibold p-6">Priority</th>
                    <th className="text-left text-white/80 font-semibold p-6">Submitted</th>
                    <th className="text-left text-white/80 font-semibold p-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredSubmissions.map((submission, index) => {
                      const risk = getRiskLevel(submission.risk_score);
                      return (
                        <motion.tr
                          key={submission.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300 group"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          <td className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                                {submission.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                                  {submission.name}
                                </p>
                                <p className="text-white/60 text-sm">{submission.email}</p>
                                <p className="text-white/50 text-xs">{submission.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-white/60" />
                              <span className="text-white/80 text-sm">{submission.location}</span>
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
                                <p className="text-white/50 text-xs">Risk Score</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="text-white font-medium">
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
                              <Calendar className="h-4 w-4 text-white/60" />
                              <div className="text-white/80 text-sm">
                                <div>{new Date(submission.submitted_at).toLocaleDateString()}</div>
                                <div className="text-white/50 text-xs">{formatTimeAgo(submission.submitted_at)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center space-x-2">
                              <motion.button 
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors duration-300"
                                onClick={() => setSelectedSubmission(submission)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye className="h-4 w-4" />
                              </motion.button>
                              <motion.button 
                                className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FileText className="h-4 w-4" />
                              </motion.button>
                              <div className="relative">
                                <motion.button 
                                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-300"
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
                      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      onClick={() => setSelectedSubmission(submission)}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                          {submission.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <h3 className="text-white font-medium group-hover:text-blue-300 transition-colors">
                          {submission.name}
                        </h3>
                        <p className="text-white/60 text-sm">{submission.email}</p>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-white/50" />
                          <span className="text-white/50 text-xs">{submission.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${risk.bgColor}`}>
                            <span className={`text-xs font-bold ${risk.color}`}>{submission.risk_score}</span>
                          </div>
                          <span className={`text-xs ${risk.color}`}>{risk.level}</span>
                        </div>
                        <span className="text-white/80 text-sm font-medium">
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
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-white/30" />
              </div>
              <h3 className="text-white/80 text-lg font-medium mb-2">No submissions found</h3>
              <p className="text-white/60">Try adjusting your search or filter criteria</p>
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
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="h-5 w-5" />
              <span>Export Report</span>
            </motion.button>
            <motion.button 
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="h-5 w-5" />
              <span>Bulk Actions</span>
            </motion.button>
          </div>
          
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span>Showing {filteredSubmissions.length} of {submissions.length} submissions</span>
            <div className="flex items-center gap-2">
              <span>Avg. processing time:</span>
              <span className="text-blue-400 font-medium">{stats?.averageProcessingTime}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedSubmission.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedSubmission.name}</h3>
                    <p className="text-white/70">KYC Submission Details</p>
                  </div>
                </div>
                <motion.button 
                  onClick={() => setSelectedSubmission(null)}
                  className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-400" />
                      Customer Information
                    </h4>
                    <div className="space-y-3 bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Email:</span>
                        <span className="text-white font-medium">{selectedSubmission.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Phone:</span>
                        <span className="text-white font-medium">{selectedSubmission.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Location:</span>
                        <span className="text-white font-medium">{selectedSubmission.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Country:</span>
                        <span className="text-white font-medium">{selectedSubmission.country}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                      Risk Assessment
                    </h4>
                    <div className="space-y-3 bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Risk Score:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-lg">{selectedSubmission.risk_score}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevel(selectedSubmission.risk_score).color} ${getRiskLevel(selectedSubmission.risk_score).bgColor}`}>
                            {getRiskLevel(selectedSubmission.risk_score).level}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount:</span>
                        <span className="text-white font-medium">
                          {selectedSubmission.amount ? formatCurrency(selectedSubmission.amount) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Submitted:</span>
                        <span className="text-white font-medium">
                          {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedSubmission.verified_at && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Verified:</span>
                          <span className="text-white font-medium">
                            {new Date(selectedSubmission.verified_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents section */}
                <div className="space-y-4">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-400" />
                    Documents ({selectedSubmission.documents.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedSubmission.documents.map((doc, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="text-white font-medium capitalize">{doc.type}</span>
                            <p className="text-white/60 text-sm">
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
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-yellow-400" />
                      Notes
                    </h4>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-white/80">{selectedSubmission.notes}</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                  <motion.button 
                    onClick={() => {
                      handleStatusUpdate(selectedSubmission.id, 'verified');
                      setSelectedSubmission(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25"
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
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Reject</span>
                  </motion.button>
                  <motion.button 
                    className="px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white py-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
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