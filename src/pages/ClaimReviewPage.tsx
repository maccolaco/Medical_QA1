import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/tauri'
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  Download,
  Send,
  RefreshCw
} from 'lucide-react'
import { useClaimsStore, Claim, ValidationResult } from '../stores/claimsStore'

const ClaimReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'validation' | 'comments'>('details')
  const [newComment, setNewComment] = useState('')
  const { updateClaim } = useClaimsStore()

  useEffect(() => {
    if (id) {
      loadClaim(id)
    }
  }, [id])

  const loadClaim = async (claimId: string) => {
    setLoading(true)
    try {
      const result = await invoke<Claim>('get_claim_by_id', { claimId })
      setClaim(result)
    } catch (error) {
      console.error('Error loading claim:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!claim) return

    setSaving(true)
    try {
      await invoke('update_claim', { claim })
      updateClaim(claim)
      // Show success message
    } catch (error) {
      console.error('Error saving claim:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReRunValidation = async () => {
    if (!claim) return

    try {
      const results = await invoke<ValidationResult[]>('run_rules', { claimId: claim.id })
      setClaim(prev => prev ? { ...prev, validation_results: results } : null)
    } catch (error) {
      console.error('Error running validation:', error)
    }
  }

  const handleApprove = async () => {
    if (!claim) return

    const updatedClaim = {
      ...claim,
      queue: 'ApprovedClaims' as const,
      status: 'Approved' as const,
      updated_at: new Date().toISOString()
    }

    setClaim(updatedClaim)
    await handleSave()
  }

  const handleAddComment = async () => {
    if (!claim || !newComment.trim()) return

    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: 'current-user', // TODO: Get from auth store
      content: newComment.trim(),
      created_at: new Date().toISOString()
    }

    const updatedClaim = {
      ...claim,
      comments: [...claim.comments, comment]
    }

    setClaim(updatedClaim)
    setNewComment('')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'border-red-200 bg-red-50'
      case 'Warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-green-200 bg-green-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Claim not found</h3>
        <p className="text-gray-500">The requested claim could not be loaded.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{claim.filename}</h1>
            <p className="text-sm text-gray-600">
              {claim.extracted_data.patient_name || 'Unknown Patient'} • 
              {claim.extracted_data.payer || 'Unknown Payer'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReRunValidation}
            className="btn btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-run Validation
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {claim.queue !== 'ApprovedClaims' && (
            <button
              onClick={handleApprove}
              className="btn btn-success"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Move to Approved Queue
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - PDF Viewer */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Document Preview</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="text-gray-500">
                <div className="text-sm">PDF Viewer</div>
                <div className="text-xs mt-1">Preview would be displayed here</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Claim Details */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'details', label: 'Claim Details' },
                { id: 'validation', label: 'Validation Results' },
                { id: 'comments', label: 'Comments' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={claim.extracted_data.patient_name || ''}
                    onChange={(e) => setClaim(prev => prev ? {
                      ...prev,
                      extracted_data: {
                        ...prev.extracted_data,
                        patient_name: e.target.value
                      }
                    } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={claim.extracted_data.patient_id || ''}
                    onChange={(e) => setClaim(prev => prev ? {
                      ...prev,
                      extracted_data: {
                        ...prev.extracted_data,
                        patient_id: e.target.value
                      }
                    } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={claim.extracted_data.payer || ''}
                    onChange={(e) => setClaim(prev => prev ? {
                      ...prev,
                      extracted_data: {
                        ...prev.extracted_data,
                        payer: e.target.value
                      }
                    } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={claim.extracted_data.provider_name || ''}
                    onChange={(e) => setClaim(prev => prev ? {
                      ...prev,
                      extracted_data: {
                        ...prev.extracted_data,
                        provider_name: e.target.value
                      }
                    } : null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider NPI
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={claim.extracted_data.provider_npi || ''}
                    onChange={(e) => setClaim(prev => prev ? {
                      ...prev,
                      extracted_data: {
                        ...prev.extracted_data,
                        provider_npi: e.target.value
                      }
                    } : null)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPT Codes
                </label>
                <div className="flex flex-wrap gap-2">
                  {claim.extracted_data.cpt_codes.map((code, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis Codes
                </label>
                <div className="flex flex-wrap gap-2">
                  {claim.extracted_data.diagnosis_codes.map((code, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charges
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  ${claim.extracted_data.charges.reduce((a, b) => a + b, 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-4">
              {claim.validation_results.map((result) => (
                <div
                  key={result.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(result.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(result.severity)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {result.rule_name}
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">
                        {result.message}
                      </p>
                      {result.suggested_fix && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900">Suggested Fix:</p>
                          <p className="text-sm text-gray-700">{result.suggested_fix}</p>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Confidence: {Math.round(result.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="input flex-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="btn btn-primary disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {claim.comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        User {comment.user_id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClaimReviewPage

