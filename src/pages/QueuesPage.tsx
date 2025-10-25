import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  Eye,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useDemoStore } from '../stores/demoStore'

interface Claim {
  id: string
  filename: string
  payer: string
  patient_name: string
  patient_id: string
  cpt_codes: string[]
  charges: number[]
  service_dates: string[]
  provider_name: string
  validation_errors: Array<{ severity: string; message: string; field: string }>
  queue: string
  created_at: string
}

const QueuesPage: React.FC = () => {
  const { queueType } = useParams<{ queueType?: string }>()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuthStore()
  const { completeStep } = useDemoStore()

  const queueConfig = {
    critical_errors: {
      title: 'Critical Errors Queue',
      icon: AlertTriangle,
      color: 'red',
      description: 'Claims with critical errors that require immediate attention'
    },
    warnings: {
      title: 'Warnings Queue',
      icon: AlertCircle,
      color: 'yellow',
      description: 'Claims with warnings that should be reviewed'
    },
    approved: {
      title: 'Approved Claims Queue',
      icon: CheckCircle,
      color: 'green',
      description: 'Claims that have passed validation and are ready for submission'
    }
  }

  const currentQueue = queueType ? queueConfig[queueType as keyof typeof queueConfig] : null

  useEffect(() => {
    loadClaims()
    if (queueType) {
      completeStep('queues-intro')
      if (queueType === 'critical_errors') completeStep('critical-queue')
      if (queueType === 'warnings') completeStep('warnings-queue')
      if (queueType === 'approved') completeStep('approved-queue')
    }
  }, [queueType, user])

  const loadClaims = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      let query = supabase
        .from('claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (queueType) {
        query = query.eq('queue', queueType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading claims:', error)
      } else {
        setClaims(data || [])
      }
    } catch (error) {
      console.error('Error loading claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClaims = claims.filter(claim =>
    claim.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.payer?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSeverityBadge = (errors: Array<{ severity: string; message: string }>) => {
    if (!errors || errors.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
          <CheckCircle size={12} />
          Passed
        </span>
      )
    }

    const hasError = errors.some(e => e.severity === 'error')
    if (hasError) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
          <AlertTriangle size={12} />
          {errors.filter(e => e.severity === 'error').length} Error(s)
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded">
        <AlertCircle size={12} />
        {errors.length} Warning(s)
      </span>
    )
  }

  const getTotalCharges = (charges: number[]) => {
    if (!charges || charges.length === 0) return '$0.00'
    const total = charges.reduce((sum, charge) => sum + Number(charge), 0)
    return `$${total.toFixed(2)}`
  }

  if (!currentQueue) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Queues</h1>
          <p className="mt-1 text-sm text-gray-600">
            Select a queue to view and manage claims
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(queueConfig).map(([key, config]) => {
            const Icon = config.icon
            const queueClaims = claims.filter(c => c.queue === key)

            return (
              <Link
                key={key}
                to={`/queues/${key}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-${config.color}-100`}>
                    <Icon className={`h-6 w-6 text-${config.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                    <p className="text-2xl font-bold text-gray-700 mt-1">{queueClaims.length}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">{config.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  const Icon = currentQueue.icon

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${currentQueue.color}-100`}>
              <Icon className={`h-6 w-6 text-${currentQueue.color}-600`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentQueue.title}</h1>
              <p className="mt-1 text-sm text-gray-600">{currentQueue.description}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{filteredClaims.length}</div>
          <div className="text-sm text-gray-500">Claims</div>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search claims by filename, patient, or payer..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading claims...</p>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="card text-center py-12">
          <Icon className={`mx-auto h-12 w-12 text-${currentQueue.color}-400`} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No claims found</h3>
          <p className="mt-2 text-sm text-gray-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : `No claims in the ${currentQueue.title.toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{claim.filename}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={10} />
                        {new Date(claim.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.patient_name}</div>
                      <div className="text-xs text-gray-500">ID: {claim.patient_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.payer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {claim.cpt_codes?.join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getTotalCharges(claim.charges)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(claim.validation_errors)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/claim/${claim.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={14} />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueuesPage
