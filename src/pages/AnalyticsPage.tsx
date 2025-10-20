import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Analytics {
  total_claims: number
  critical_errors: number
  warnings: number
  approved_claims: number
  denial_rate: number
  revenue_protected: number
  claims_per_day: Array<{
    date: string
    claims_processed: number
    errors_found: number
    revenue: number
  }>
  error_patterns: Array<{
    rule_name: string
    count: number
    severity: string
  }>
}

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const result = await invoke<Analytics>('get_analytics')
      setAnalytics(result)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      await invoke('export_claims', { 
        claimIds: [], 
        format: 'pdf' 
      })
      // Show success message
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const COLORS = ['#ef4444', '#f59e0b', '#22c55e']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
        <p className="text-gray-500">Analytics data is not available yet.</p>
      </div>
    )
  }

  // Mock data for charts (in real app, this would come from the backend)
  const dailyData = [
    { date: '2024-01-01', claims_processed: 45, errors_found: 12, revenue: 6750 },
    { date: '2024-01-02', claims_processed: 52, errors_found: 8, revenue: 7800 },
    { date: '2024-01-03', claims_processed: 38, errors_found: 15, revenue: 5700 },
    { date: '2024-01-04', claims_processed: 61, errors_found: 6, revenue: 9150 },
    { date: '2024-01-05', claims_processed: 47, errors_found: 11, revenue: 7050 },
  ]

  const errorPatterns = [
    { name: 'Missing CPT Codes', value: analytics.critical_errors, severity: 'Critical' },
    { name: 'Missing Patient Info', value: analytics.warnings, severity: 'Warning' },
    { name: 'Approved Claims', value: analytics.approved_claims, severity: 'Approved' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track performance metrics and identify improvement opportunities
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-auto"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          
          <button
            onClick={exportReport}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Claims</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.total_claims}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Critical Errors</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.critical_errors}</p>
              <p className="text-xs text-red-600">
                {analytics.total_claims > 0 
                  ? `${Math.round((analytics.critical_errors / analytics.total_claims) * 100)}% of total`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Warnings</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.warnings}</p>
              <p className="text-xs text-yellow-600">
                {analytics.total_claims > 0 
                  ? `${Math.round((analytics.warnings / analytics.total_claims) * 100)}% of total`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved Claims</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.approved_claims}</p>
              <p className="text-xs text-green-600">
                {analytics.total_claims > 0 
                  ? `${Math.round((analytics.approved_claims / analytics.total_claims) * 100)}% of total`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Denial Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue Protected</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analytics.revenue_protected.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Denial Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.denial_rate.toFixed(1)}%
              </p>
              <p className="text-xs text-red-600">
                <TrendingDown className="h-3 w-3 inline mr-1" />
                -3.2% from last month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Claims Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Claims Processed Daily</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="claims_processed" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Error Patterns Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Error Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={errorPatterns}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {errorPatterns.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {analytics.total_claims > 0 
                ? Math.round((analytics.approved_claims / analytics.total_claims) * 100)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              ${Math.round(analytics.revenue_protected / Math.max(analytics.approved_claims, 1))}
            </div>
            <div className="text-sm text-gray-600">Average Claim Value</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {analytics.total_claims > 0 
                ? Math.round((analytics.warnings / analytics.total_claims) * 100)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Warning Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage

