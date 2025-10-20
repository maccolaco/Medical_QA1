import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/tauri'
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  X
} from 'lucide-react'
import { useClaimsStore, Claim } from '../stores/claimsStore'

const QueuesPage: React.FC = () => {
  const { queueType } = useParams<{ queueType?: string }>()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])
  const { setCurrentClaim } = useClaimsStore()

  const queueConfig = {
    critical_errors: {
      title: 'Critical Errors Queue',
      icon: AlertTriangle,
      color: 'error',
      description: 'Claims with critical errors that require immediate attention'
    },
    warnings: {
      title: 'Warnings Queue',
      icon: AlertCircle,
      color: 'warning',
      description: 'Claims with warnings that should be reviewed'
    },
    approved: {
      title: 'Approved Claims Queue',
      icon: CheckCircle,
      color: 'success',
      description: 'Claims that have passed validation and are ready for submission'
    }
  }

  const currentQueue = queueType ? queueConfig[queueType as keyof typeof queueConfig] : null

  useEffect(() => {
    loadClaims()
  }, [queueType])

  const loadClaims = async () => {
    setLoading(true)
    try {
      const queueParam = queueType ? JSON.stringify(queueType.toUpperCase()) : null
      const result = await invoke<Claim[]>('get_claims', { queue: queueParam })
      setClaims(result)
    } catch (error) {
      console.error('Error loading claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClaims = claims.filter(claim =>
    claim.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.extracted_data.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.extracted_data.payer?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectClaim = (claimId: string) => {
    setSelectedClaims(prev =>
      prev.includes(claimId)
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    )
  }

  const handleSelectAll = () => {
    if (selectedClaims.length === filteredClaims.length) {
      setSelectedClaims([])
    } else {
      setSelectedClaims(filteredClaims.map(claim => claim.id))
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'Warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800'
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentQueue?.title || 'All Queues'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {currentQueue?.description || 'Manage claims across all queues'}
          </p>
        </div>
        
        {selectedClaims.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedClaims.length} selected
            </span>
            <button className="btn btn-secondary text-sm">
              Batch Actions
            </button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search claims..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedClaims.length === filteredClaims.length && filteredClaims.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
                    <input
                      type="checkbox"
                      checked={selectedClaims.includes(claim.id)}
                      onChange={() => handleSelectClaim(claim.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {claim.filename}
                    </div>
                    <div className="text-sm text-gray-500">
                      {claim.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {claim.extracted_data.patient_name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {claim.extracted_data.payer || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {claim.validation_results.slice(0, 3).map((result) => (
                        <span
                          key={result.id}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(result.severity)}`}
                        >
                          {getSeverityIcon(result.severity)}
                          <span className="ml-1">{result.severity}</span>
                        </span>
                      ))}
                      {claim.validation_results.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{claim.validation_results.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {claim.extracted_data.charges.length > 0
                        ? formatCurrency(claim.extracted_data.charges.reduce((a, b) => a + b, 0))
                        : 'N/A'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(claim.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/claim/${claim.id}`}
                        className="text-primary-600 hover:text-primary-900"
                        onClick={() => setCurrentClaim(claim)}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {currentQueue?.icon && <currentQueue.icon className="h-12 w-12 mx-auto" />}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No claims found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'No claims match your search criteria.'
                : 'No claims in this queue yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QueuesPage

